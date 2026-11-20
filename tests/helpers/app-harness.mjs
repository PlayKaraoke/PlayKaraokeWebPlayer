/**
 * Monta o app real (index.html + js/*.js) dentro do jsdom, com stubs só
 * para o que o jsdom não implementa (canvas, mídia, Web Audio,
 * BroadcastChannel). O app.js é carregado como script comum (o import do
 * audio-engine.js é trocado por um motor falso) e ganha um objeto
 * `window.__test` com acesso ao estado interno — só existe nos testes.
 */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

/** Motor de áudio falso: mesma API pública do AudioEngine real. */
function createFakeEngineClass(win) {
  return class FakeAudioEngine extends win.EventTarget {
    constructor() {
      super();
      this._playing = false;
      this._time = 0;
      this._duration = 0;
      this._semitones = 0;
      this._volume = 0.9;
      this._cbs = [];
      this.loadedBuffers = [];
      this.stopCalls = 0;
    }
    setPreferredBackend() {}
    onTimeUpdate(cb) { this._cbs.push(cb); }
    async loadArrayBuffer(buf) { this.stop(); this.loadedBuffers.push(buf); this._duration = buf && buf.duration ? buf.duration : 180; this._time = 0; }
    async play() { if (this._playing) return; this._playing = true; this.dispatchEvent(new win.Event('play')); }
    pause() { if (!this._playing) return; this._playing = false; this.dispatchEvent(new win.Event('pause')); }
    stop() { this.stopCalls++; this._playing = false; this._time = 0; }
    toggle() { this._playing ? this.pause() : this.play(); }
    seekTo(sec) { this._time = sec; }
    setPitchSemitones(n) { this._semitones = n; }
    getPitchSemitones() { return this._semitones; }
    setVolume(v) { this._volume = v; }
    getVolume() { return this._volume; }
    getCurrentTime() { return this._time; }
    getDuration() { return this._duration; }
    isPlaying() { return this._playing; }
    async ensureVideoPitchSupport() { return true; }
    attachVideoElement() { return true; }
    isVideoPitchRouted() { return true; }
    getAnalyser() { return { fftSize: 32, getByteTimeDomainData: (d) => d.fill(128) }; }
    /** Helper de teste: simula o fim natural da música. */
    finish() { this._playing = false; this.dispatchEvent(new win.Event('ended')); }
  };
}

function installDomStubs(win) {
  const fakeCtx = {
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {}, drawImage() {}, fillRect() {},
    set fillStyle(v) {}, set imageSmoothingEnabled(v) {}, set imageSmoothingQuality(v) {},
  };
  win.HTMLCanvasElement.prototype.getContext = () => fakeCtx;

  // <video>/<audio>: o jsdom não implementa reprodução — simulamos o
  // mínimo (paused, play/pause com eventos, duration configurável).
  const proto = win.HTMLMediaElement.prototype;
  Object.defineProperty(proto, 'paused', { configurable: true, get() { return this._paused !== false; } });
  Object.defineProperty(proto, 'duration', { configurable: true, get() { return this._duration || 200; } });
  Object.defineProperty(proto, 'currentTime', { configurable: true, get() { return this._ct || 0; }, set(v) { this._ct = v; } });
  proto.play = function () { if (this._paused === false) return Promise.resolve(); this._paused = false; this.dispatchEvent(new win.Event('play')); return Promise.resolve(); };
  proto.pause = function () { if (this._paused === false) { this._paused = true; this.dispatchEvent(new win.Event('pause')); } };
  proto.load = function () {};
  Object.defineProperty(proto, 'readyState', { configurable: true, get() { return this.getAttribute('src') ? 1 : 0; } });

  // BroadcastChannel falso: guarda o que foi enviado e deixa o teste
  // simular mensagens chegando da segunda tela (win.__fromSecondScreen).
  win.__channels = [];
  win.BroadcastChannel = class {
    constructor() { this.sent = []; this.listeners = []; win.__channels.push(this); }
    postMessage(m) { this.sent.push(m); }
    addEventListener(_, fn) { this.listeners.push(fn); }
    close() {}
  };
  win.__fromSecondScreen = (msg) => win.__channels.forEach(c => c.listeners.forEach(fn => fn({ data: msg })));
  win.__sentToSecondScreen = () => win.__channels.flatMap(c => c.sent);
  win.URL.createObjectURL = () => 'blob:fake/' + Math.random().toString(36).slice(2);
  win.URL.revokeObjectURL = () => {};
  // window.open falso: a "segunda tela" fica aberta até o teste fechar.
  win.open = () => { const w = { closed: false, focus() {}, close() { this.closed = true; } }; win.__secondWindow = w; return w; };
}

