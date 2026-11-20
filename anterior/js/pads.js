/**
 * Pads — 6 botões de efeito sonoro avulso (aplausos, gargalhadas, rufar de
 * tambores...), pra usar a qualquer momento do show.
 *
 *  - Cada toque toca o som DO COMEÇO (tocar de novo reinicia). Pads
 *    diferentes podem tocar juntos (um <audio> por pad).
 *  - Os 5 primeiros vêm com sons do app (../assets/pads/); o 6º vem vazio.
 *  - O operador troca o som de qualquer pad por um arquivo seu (MP3 etc.) e
 *    muda o nome. O arquivo fica salvo no navegador (IndexedDB), então
 *    continua lá depois de fechar o app.
 *
 * Não depende do resto do app: createPads({ onError, getVolume }).
 */

const PADS_COUNT = 6;
const PADS_DB_NAME = 'playkaraoke-pads';
const PADS_STORE = 'pads';

const PAD_DEFAULTS = [
  { key: 'pad_applause_short', src: '../assets/pads/applause-short.mp3' },
  { key: 'pad_applause_long', src: '../assets/pads/applause-long.mp3' },
  { key: 'pad_laughter', src: '../assets/pads/laughter.mp3' },
  { key: 'pad_drum_roll', src: '../assets/pads/drum-roll.mp3' },
  { key: 'pad_horn', src: '../assets/pads/horn.mp3' },
  null,
];

function openPadsDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB indisponível')); return; }
    const req = indexedDB.open(PADS_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PADS_STORE)) db.createObjectStore(PADS_STORE, { keyPath: 'index' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * @param {object} opts
 * @param {(i18nKey: string) => void} [opts.onError]
 * @param {() => number} [opts.getVolume] - volume 0–1 na hora de tocar
 */
function createPads({ onError, getVolume } = {}) {
  // { name: string|null, custom: {blob, fileName}|null, cleared: bool }
  const state = Array.from({ length: PADS_COUNT }, () => ({ name: null, custom: null, cleared: false }));
  const audios = [];
  const urls = [];

  function srcFor(i) {
    const s = state[i];
    if (s.cleared) return null;
    if (s.custom) {
      if (!urls[i]) urls[i] = URL.createObjectURL(s.custom.blob);
      return urls[i];
    }
    return PAD_DEFAULTS[i] ? PAD_DEFAULTS[i].src : null;
  }

  function dropAudio(i) {
    if (audios[i]) { audios[i].pause(); audios[i] = null; }
    if (urls[i]) { URL.revokeObjectURL(urls[i]); urls[i] = null; }
  }

  async function save(i) {
    try {
      const db = await openPadsDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(PADS_STORE, 'readwrite');
        const s = state[i];
        tx.objectStore(PADS_STORE).put({ index: i, name: s.name, cleared: s.cleared, blob: s.custom ? s.custom.blob : null, fileName: s.custom ? s.custom.fileName : null });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[Pads] Não foi possível salvar o pad', i + 1, err);
    }
  }

  async function restore() {
    let rows = [];
    try {
      const db = await openPadsDB();
      rows = await new Promise((resolve, reject) => {
        const req = db.transaction(PADS_STORE, 'readonly').objectStore(PADS_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return; // sem IndexedDB: ficam os pads padrão
    }
    for (const r of rows) {
      if (!(r.index >= 0 && r.index < PADS_COUNT)) continue;
      dropAudio(r.index);
      state[r.index] = { name: r.name || null, cleared: !!r.cleared, custom: r.blob ? { blob: r.blob, fileName: r.fileName || '' } : null };
    }
  }

  function getPads() {
    return state.map((s, i) => ({
      name: s.name,
      defaultKey: !s.cleared && !s.custom && PAD_DEFAULTS[i] ? PAD_DEFAULTS[i].key : null,
      hasSound: !!srcFor(i),
      fileName: s.custom ? s.custom.fileName : null,
    }));
  }

  /** Toca o pad do começo. Retorna false se o pad está vazio. */
  function fire(i) {
    const src = srcFor(i);
    if (!src) return false;
    let a = audios[i];
    if (!a) { a = new Audio(src); a.preload = 'auto'; audios[i] = a; }
    try { a.currentTime = 0; } catch (err) { /* ainda sem metadados */ }
    a.volume = Math.max(0, Math.min(1, getVolume ? getVolume() : 1));
    const p = a.play();
    if (p && p.catch) p.catch(err => { console.warn('[Pads] Não foi possível tocar o pad', i + 1, err); if (onError) onError('err_pad_play'); });
    return true;
  }

  async function setSound(i, file) {
    if (!file || !/^audio\//.test(file.type || '') && !/\.(mp3|wav|m4a|aac|ogg|oga|flac)$/i.test(file.name || '')) {
      if (onError) onError('err_pad_file');
      return false;
    }
    dropAudio(i);
    state[i].custom = { blob: file, fileName: file.name };
    state[i].cleared = false;
    await save(i);
    return true;
  }

  function rename(i, name) {
    const trimmed = String(name || '').trim().slice(0, 24);
    state[i].name = trimmed || null;
    save(i);
  }

  async function clear(i) {
    dropAudio(i);
    state[i] = { name: null, custom: null, cleared: true };
    await save(i);
  }

  async function restoreDefaults() {
    for (let i = 0; i < PADS_COUNT; i++) {
      dropAudio(i);
      state[i] = { name: null, custom: null, cleared: false };
    }
    try {
      const db = await openPadsDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(PADS_STORE, 'readwrite');
        tx.objectStore(PADS_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) { /* nada salvo */ }
  }

  return { getPads, fire, setSound, rename, clear, restoreDefaults, restore, count: PADS_COUNT };
}

window.createPads = createPads;
