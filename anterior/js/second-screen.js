/**
 * Second Screen — script da janela separada usada como "segunda tela"
 * (pra arrastar pro monitor voltado pro cantor). Não tem áudio nem
 * controles: só recebe, via BroadcastChannel, o mesmo CDG/vídeo e o tempo
 * atual que a janela principal está tocando, e mantém isso sincronizado
 * aqui — a janela principal continua sendo a única fonte de áudio.
 *
 * Quando nada está tocando na janela principal (parado, pausado, ou na
 * espera do autoplay), mostra a logo (ou uma imagem customizada, se
 * configurada) centralizada em vez de deixar o último frame congelado.
 */

(function () {
  const canvasWrap = document.getElementById('canvas-wrap');
  const videoWrap = document.getElementById('video-wrap');
  const youtubeWrap = document.getElementById('youtube-wrap');
  const canvas = document.getElementById('cdg-canvas');
  const videoEl = document.getElementById('video-el');
  const fsBtn = document.getElementById('fs-btn');
  const idleOverlay = document.getElementById('idle-overlay');
  const idleLogo = document.getElementById('idle-logo');
  const idleCustomImage = document.getElementById('idle-custom-image');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const cdNumber = document.getElementById('cd-number');
  const cdNextTitle = document.getElementById('cd-next-title');
  const cdSingerHighlight = document.getElementById('cd-singer-highlight');
  const cdSingerNameDisplay = document.getElementById('cd-singer-name-display');
  const cdSingerSongDisplay = document.getElementById('cd-singer-song-display');
  const cdUpcomingList = document.getElementById('cd-upcoming-list');

  fsBtn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Erro ao entrar/sair de tela cheia:', err);
    }
  });

  const cdgPlayer = new CDGPlayer(canvas);
  cdgPlayer.setRenderMode('smooth');

  let mode = null; // 'cdg' | 'video' | 'youtube' | null (nada carregado ainda)
  // Player do YouTube só é criado (e a API baixada) na primeira música Online.
  let ytPlayer = null;
  let ytVideoId = null;
  // true = esta janela é o player principal do YouTube (com som, comandado
  // pela tela principal). false = cópia muda que só acompanha a principal.
  let ytRemoteMode = false;
  function getYtPlayer() {
    if (!ytPlayer) {
      ytPlayer = window.createYouTubePlayer(document.getElementById('youtube-host'), {
        muted: true,
        onPlay: onYtStateChange,
        onPause: onYtStateChange,
        onTime: reportYtState,
        onEnded: () => {
          updateVisibility();
          if (ytRemoteMode) channel.postMessage({ type: 'yt-ended', videoId: ytVideoId });
        },
        onError: (code) => { if (ytRemoteMode) channel.postMessage({ type: 'yt-error', videoId: ytVideoId, code }); },
      });
    }
    return ytPlayer;
  }
  function onYtStateChange() {
    updateVisibility();
    reportYtState();
  }

  /** Modo player principal: conta pra tela principal onde o vídeo está. */
  function reportYtState() {
    if (!ytRemoteMode || !ytPlayer) return;
    channel.postMessage({
      type: 'yt-state', videoId: ytVideoId,
      currentTime: ytPlayer.getCurrentTime(), duration: ytPlayer.getDuration(), playing: ytPlayer.isPlaying(),
    });
  }
  let isPlayingState = false;
  let countdownActive = false;
  let lastVideoUrl = null;

  function applyIdleImage(dataUrl) {
    if (dataUrl) {
      idleLogo.classList.add('hidden');
      idleCustomImage.classList.remove('hidden');
      idleCustomImage.style.backgroundImage = `url(${dataUrl})`;
    } else {
      idleLogo.classList.remove('hidden');
      idleCustomImage.classList.add('hidden');
      idleCustomImage.style.backgroundImage = '';
    }
  }

  /** Decide o que mostrar: countdown (prioridade), canvas/vídeo (se tocando), ou a tela ociosa. */
  function updateVisibility() {
    countdownOverlay.classList.toggle('hidden', !countdownActive);
    if (countdownActive) {
      idleOverlay.classList.add('hidden');
      canvasWrap.classList.add('hidden');
      videoWrap.classList.add('hidden');
      // Como player principal, o iframe nunca é escondido (escondido ele pode
      // parar) — a contagem fica por cima dele.
      youtubeWrap.classList.toggle('hidden', !(ytRemoteMode && mode === 'youtube'));
      syncVideoPlayback();
      return;
    }
    // YouTube: o que vale é o player DESTA tela estar tocando de fato.
    // Carregando, pausado ou encerrado, o player do YouTube desenha por cima
    // do vídeo título, "Mais vídeos", ícone de pausa... — nesses momentos
    // mostramos a nossa tela de espera no lugar. O iframe continua
    // exibido (só coberto), senão ele não consegue começar a tocar.
    const ytPlaying = mode === 'youtube' && !!ytPlayer && ytPlayer.isPlaying();
    const showingMedia = mode === 'youtube' ? ytPlaying : (isPlayingState && mode !== null);
    idleOverlay.classList.toggle('hidden', showingMedia);
    canvasWrap.classList.toggle('hidden', !showingMedia || mode !== 'cdg');
    videoWrap.classList.toggle('hidden', !showingMedia || mode !== 'video');
    youtubeWrap.classList.toggle('hidden', mode !== 'youtube' || !(isPlayingState || ytRemoteMode));
    syncVideoPlayback();
  }

  /** O vídeo (mudo) só roda enquanto está visível — escondido na tela
   * ociosa/contagem ele continuava decodificando à toa. */
  function syncVideoPlayback() {
    const shouldPlay = !countdownActive && isPlayingState && mode === 'video';
    if (shouldPlay && videoEl.paused && videoEl.src) videoEl.play().catch(() => {});
    else if (!shouldPlay && !videoEl.paused) videoEl.pause();

    if (ytPlayer && ytVideoId && !ytRemoteMode) { // no modo player principal, quem manda é a tela principal
      const ytShouldPlay = !countdownActive && isPlayingState && mode === 'youtube';
      if (ytShouldPlay && !ytPlayer.isPlaying()) ytPlayer.play();
      else if (!ytShouldPlay && ytPlayer.isPlaying()) ytPlayer.pause();
    }
  }

  if (!('BroadcastChannel' in window)) {
    idleLogo.style.opacity = '0.15'; // sinal visual discreto de que algo não está certo
    return;
  }

  const channel = new BroadcastChannel('playkaraoke-second-screen');

  // ---- Sincronia do YouTube com a tela principal ----
  // Cada seek no YouTube congela o vídeo por um instante (ele recarrega o
  // trecho). Corrigir a cada pequena diferença deixava a segunda tela
  // "travando" (congela, anda, atrasa, congela...). Por isso:
  //  - só corrige se o atraso persistir por várias leituras seguidas (o
  //    tempo que o YouTube informa oscila — uma leitura isolada engana);
  //  - desconta o atraso da própria mensagem (sentAt);
  //  - ao corrigir um atraso, pula um pouco À FRENTE, compensando o tempo
  //    que o player leva pra voltar a tocar depois do seek;
  //  - espera um intervalo mínimo entre correções;
  //  - diferença grande (ex: operador arrastou a barra) corrige na hora.
  const YT_DRIFT_TOLERANCE_SEC = 0.35;
  const YT_DRIFT_READINGS = 3;        // ~0,75s de atraso persistente (mensagens a cada 250ms)
  const YT_BIG_JUMP_SEC = 3;
  const YT_SEEK_LEAD_SEC = 0.3;
  const YT_MIN_SEEK_INTERVAL_MS = 4000;
  let ytDriftReadings = 0;
  let ytLastSeekAt = 0;

  function syncYouTube(msg) {
    if (ytRemoteMode) return; // aqui é a fonte do tempo, não quem acompanha
    if (!ytPlayer || !ytVideoId || !ytPlayer.isPlaying()) { ytDriftReadings = 0; return; }
    const now = Date.now();
    const transit = msg.sentAt ? Math.min(1, Math.max(0, (now - msg.sentAt) / 1000)) : 0;
    const target = msg.currentTime + transit;
    const drift = ytPlayer.getCurrentTime() - target; // < 0 = segunda tela atrasada
    const absDrift = Math.abs(drift);

    if (absDrift <= YT_DRIFT_TOLERANCE_SEC) { ytDriftReadings = 0; return; }
    ytDriftReadings++;
    const bigJump = absDrift >= YT_BIG_JUMP_SEC;
    if (!bigJump && (ytDriftReadings < YT_DRIFT_READINGS || now - ytLastSeekAt < YT_MIN_SEEK_INTERVAL_MS)) return;

    ytPlayer.seekTo(target + (drift < 0 ? YT_SEEK_LEAD_SEC : 0));
    ytLastSeekAt = now;
    ytDriftReadings = 0;
  }

  function renderCountdownContent(msg) {
    if (msg.labels) {
      const cdLabelEl = document.querySelector('#countdown-timer-parts .cd-label');
      const aSeguirEl = document.querySelector('.cd-a-seguir-label');
      const proximasEl = document.querySelector('.cd-proximas-label');
      if (cdLabelEl) cdLabelEl.textContent = msg.labels.cdLabel;
      if (aSeguirEl) aSeguirEl.textContent = msg.labels.aSeguir;
      if (proximasEl) proximasEl.textContent = msg.labels.proximas;
    }

    if (!msg.singerMode) {
      cdSingerHighlight.classList.add('hidden');
      cdUpcomingList.innerHTML = '';
      cdNextTitle.classList.remove('hidden');
      cdNextTitle.textContent = msg.nextTitle || '';
      return;
    }

    cdNextTitle.classList.add('hidden');
    const timerParts = document.getElementById('countdown-timer-parts');
    if (timerParts) timerParts.classList.toggle('hidden', !!msg.timerless);
    const display = msg.display || { upcoming: true, titles: true, counter: true };
    cdNumber.classList.toggle('hidden', !display.counter);
    cdSingerHighlight.classList.remove('hidden');
    cdSingerNameDisplay.textContent = (msg.singer && msg.singer.name) || '—';
    if (msg.singer && msg.singer.song && display.titles) {
      cdSingerSongDisplay.classList.remove('hidden');
      cdSingerSongDisplay.textContent = [msg.singer.song.title, msg.singer.song.artist].filter(Boolean).join(' — ');
    } else {
      cdSingerSongDisplay.classList.add('hidden');
    }

    cdUpcomingList.innerHTML = '';
    const upcomingSection = document.getElementById('cd-upcoming-section');
    if (upcomingSection) upcomingSection.classList.toggle('hidden', !display.upcoming);
    if (display.upcoming && Array.isArray(msg.upcoming)) {
      msg.upcoming.forEach((s) => {
        const row = document.createElement('div');
        row.className = 'cd-upcoming-row';
        const posBadge = document.createElement('span');
        posBadge.className = 'pos-badge';
        posBadge.textContent = String(s.position || '');
        const nameBadge = document.createElement('span');
        nameBadge.className = 'name-badge';
        nameBadge.textContent = s.name;
        row.appendChild(posBadge);
        row.appendChild(nameBadge);
        if (display.titles && s.song) {
          const songText = document.createElement('span');
          songText.className = 'song-info';
          songText.textContent = [s.song.title, s.song.artist].filter(Boolean).join(' - ');
          row.appendChild(songText);
        }
        cdUpcomingList.appendChild(row);
      });
    }
  }

  channel.addEventListener('message', (e) => {
    const msg = e.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'init-cdg': {
        if (ytPlayer) { ytPlayer.stop(); }
        ytRemoteMode = false;
        cdgPlayer.load(msg.cdgBuffer);
        if (msg.colors) cdgPlayer.setCustomColors(msg.colors);
        mode = 'cdg';
        updateVisibility();
        break;
      }
      case 'init-youtube': {
        if (!videoEl.paused) videoEl.pause();
        mode = 'youtube';
        ytRemoteMode = !!msg.remote;
        const player = getYtPlayer();
        player.setMuted(!ytRemoteMode);
        if (ytRemoteMode && typeof msg.volume === 'number') player.setVolume(msg.volume);
        // Como player principal, sempre (re)carrega no ponto pedido (troca de
        // tela no meio da música). Como cópia muda, só se o vídeo mudou.
        if (ytRemoteMode || msg.videoId !== ytVideoId) {
          ytVideoId = msg.videoId;
          ytDriftReadings = 0;
          ytLastSeekAt = 0;
          const videoId = msg.videoId;
          player.load(videoId, { autoplay: ytRemoteMode && !!msg.autoplay, startAt: msg.startAt || 0 })
            .then(() => {
              if (ytRemoteMode && videoId === ytVideoId) {
                channel.postMessage({ type: 'yt-loaded', videoId, duration: player.getDuration() });
                reportYtState();
              } else {
                syncVideoPlayback();
              }
            })
            .catch(() => {});
        }
        updateVisibility();
        break;
      }
      case 'yt-command': {
        if (!ytRemoteMode || !ytPlayer) break;
        if (msg.cmd === 'play') ytPlayer.play();
        else if (msg.cmd === 'pause') ytPlayer.pause();
        else if (msg.cmd === 'stop') ytPlayer.stop();
        else if (msg.cmd === 'seek') ytPlayer.seekTo(msg.value);
        else if (msg.cmd === 'volume') ytPlayer.setVolume(msg.value);
        reportYtState();
        break;
      }
      case 'init-video': {
        if (ytPlayer) { ytPlayer.stop(); }
        ytRemoteMode = false;
        if (msg.videoUrl !== lastVideoUrl) {
          videoEl.src = msg.videoUrl;
          lastVideoUrl = msg.videoUrl;
        }
        mode = 'video';
        updateVisibility();
        break;
      }
      case 'time': {
        if (mode === 'cdg') {
          cdgPlayer.update(msg.currentTime);
        } else if (mode === 'youtube') {
          syncYouTube(msg);
        } else if (mode === 'video') {
          // Corrige deriva sem forçar o tempo a cada mensagem (evita
          // engasgo por ficar resetando o currentTime toda hora).
          if (Math.abs(videoEl.currentTime - msg.currentTime) > 0.4) {
            videoEl.currentTime = msg.currentTime;
          }
        }
        break;
      }
      case 'playing': {
        isPlayingState = true;
        updateVisibility();
        break;
      }
      case 'idle': {
        isPlayingState = false;
        updateVisibility();
        break;
      }
      case 'render-mode': {
        cdgPlayer.setLightMode(!!msg.light);
        break;
      }
      case 'colors': {
        cdgPlayer.setCustomColors(msg.colors || null);
        break;
      }
      case 'idle-image': {
        applyIdleImage(msg.dataUrl || null);
        break;
      }
      case 'countdown-start': {
        countdownActive = true;
        cdNumber.textContent = String(msg.remaining);
        renderCountdownContent(msg);
        updateVisibility();
        break;
      }
      case 'countdown-tick': {
        cdNumber.textContent = String(msg.remaining);
        break;
      }
      case 'countdown-end': {
        countdownActive = false;
        updateVisibility();
        break;
      }
      case 'clear': {
        if (!videoEl.paused) videoEl.pause();
        if (ytPlayer) ytPlayer.clear();
        ytVideoId = null;
        ytRemoteMode = false;
        mode = null;
        isPlayingState = false;
        countdownActive = false;
        updateVisibility();
        break;
      }
    }
  });

  // Avisa a janela principal que já está pronta pra receber o estado atual
  // (ela responde reenviando o CDG/vídeo + tempo em andamento + a imagem
  // de fundo customizada, se houver).
  channel.postMessage({ type: 'ready' });
  // Fechando/recarregando: a tela principal retoma a mídia na hora (sem
  // esperar perceber que a janela fechou).
  window.addEventListener('pagehide', () => channel.postMessage({ type: 'bye' }));

  // Mantém o vídeo mudo sempre — o áudio já toca na janela principal, não
  // queremos duas fontes de som ao mesmo tempo.
  videoEl.muted = true;
  videoEl.addEventListener('canplay', syncVideoPlayback);

  updateVisibility(); // estado inicial: tela ociosa (nada tocando ainda)
})();