/**
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.localStorage] - estado inicial do localStorage
 * @param {(win: Window) => void} [opts.beforeApp] - roda antes do app.js (ex: stubar a Biblioteca)
 */
const openDoms = [];
/** Fecha todas as janelas jsdom criadas (limpa timers como o polling da segunda tela). */
export function closeAllApps() {
  while (openDoms.length) openDoms.pop().window.close();
}

export async function createApp(opts = {}) {
  const html = read('index.html')
    // Os <script> do HTML são executados manualmente abaixo (na ordem certa, com stubs).
    .replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const win = dom.window;
  openDoms.push(dom);

  for (const [k, v] of Object.entries(opts.localStorage || {})) win.localStorage.setItem(k, v);

  installDomStubs(win);
  for (const f of ['js/cdg-player.js', 'js/file-loader.js', 'js/library.js', 'js/i18n.js', 'js/singers.js', 'js/online-search.js', 'js/youtube-player.js', 'js/ambient-playlist.js', 'js/pads.js', 'js/ticker.js']) {
    win.eval(read(f));
  }

  // Player do YouTube falso (mesma API de js/youtube-player.js).
  win.createYouTubePlayer = (host, cbs = {}) => {
    const p = {
      videoId: null, playing: false, time: 0, duration: 200, volume: 0.9, loads: [],
      async load(id, o = {}) { this.videoId = id; this.playing = false; this.time = o.startAt || 0; this.loads.push(id); if (o.autoplay) this.play(); },
      play() { if (!this.videoId || this.playing) return; this.playing = true; cbs.onPlay && cbs.onPlay(); },
      pause() { if (!this.playing) return; this.playing = false; cbs.onPause && cbs.onPause(); },
      stop() { this.playing = false; },
      clear() { this.stop(); this.videoId = null; }, setMuted() {},
      seekTo(t) { this.time = t; }, setVolume(v) { this.volume = v; },
      getCurrentTime() { return this.time; }, getDuration() { return this.videoId ? this.duration : 0; },
      isPlaying() { return this.playing; }, getVideoId() { return this.videoId; },
      /** Helper de teste: simula o fim do vídeo. */
      finish() { this.playing = false; cbs.onEnded && cbs.onEnded(); },
    };
    win.__ytPlayer = p;
    return p;
  };
  // Busca Online falsa: opts.onlineResults (array) ou opts.onlineError (código).
  win.createOnlineSearch = () => ({
    isConfigured: () => true,
    searches: [],
    async search(q) {
      win.__onlineSearches = (win.__onlineSearches || []).concat(q);
      if (opts.onlineError) { const e = new Error(opts.onlineError); e.code = opts.onlineError; throw e; }
      return opts.onlineResults || [];
    },
  });

  // Arquivos falsos: o conteúdo é irrelevante, o loader falso decide pelo nome.
  win.loadKaraokeFile = async (file) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.mp4')) return { type: 'video', title: file.name, videoBlobUrl: 'blob:fake/' + file.name };
    return { type: 'cdg', title: file.name, cdgBuffer: new ArrayBuffer(24 * 10), audioBuffer: { duration: 180, name: file.name } };
  };

  win.AudioEngine = createFakeEngineClass(win);
  if (opts.beforeApp) opts.beforeApp(win);

  const appSrc = read('js/app.js').replace(
    /^import \{ AudioEngine \} from '\.\/audio-engine\.js(\?v=[\d.]+)?';$/m,
    'const AudioEngine = window.AudioEngine;'
  );
  const testHook = `
;window.__test = {
  engine, videoEl, audioEl, library, singerManager, ytPlayer: ytLocal, ytLocal, ytRemote,
  get secondScreenPlayer() { return secondScreenPlayer; },
  get playlist() { return playlist; },
  get currentIndex() { return currentIndex; },
  get mode() { return mode; },
  get showHistory() { return showHistory; },
  get singerModeEnabled() { return singerModeEnabled; },
  selectTrack, addFilesToQueue, removeFromPlaylist, handleTrackEnded, openShowReport, buildShowCsv,
  actuallyEnableSingerMode,
  ready: appReady,
};`;
  win.eval(appSrc + testHook);
  await win.__test.ready;
  await flush();
  return { dom, win, t: win.__test, $: (id) => win.document.getElementById(id) };
}

/** Espera todas as Promises/timers de 0ms pendentes. */
export async function flush(times = 5) {
  for (let i = 0; i < times; i++) await new Promise((r) => setTimeout(r, 0));
}

/** Cria um File falso do jsdom com o nome dado. */
export function fakeFile(win, name) {
  return new win.File(['x'], name);
}
