/**
 * Ambient Playlist — de onde vem a música ambiente e em que ordem ela toca.
 *
 * Duas fontes:
 *  - 'builtin': as faixas que acompanham o app (../assets/ambient/).
 *  - 'custom': uma pasta de músicas do próprio usuário. No Chrome/Edge/Opera
 *    a pasta fica lembrada entre sessões (File System Access API, handle
 *    guardado no IndexedDB); nos outros navegadores, escolhida via
 *    <input webkitdirectory> e vale só até fechar a aba.
 *
 * Ordem: aleatória e sem repetir — cada "rodada" é um embaralhamento
 * completo da lista; só quando todas tocaram começa outra rodada (e a
 * primeira da nova rodada nunca é a última da anterior).
 */

const AMBIENT_AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.aac', '.ogg', '.wav', '.flac'];
const AMBIENT_DB_NAME = 'playkaraoke-ambient';
const AMBIENT_DB_STORE = 'folder';
const AMBIENT_SOURCE_KEY = 'playkaraoke-ambient-source';

function isAmbientAudioFile(name) {
  const lower = name.toLowerCase();
  return !name.startsWith('.') && AMBIENT_AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function openAmbientDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AMBIENT_DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(AMBIENT_DB_STORE)) req.result.createObjectStore(AMBIENT_DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function ambientDbSet(value) {
  const db = await openAmbientDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AMBIENT_DB_STORE, 'readwrite');
    tx.objectStore(AMBIENT_DB_STORE).put(value, 'current');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function ambientDbGet() {
  const db = await openAmbientDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(AMBIENT_DB_STORE, 'readonly').objectStore(AMBIENT_DB_STORE).get('current');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function collectAudioHandles(dirHandle, out) {
  for await (const entry of dirHandle.values()) {
    if (entry.name.startsWith('.') || entry.name === '__MACOSX') continue;
    if (entry.kind === 'directory') await collectAudioHandles(entry, out);
    else if (isAmbientAudioFile(entry.name)) out.push(entry);
  }
}

/**
 * @param {object} opts
 * @param {string[]} opts.builtinTracks - URLs das faixas que acompanham o app
 * @param {() => void} [opts.onChange] - fonte/pasta mudou (atualizar a interface)
 */
function createAmbientPlaylist({ builtinTracks, onChange }) {
  const supportsFolderPicker = 'showDirectoryPicker' in window;
  let source = 'builtin';
  try { if (localStorage.getItem(AMBIENT_SOURCE_KEY) === 'custom') source = 'custom'; } catch (err) {}

  // Pasta própria: { name, items: [{ name, getFile() }], needsPermission, handle? }
  let folder = null;
  let bag = [];          // índices ainda não tocados nesta rodada
  let lastIndex = -1;
  let currentUrl = null; // blob: da faixa própria atual (liberado na próxima)

  const notify = () => { if (onChange) onChange(); };

  /** Lista que está valendo agora (a própria só se estiver pronta). */
  function activeList() {
    if (source === 'custom' && folder && !folder.needsPermission && folder.items.length) return folder.items;
    return null;
  }
  function usingCustom() { return !!activeList(); }

  function resetRound() { bag = []; lastIndex = -1; }

  /** Próxima posição da rodada (Fisher-Yates a cada rodada, sem repetir). */
  function nextIndex(length) {
    if (length <= 1) return 0;
    if (!bag.length) {
      bag = Array.from({ length }, (_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // A primeira da rodada nova não repete a última da anterior.
      if (bag[bag.length - 1] === lastIndex) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    lastIndex = bag.pop();
    return lastIndex;
  }

  /** URL da próxima faixa a tocar. */
  async function next() {
    const custom = activeList();
    if (!custom) return builtinTracks[nextIndex(builtinTracks.length)];
    // Arquivo pode ter sumido/ficado ilegível: tenta alguns antes de desistir.
    for (let attempt = 0; attempt < Math.min(5, custom.length); attempt++) {
      const item = custom[nextIndex(custom.length)];
      try {
        const file = await item.getFile();
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = URL.createObjectURL(file);
        return currentUrl;
      } catch (err) {
        console.warn('[Ambiente] Não foi possível ler', item.name, err);
      }
    }
    return builtinTracks[nextIndex(builtinTracks.length)];
  }

  function setSource(newSource) {
    source = newSource === 'custom' ? 'custom' : 'builtin';
    try { localStorage.setItem(AMBIENT_SOURCE_KEY, source); } catch (err) {}
    resetRound();
    notify();
  }

  async function registerFromHandle(handle, { save }) {
    const handles = [];
    await collectAudioHandles(handle, handles);
    folder = { name: handle.name, handle, needsPermission: false, items: handles.map(h => ({ name: h.name, getFile: () => h.getFile() })) };
    if (save) { try { await ambientDbSet({ handle }); } catch (err) { console.warn('[Ambiente] Pasta não pôde ser salva:', err); } }
    resetRound();
    notify();
  }

  /** Botão "Escolher pasta". Resolve com true se uma pasta foi escolhida. */
  async function chooseFolder(fileInputFallback) {
    if (supportsFolderPicker) {
      let handle;
      try {
        handle = await window.showDirectoryPicker({ id: 'playkaraoke-ambient', mode: 'read' });
      } catch (err) {
        return false; // cancelado
      }
      await registerFromHandle(handle, { save: true });
      return true;
    }
    // Safari/Firefox: <input webkitdirectory> (vale só nesta sessão).
    return new Promise((resolve) => {
      fileInputFallback.onchange = () => {
        const files = Array.from(fileInputFallback.files || []).filter(f => isAmbientAudioFile(f.name));
        fileInputFallback.value = '';
        if (!files.length) { resolve(false); return; }
        const first = files[0].webkitRelativePath || '';
        folder = { name: first.split('/')[0] || '—', needsPermission: false, items: files.map(f => ({ name: f.name, getFile: async () => f })) };
        resetRound();
        notify();
        resolve(true);
      };
      fileInputFallback.click();
    });
  }

  /** Pasta salva numa sessão anterior (Chrome/Edge/Opera). */
  async function restore() {
    if (!supportsFolderPicker) return;
    let saved = null;
    try { saved = await ambientDbGet(); } catch (err) { return; }
    if (!saved || !saved.handle) return;
    try {
      const perm = await saved.handle.queryPermission({ mode: 'read' });
      if (perm === 'granted') await registerFromHandle(saved.handle, { save: false });
      else { folder = { name: saved.handle.name, handle: saved.handle, needsPermission: true, items: [] }; notify(); }
    } catch (err) {
      console.warn('[Ambiente] Não foi possível restaurar a pasta:', err);
    }
  }

  /** O navegador pede permissão de novo depois de reiniciar: 1 clique resolve. */
  async function reconnect() {
    if (!folder || !folder.handle) return false;
    try {
      const perm = await folder.handle.requestPermission({ mode: 'read' });
      if (perm !== 'granted') return false;
      await registerFromHandle(folder.handle, { save: false });
      return true;
    } catch (err) {
      return false;
    }
  }

  return {
    next, setSource, chooseFolder, restore, reconnect,
    getSource: () => source,
    usingCustom,
    getFolder: () => (folder ? { name: folder.name, count: folder.items.length, needsPermission: folder.needsPermission } : null),
  };
}

window.createAmbientPlaylist = createAmbientPlaylist;
