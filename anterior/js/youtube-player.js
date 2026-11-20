/**
 * YouTube Player — embrulha o player oficial do YouTube (IFrame Player API)
 * numa API parecida com a do AudioEngine, pra o app tratar músicas Online
 * igual às locais (play/pause/seek/volume/fim de música).
 *
 * Limitações (da plataforma, não do código): o áudio de um player do
 * YouTube não é acessível pela página — por isso NÃO há ajuste de tom nem
 * detecção de silêncio pros aplausos nessas músicas. Anúncios podem
 * aparecer (vêm do próprio YouTube e não podem ser bloqueados).
 *
 * O script da API só é baixado na primeira vez que uma música Online é
 * carregada.
 */

const YT_API_URL = 'https://www.youtube.com/iframe_api';
const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
let ytApiPromise = null;

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === 'function') previous();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = YT_API_URL;
      script.async = true;
      script.onerror = () => {
        ytApiPromise = null; // permite tentar de novo (ex: a internet voltou)
        reject(new Error('youtube_api_load_failed'));
      };
      document.head.appendChild(script);
    });
  }
  return ytApiPromise;
}

/**
 * @param {HTMLElement} hostEl - elemento onde o iframe do player é criado
 * @param {object} [opts]
 * @param {boolean} [opts.muted] - segunda tela: sempre mudo
 * @param {() => void} [opts.onPlay]
 * @param {() => void} [opts.onPause]
 * @param {() => void} [opts.onEnded]
 * @param {(code: number) => void} [opts.onError] - códigos do YouTube (101/150 = embed bloqueado, 100 = removido)
 * @param {(currentTime: number, duration: number) => void} [opts.onTime] - ~4x/s enquanto toca
 */
function createYouTubePlayer(hostEl, opts = {}) {
  let player = null;
  let readyPromise = null;
  let playing = false;
  let videoId = null;
  let volume = 0.9;
  let timeTimerId = null;
  let cueWaiter = null;
  let muted = !!opts.muted;

  function ensurePlayer() {
    if (readyPromise) return readyPromise;
    readyPromise = loadYouTubeApi().then(YT => new Promise((resolve) => {
      const mount = document.createElement('div');
      hostEl.appendChild(mount);
      player = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1,
          iv_load_policy: 3, modestbranding: 1,
        },
        events: {
          onReady: () => {
            if (muted) player.mute(); else player.setVolume(Math.round(volume * 100));
            resolve(player);
          },
          onStateChange: (e) => handleState(e.data),
          onError: (e) => {
            if (cueWaiter) { cueWaiter(); cueWaiter = null; }
            if (opts.onError) opts.onError(e.data);
          },
        },
      });
    })).catch(err => {
      readyPromise = null;
      throw err;
    });
    return readyPromise;
  }

  function handleState(state) {
    if (state === YT_STATE.CUED || state === YT_STATE.PLAYING) {
      if (cueWaiter) { cueWaiter(); cueWaiter = null; }
    }
    if (state === YT_STATE.PLAYING) {
      if (!playing) { playing = true; startTimeUpdates(); if (opts.onPlay) opts.onPlay(); }
    } else if (state === YT_STATE.PAUSED) {
      if (playing) { playing = false; stopTimeUpdates(); if (opts.onPause) opts.onPause(); }
    } else if (state === YT_STATE.ENDED) {
      const wasPlaying = playing;
      playing = false;
      stopTimeUpdates();
      if (wasPlaying && opts.onEnded) opts.onEnded();
    }
  }

  function startTimeUpdates() {
    stopTimeUpdates();
    timeTimerId = setInterval(() => {
      if (opts.onTime && player) opts.onTime(getCurrentTime(), getDuration());
    }, 250);
  }
  function stopTimeUpdates() {
    if (timeTimerId) { clearInterval(timeTimerId); timeTimerId = null; }
  }

  /** Carrega um vídeo. Com autoplay:false fica "engatilhado" (pausado).
   * startAt (segundos): começa desse ponto (troca de tela no meio da música). */
  async function load(id, { autoplay = false, startAt = 0 } = {}) {
    await ensurePlayer();
    videoId = id;
    playing = false;
    stopTimeUpdates();
    await new Promise((resolve) => {
      cueWaiter = resolve;
      setTimeout(() => { if (cueWaiter === resolve) { cueWaiter = null; resolve(); } }, 8000);
      const args = { videoId: id, startSeconds: Math.max(0, startAt || 0) };
      if (autoplay) player.loadVideoById(args); else player.cueVideoById(args);
    });
  }

  /** Liga/desliga o som (a segunda tela começa muda e passa a ter som
   * quando vira o player principal). */
  function setMuted(m) {
    muted = !!m;
    if (!player) return;
    if (muted) player.mute();
    else { player.unMute(); player.setVolume(Math.round(volume * 100)); }
  }

  function play() { if (player && videoId) player.playVideo(); }
  function pause() { if (player && videoId) player.pauseVideo(); }

  /** Para sem disparar onEnded (troca de música, stop). */
  function stop() {
    if (player && videoId) {
      playing = false;
      stopTimeUpdates();
      try { player.stopVideo(); } catch (err) { /* player ainda carregando */ }
    }
  }

  /** Descarrega o vídeo (palco vazio). */
  function clear() {
    stop();
    videoId = null;
  }

  function seekTo(sec) { if (player && videoId) player.seekTo(Math.max(0, sec), true); }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (player && !muted && player.setVolume) player.setVolume(Math.round(volume * 100));
  }

  function getCurrentTime() { return player && videoId && player.getCurrentTime ? (player.getCurrentTime() || 0) : 0; }
  function getDuration() { return player && videoId && player.getDuration ? (player.getDuration() || 0) : 0; }

  return {
    load, play, pause, stop, clear, seekTo, setVolume, setMuted,
    getCurrentTime, getDuration,
    isPlaying: () => playing,
    getVideoId: () => videoId,
  };
}

window.createYouTubePlayer = createYouTubePlayer;
