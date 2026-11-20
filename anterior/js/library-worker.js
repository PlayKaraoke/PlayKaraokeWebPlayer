/**
 * Library Worker — índice e busca da Biblioteca numa thread separada.
 *
 * Por que existe: com um HD de 200 mil arquivos, escanear e guardar o
 * índice na thread da página deixava o Chrome (e, em notebook antigo, o
 * computador inteiro) lento. Aqui:
 *   - o escaneamento, o índice e a busca rodam fora da thread da interface
 *     (a tela e a letra do CDG nunca travam);
 *   - o índice é ENXUTO: só texto (nome do arquivo, pasta e texto de busca)
 *     — nada de guardar um "handle" do navegador por arquivo. O arquivo é
 *     localizado pelo caminho só na hora de tocar (library.js);
 *   - é salvo no IndexedDB em blocos (sem um "put" gigante que congela).
 *
 * Mensagens recebidas ({ id, cmd, ... }) → resposta { id, result } ou
 * { id, error }. Mensagens espontâneas: { type: 'progress', folderId, count }.
 *   scan   { folderId, folderName, handle }  → { count, scannedAt, cancelled }
 *   cancel { folderId }
 *   load   { folderId }                      → { count, scannedAt } | null
 *   remove { folderId }
 *   search { query }                         → itens (até MAX_RESULTS)
 *   find   { folderId, name }                → item | null
 *
 * Também roda fora de uma Worker (testes): createLibraryIndexCore(post, idb).
 */

const LIB_MAX_RESULTS = 60;
const LIB_CHUNK_SIZE = 20000;
const LIB_PROGRESS_EVERY = 2000;
const LIB_INDEX_DB = 'playkaraoke-library-index';

function libStripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function createLibraryIndexCore(post, idb, parseName) {
  // folderId -> { name, dirs: string[], names: string[], dirIdx: number[], texts: string[], scannedAt }
  const folders = new Map();
  const cancelled = new Set();

  // ---------- IndexedDB (blocos) ----------
  function openDb() {
    return new Promise((resolve, reject) => {
      const req = idb.open(LIB_INDEX_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'folderId' });
        if (!db.objectStoreNames.contains('chunks')) db.createObjectStore('chunks', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function txDone(tx) {
    return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  }
  function getReq(store, key) {
    return new Promise((resolve, reject) => {
      const r = store.get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }

  async function deleteSaved(db, folderId, chunkCount) {
    const tx = db.transaction(['meta', 'chunks'], 'readwrite');
    tx.objectStore('meta').delete(folderId);
    for (let n = 0; n < chunkCount; n++) tx.objectStore('chunks').delete(folderId + ':' + n);
    await txDone(tx);
  }

  async function save(folderId, f) {
    const db = await openDb();
    const old = await getReq(db.transaction('meta', 'readonly').objectStore('meta'), folderId);
    if (old) await deleteSaved(db, folderId, old.chunks);
    const chunks = Math.ceil(f.names.length / LIB_CHUNK_SIZE);
    for (let n = 0; n < chunks; n++) {
      const from = n * LIB_CHUNK_SIZE, to = from + LIB_CHUNK_SIZE;
      const tx = db.transaction('chunks', 'readwrite');
      tx.objectStore('chunks').put({ key: folderId + ':' + n, names: f.names.slice(from, to), dirIdx: f.dirIdx.slice(from, to) });
      await txDone(tx); // um bloco por transação
    }
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put({ folderId, name: f.name, dirs: f.dirs, count: f.names.length, chunks, scannedAt: f.scannedAt });
    await txDone(tx);
  }

  // ---------- Índice ----------
  function textFor(name) {
    const p = parseName(name);
    return libStripAccents([p.title, p.artist, p.code].filter(Boolean).join(' ').toLowerCase());
  }

  function isKaraokeFile(name) {
    if (name.startsWith('.')) return false; // fantasmas "._Nome.zip" do macOS etc.
    const lower = name.toLowerCase();
    return lower.endsWith('.zip') || lower.endsWith('.mp4');
  }

  async function scan({ folderId, folderName, handle }) {
    cancelled.delete(folderId);
    const f = { name: folderName, dirs: [''], names: [], dirIdx: [], texts: [], scannedAt: Date.now() };
    const dirPaths = new Map([['', 0]]);

    async function walk(dirHandle, relPath) {
      let myIdx = dirPaths.get(relPath);
      // Uma subpasta ilegível ("System Volume Information", sem permissão,
      // HD piscando) é pulada; antes derrubava o escaneamento inteiro.
      try {
        for await (const entry of dirHandle.values()) {
          if (cancelled.has(folderId)) return;
          if (entry.name.startsWith('.') || entry.name === '__MACOSX') continue; // ocultos de sistema
          if (entry.kind === 'directory') {
            const childPath = relPath ? relPath + '/' + entry.name : entry.name;
            dirPaths.set(childPath, f.dirs.length);
            f.dirs.push(childPath);
            await walk(entry, childPath);
          } else if (entry.kind === 'file' && isKaraokeFile(entry.name)) {
            f.names.push(entry.name);
            f.dirIdx.push(myIdx);
            f.texts.push(textFor(entry.name));
            if (f.names.length % LIB_PROGRESS_EVERY === 0) post({ type: 'progress', folderId, count: f.names.length });
          }
        }
      } catch (err) {
        if (relPath === '') throw err; // a própria pasta escolhida falhou: aí é erro de verdade
      }
    }

    await walk(handle, '');
    if (cancelled.has(folderId)) {
      cancelled.delete(folderId);
      return { cancelled: true, count: folders.has(folderId) ? folders.get(folderId).names.length : 0 };
    }
    folders.set(folderId, f);
    try { await save(folderId, f); } catch (err) { /* índice fica só na memória desta sessão */ }
    return { count: f.names.length, scannedAt: f.scannedAt, cancelled: false };
  }

  async function load({ folderId }) {
    let db;
    try { db = await openDb(); } catch (err) { return null; }
    const meta = await getReq(db.transaction('meta', 'readonly').objectStore('meta'), folderId);
    if (!meta) return null;
    const f = { name: meta.name, dirs: meta.dirs, names: [], dirIdx: [], texts: [], scannedAt: meta.scannedAt };
    for (let n = 0; n < meta.chunks; n++) {
      const chunk = await getReq(db.transaction('chunks', 'readonly').objectStore('chunks'), folderId + ':' + n);
      if (!chunk) return null; // salvo incompleto: força reescanear
      for (let i = 0; i < chunk.names.length; i++) {
        f.names.push(chunk.names[i]);
        f.dirIdx.push(chunk.dirIdx[i]);
        f.texts.push(textFor(chunk.names[i]));
      }
    }
    folders.set(folderId, f);
    return { count: f.names.length, scannedAt: f.scannedAt };
  }

  async function remove({ folderId }) {
    const f = folders.get(folderId);
    folders.delete(folderId);
    try {
      const db = await openDb();
      const meta = await getReq(db.transaction('meta', 'readonly').objectStore('meta'), folderId);
      await deleteSaved(db, folderId, meta ? meta.chunks : 0);
    } catch (err) { /* nada salvo */ }
    return !!f;
  }

  function toItem(folderId, f, i) {
    const name = f.names[i];
    const p = parseName(name);
    const isMp4 = name.toLowerCase().endsWith('.mp4');
    const dir = f.dirs[f.dirIdx[i]];
    return {
      folderId, folderName: f.name, name,
      path: dir ? dir.split('/') : [],
      code: p.code, artist: p.artist, title: p.title,
      format: isMp4 ? 'MP4' : 'MP3+G', type: isMp4 ? 'video' : 'cdg',
    };
  }

  function search({ query }) {
    const words = libStripAccents(String(query || '').trim().toLowerCase()).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const out = [];
    for (const [folderId, f] of folders) {
      const texts = f.texts;
      for (let i = 0; i < texts.length; i++) {
        const t = texts[i];
        let ok = true;
        for (let w = 0; w < words.length; w++) { if (!t.includes(words[w])) { ok = false; break; } }
        if (ok) {
          out.push(toItem(folderId, f, i));
          if (out.length >= LIB_MAX_RESULTS) return out;
        }
      }
    }
    return out;
  }

  function find({ folderId, name }) {
    const f = folders.get(folderId);
    if (!f) return null;
    const i = f.names.indexOf(name);
    return i === -1 ? null : toItem(folderId, f, i);
  }

  const commands = {
    scan, load, remove, search, find,
    cancel: ({ folderId }) => { cancelled.add(folderId); return true; },
  };

  /** Trata uma mensagem { id, cmd, ... } e responde com post(). */
  async function handle(msg) {
    const fn = commands[msg.cmd];
    try {
      const result = fn ? await fn(msg) : undefined;
      post({ id: msg.id, result });
    } catch (err) {
      post({ id: msg.id, error: (err && err.message) || String(err) });
    }
  }

  return { handle };
}

// Rodando como Web Worker de verdade: liga a mensageria.
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  importScripts('file-loader.js'); // parseKaraokeFilename
  const core = createLibraryIndexCore((m) => self.postMessage(m), self.indexedDB, self.parseKaraokeFilename);
  self.onmessage = (e) => core.handle(e.data);
}
