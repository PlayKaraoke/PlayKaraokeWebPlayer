/**
 * Library — indexa pastas locais (HD externo, etc.) usando a File System
 * Access API do navegador, permitindo buscar por nome/artista/código sem
 * precisar arrastar cada arquivo manualmente.
 *
 * Só funciona em navegadores baseados em Chromium (Chrome, Edge, Opera) —
 * Safari e Firefox não implementam essa API. Detectamos isso e escondemos
 * a funcionalidade graciosamente nesse caso, sem quebrar o resto do app.
 *
 * Como funciona:
 *   1. Usuário concede acesso a uma pasta (showDirectoryPicker) — uma vez.
 *      O FileSystemDirectoryHandle fica no IndexedDB, pra não pedir de novo
 *      toda vez que o app abre.
 *   2. O escaneamento, o índice e a busca rodam numa thread separada
 *      (js/library-worker.js) — com HD de 200 mil arquivos, fazer isso na
 *      thread da página deixava o computador inteiro lento. O índice é só
 *      texto (nome + pasta) e fica salvo entre sessões: abrir o app não
 *      reescaneia o HD (botão "Atualizar" reescaneia quando o usuário quer).
 *   3. Quando o usuário escolhe um resultado, o arquivo é localizado pelo
 *      caminho a partir da pasta conectada e lido do disco — sem rede.
 */

const LIBRARY_DB_NAME = 'playkaraoke-library';
// v3: o índice saiu deste banco (store "indexes", com um handle por
// arquivo — pesado demais com HD grande) e foi pro da worker, em blocos.
const LIBRARY_DB_VERSION = 3;
const LIBRARY_STORE = 'folders';

const SUPPORTS_FILE_SYSTEM_ACCESS = 'showDirectoryPicker' in window;

let connectedFolders = []; // { id, name, handle, fileCount, scanning, progress, needsPermission, scannedAt }

// ---------- IndexedDB (pastas conectadas) ----------

function openLibraryDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LIBRARY_DB_NAME, LIBRARY_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LIBRARY_STORE)) db.createObjectStore(LIBRARY_STORE, { keyPath: 'id' });
      if (db.objectStoreNames.contains('indexes')) db.deleteObjectStore('indexes'); // índice antigo (v2)
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPutFolder(id, name, handle) {
  const db = await openLibraryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LIBRARY_STORE, 'readwrite');
    tx.objectStore(LIBRARY_STORE).put({ id, name, handle });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAllFolders() {
  const db = await openLibraryDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(LIBRARY_STORE, 'readonly').objectStore(LIBRARY_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbDeleteFolder(id) {
  const db = await openLibraryDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LIBRARY_STORE, 'readwrite');
    tx.objectStore(LIBRARY_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function st(key, fallback, vars) {
  if (window.i18n && typeof window.i18n.t === 'function') return window.i18n.t(key, vars);
  let str = fallback;
  if (vars) Object.keys(vars).forEach(k => { str = str.split(`{${k}}`).join(vars[k]); });
  return str;
}

// ---------- API pública do módulo ----------

/**
 * @param {object} callbacks
 * @param {(folders: object[]) => void} callbacks.onFoldersChange
 * @param {() => void} callbacks.onIndexChange
 * @param {(msg: string) => void} callbacks.onError
 * @param {() => Worker} [callbacks.createWorker] - testes: worker simulada
 */
function createLibrary({ onFoldersChange, onIndexChange, onError, createWorker }) {
  function notifyFolders() { onFoldersChange(connectedFolders); }
  function notifyIndex() { onIndexChange(); }

  // ---- Conversa com a worker (pedido -> resposta por id) ----
  let worker = null;
  let nextId = 0;
  const pending = new Map();

  function getWorker() {
    if (worker) return worker;
    worker = createWorker ? createWorker() : new Worker('js/library-worker.js');
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        const folder = connectedFolders.find(f => f.id === msg.folderId);
        if (folder) { folder.progress = msg.count; notifyFolders(); }
        return;
      }
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error)); else p.resolve(msg.result);
    };
    return worker;
  }

  function call(cmd, payload) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      getWorker().postMessage({ id, cmd, ...payload });
    });
  }

  function upsertFolder(id, name, handle, fields) {
    let folder = connectedFolders.find(f => f.id === id);
    if (!folder) {
      folder = { id, name, handle, fileCount: 0, scanning: false, progress: 0, needsPermission: false, scannedAt: null };
      connectedFolders.push(folder);
    }
    Object.assign(folder, fields);
    return folder;
  }

  async function scanAndRegister(id, name, handle) {
    upsertFolder(id, name, handle, { scanning: true, progress: 0, needsPermission: false });
    notifyFolders();
    let res = null;
    try {
      res = await call('scan', { folderId: id, folderName: name, handle });
    } catch (err) {
      console.error('[Library] Erro ao escanear pasta:', err);
      onError(st('err_library_scan_fail', `Não foi possível escanear a pasta "${name}".`, { name }));
    }
    const fields = { scanning: false, progress: 0 };
    if (res && !res.cancelled) Object.assign(fields, { fileCount: res.count, scannedAt: res.scannedAt });
    upsertFolder(id, name, handle, fields);
    notifyFolders();
    notifyIndex();
  }

  /** Usa o índice salvo da pasta, se existir; senão escaneia. */
  async function loadIndexOrScan(id, name, handle) {
    let saved = null;
    try { saved = await call('load', { folderId: id }); } catch (err) { /* sem índice salvo */ }
    if (saved) {
      upsertFolder(id, name, handle, { fileCount: saved.count, scannedAt: saved.scannedAt, scanning: false, needsPermission: false });
      notifyFolders();
      notifyIndex();
      return;
    }
    await scanAndRegister(id, name, handle);
  }

  async function connectNewFolder() {
    if (!SUPPORTS_FILE_SYSTEM_ACCESS) {
      onError(st('err_library_unsupported', 'Seu navegador não suporta essa funcionalidade (funciona no Chrome, Edge e Opera).'));
      return;
    }
    let handle;
    try {
      handle = await window.showDirectoryPicker();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[Library] Erro ao abrir seletor de pasta:', err);
        onError(st('err_library_picker_fail', 'Não foi possível abrir o seletor de pasta.'));
      }
      return; // usuário cancelou, ou erro — não faz nada
    }
    // Mesma pasta conectada de novo: só reescaneia a existente (evita
    // resultados duplicados na busca).
    for (const f of connectedFolders) {
      try {
        if (await f.handle.isSameEntry(handle)) {
          await scanAndRegister(f.id, f.name, f.handle);
          return;
        }
      } catch (err) { /* handle antigo inválido — segue o fluxo normal */ }
    }
    const id = 'folder_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    try {
      await dbPutFolder(id, handle.name, handle);
    } catch (err) {
      console.warn('[Library] Não foi possível salvar a pasta pra próxima sessão:', err);
    }
    await scanAndRegister(id, handle.name, handle);
  }

  async function reconnectFolder(id) {
    const folder = connectedFolders.find(f => f.id === id);
    if (!folder) return;
    try {
      const perm = await folder.handle.requestPermission({ mode: 'read' });
      if (perm === 'granted') {
        await loadIndexOrScan(id, folder.name, folder.handle);
      } else {
        onError(st('err_library_permission_denied', 'Permissão não concedida — a pasta continua desconectada.'));
      }
    } catch (err) {
      console.error('[Library] Erro ao reconectar pasta:', err);
      onError(st('err_library_reconnect_fail', 'Não foi possível reconectar essa pasta.'));
    }
  }

  /** Botão "Atualizar": reescaneia a pasta (arquivos novos/removidos no HD). */
  async function rescanFolder(id) {
    const folder = connectedFolders.find(f => f.id === id);
    if (!folder || folder.scanning) return;
    await scanAndRegister(id, folder.name, folder.handle);
  }

  /** Botão "Cancelar" durante o escaneamento (mantém o índice anterior). */
  function cancelScan(id) {
    return call('cancel', { folderId: id });
  }

  async function removeFolder(id) {
    connectedFolders = connectedFolders.filter(f => f.id !== id);
    try { await call('remove', { folderId: id }); } catch (err) { /* nada salvo */ }
    try {
      await dbDeleteFolder(id);
    } catch (err) {
      console.warn('[Library] Erro ao remover pasta do armazenamento:', err);
    }
    notifyFolders();
    notifyIndex();
  }

  async function restoreSavedFolders() {
    if (!SUPPORTS_FILE_SYSTEM_ACCESS) return;
    let saved;
    try {
      saved = await dbGetAllFolders();
    } catch (err) {
      console.warn('[Library] Erro ao carregar pastas salvas:', err);
      return;
    }
    for (const { id, name, handle } of saved) {
      try {
        const perm = await handle.queryPermission({ mode: 'read' });
        if (perm === 'granted') {
          await loadIndexOrScan(id, name, handle);
        } else {
          upsertFolder(id, name, handle, { needsPermission: true });
          notifyFolders();
        }
      } catch (err) {
        console.warn('[Library] Não foi possível restaurar a pasta', name, err);
      }
    }
  }

  /**
   * Busca por múltiplas palavras (todas precisam aparecer, em qualquer
   * ordem), ignorando acentos e maiúsculas — "planta certeza" acha "Planta
   * e Raiz - Com Certeza", "voce" acha "Você". Roda na worker; retorna até
   * 60 itens { folderId, folderName, name, path, code, artist, title, format, type }.
   */
  async function search(query) {
    if (!String(query || '').trim() || !connectedFolders.some(f => f.fileCount)) return [];
    return call('search', { query });
  }

  /** Item salvo numa sessão anterior (restauração da fila após F5). */
  async function findByFolderAndName(folderId, name) {
    if (!connectedFolders.some(f => f.id === folderId && f.fileCount)) return null;
    try { return await call('find', { folderId, name }); } catch (err) { return null; }
  }

  /** Lê o arquivo do disco, localizando pelo caminho a partir da pasta conectada. */
  async function getFileForItem(item) {
    const folder = connectedFolders.find(f => f.id === item.folderId);
    if (!folder) throw new Error('Pasta da Biblioteca não conectada.');
    let dir = folder.handle;
    for (const segment of item.path || []) dir = await dir.getDirectoryHandle(segment);
    const fileHandle = await dir.getFileHandle(item.name);
    return fileHandle.getFile();
  }

  return {
    isSupported: () => SUPPORTS_FILE_SYSTEM_ACCESS,
    connectNewFolder,
    reconnectFolder,
    rescanFolder,
    cancelScan,
    removeFolder,
    restoreSavedFolders,
    search,
    getFileForItem,
    getConnectedFolders: () => connectedFolders,
    getIndexSize: () => connectedFolders.reduce((n, f) => n + (f.fileCount || 0), 0),
    findByFolderAndName,
  };
}

window.createLibrary = createLibrary;
