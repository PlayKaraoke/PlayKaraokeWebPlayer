// ?v= igual ao do index.html: muda a cada versão pra o navegador não usar
// um arquivo velho do cache (o GitHub Pages manda guardar por 10 min).
import { AudioEngine } from './audio-engine.js?v=3.1.1';

const el = (id) => document.getElementById(id);

// ---------- Elementos ----------

const dropZone = el('stage-empty');
const fileInput = el('file-input');
const stageEmpty = el('stage-empty');
const stageCanvasWrap = el('stage-canvas-wrap');
const stageVideoWrap = el('stage-video-wrap');
const cdgCanvas = el('cdg-canvas');
const videoEl = el('video-el');
const stageYoutubeWrap = el('stage-youtube-wrap');
const stageRemotePlaceholder = el('stage-remote-placeholder');
// Com a segunda tela aberta, o MP4 toca SÓ o áudio aqui (neste <audio>) e o
// vídeo é decodificado só lá — metade do processamento.
const audioEl = el('audio-el');
const fullscreenBtn = el('fullscreen-btn');

const metaCode = el('meta-code');
const metaArtist = el('meta-artist');
const metaSong = el('meta-song');
const metaFormat = el('meta-format');
const metaSinger = el('meta-singer');
const metaSingerField = el('meta-singer-field');

const playBtn = el('play-btn');
const stopBtn = el('stop-btn');
const restartBtn = el('restart-btn');
const playIcon = el('play-icon');
const pauseIcon = el('pause-icon');
const nextBtn = el('next-btn');
const seekBar = el('seek-bar');
const timeCurrent = el('time-current');
const timeDuration = el('time-duration');

const volumeSlider = el('volume-slider');
const volumePct = el('volume-pct');
const pitchDownBtn = el('pitch-down-btn');
const pitchUpBtn = el('pitch-up-btn');
const pitchValue = el('pitch-value');
const pitchResetBtn = el('pitch-reset-btn');

const errorBanner = el('error-banner');
const loadingBanner = el('loading-banner');

const settingsBtn = el('settings-btn');
const autoplayToggleIndicator = el('autoplay-toggle-indicator');
const ambientToggleIndicator = el('ambient-toggle-indicator');
const customColorsToggleIndicator = el('custom-colors-toggle-indicator');
const showModeBtn = el('show-mode-btn');
const showModeBtnLabel = el('show-mode-btn-label');
const settingsModalBackdrop = el('settings-modal-backdrop');
const settingsCloseBtn = el('settings-close-btn');
const customColorsToggle = el('custom-colors-toggle');
const colorBackground = el('color-background');
const colorText = el('color-text');
const colorHighlight = el('color-highlight');
const applauseToggle = el('applause-toggle');
const applauseAudio = el('applause-audio');

const autoplayToggle = el('autoplay-toggle');
const autoplayDelayInput = el('autoplay-delay-input');

const ambientToggle = el('ambient-toggle');
const ambientVolumeSlider = el('ambient-volume-slider');
const ambientVolumePct = el('ambient-volume-pct');
const ambientAudio = el('ambient-audio');

const countdownOverlay = el('countdown-overlay');
const countdownTimerParts = el('countdown-timer-parts');
const cdNumber = el('cd-number');
const cdNextTitle = el('cd-next-title');
const cdSkipBtn = el('cd-skip-btn');

const sidebarDropzone = el('sidebar-dropzone');
const playlistEl = el('playlist');
const playlistCount = el('playlist-count');

const clearQueueBtn = el('clear-queue-btn');
const addSingerBtn = el('add-singer-btn');

const searchBox = el('search');
const searchInput = el('search-input');
const searchClearBtn = el('search-clear-btn');
const searchResults = el('search-results');
const searchSourceDeviceBtn = el('search-source-device-btn');
const searchSourceOnlineBtn = el('search-source-online-btn');

const cdSingerHighlight = el('cd-singer-highlight');
const cdUpcomingSection = el('cd-upcoming-section');
const cdSingerNameDisplay = el('cd-singer-name-display');
const cdSingerSongDisplay = el('cd-singer-song-display');
const cdSingerToneDisplay = el('cd-singer-tone-display');
const cdUpcomingList = el('cd-upcoming-list');
const cdShowUpcomingToggle = el('cd-show-upcoming-toggle');
const cdShowTitlesToggle = el('cd-show-titles-toggle');
const cdShowCounterToggle = el('cd-show-counter-toggle');

const openManageSingersBtn = el('open-manage-singers-btn');
const manageSingersSidebarBtn = el('manage-singers-sidebar-btn');
const manageSingersBackdrop = el('manage-singers-backdrop');
const manageSingersCloseBtn = el('manage-singers-close-btn');
const manageSingersList = el('manage-singers-list');
const addNewSingerBtn = el('add-new-singer-btn');
const manageSingersEmpty = el('manage-singers-empty');
const manageSingersDetail = el('manage-singers-detail');
const detailSingerName = el('detail-singer-name');
const detailEditNameBtn = el('detail-edit-name-btn');
const detailSingNextBtn = el('detail-sing-next-btn');
const detailSingLastBtn = el('detail-sing-last-btn');
const detailTableBtn = el('detail-table-btn');
const detailAwayBtn = el('detail-away-btn');
const detailTabQueueBtn = el('detail-tab-queue-btn');
const detailTabHistoryBtn = el('detail-tab-history-btn');
const detailQueuePanel = el('detail-queue-panel');
const detailHistoryPanel = el('detail-history-panel');
const detailQueueList = el('detail-queue-list');
const detailHistoryList = el('detail-history-list');
const detailAddSongBtn = el('detail-add-song-btn');
const detailUploadFileBtn = el('detail-upload-file-btn');
const detailUploadFileInput = el('detail-upload-file-input');
const detailAddSongSearch = el('detail-add-song-search');
const detailSongSearchInput = el('detail-song-search-input');
const detailSongSearchResults = el('detail-song-search-results');

const endShowConfirmBackdrop = el('end-show-confirm-backdrop');
const endShowConfirmCancelBtn = el('end-show-confirm-cancel-btn');
const endShowConfirmOkBtn = el('end-show-confirm-ok-btn');
const showReportBackdrop = el('show-report-backdrop');
const showReportCloseBtn = el('show-report-close-btn');
const reportDuration = el('report-duration');
const reportTotalSongs = el('report-total-songs');
const reportUniqueSingers = el('report-unique-singers');
const reportHighlight = el('report-highlight');
const showReportTbody = el('show-report-tbody');
const exportCsvBtn = el('export-csv-btn');
const newShowBtn = el('new-show-btn');

const singerRoundView = el('singer-round-view');
const currentSingerEmpty = el('current-singer-empty');
const singerListFull = el('singer-list-full');
let singerDragFromIndex = null;

const singerPickerBackdrop = el('singer-picker-backdrop');
const singerPickerFilename = el('singer-picker-filename');
const singerPickerInput = el('singer-picker-input');
const singerPickerList = el('singer-picker-list');
const singerPickerCancelBtn = el('singer-picker-cancel-btn');
const libraryFoldersList = el('library-folders-list');
const connectFolderBtn = el('connect-folder-btn');
const libraryUnsupported = el('library-unsupported');

const openSecondBtn = el('open-second-btn');
const secondScreenStatus = el('second-screen-status');

const quickSecondScreenBtn = el('quick-second-screen-btn');
const quickAutoplayBtn = el('quick-autoplay-btn');
const quickApplauseBtn = el('quick-applause-btn');
const quickAmbientBtn = el('quick-ambient-btn');

const idleOverlay = el('idle-overlay');
const idleLogo = el('idle-logo');
const idleCustomImage = el('idle-custom-image');
const idleImageInput = el('idle-image-input');
const idleImageUploadBtn = el('idle-image-upload-btn');
const idleImageRemoveBtn = el('idle-image-remove-btn');
const idleImageFilename = el('idle-image-filename');

const trackModalBackdrop = el('track-modal-backdrop');
const tmCode = el('tm-code');
const tmArtist = el('tm-artist');
const tmFormat = el('tm-format');
const tmTitle = el('tm-title');
const tmPitchDownBtn = el('tm-pitch-down-btn');
const tmPitchUpBtn = el('tm-pitch-up-btn');
const tmPitchValue = el('tm-pitch-value');
const tmCancelBtn = el('tm-cancel-btn');
const tmPlayBtn = el('tm-play-btn');
const tmApplyBtn = el('tm-apply-btn');

// ---------- Motores ----------

const engine = new AudioEngine();
const cdgPlayer = new CDGPlayer(cdgCanvas);

// O motor de áudio em thread separada (AudioWorklet) é o padrão — deixa o
// desenho da letra bem mais fluido, já que o processamento de áudio não
// compete mais pela mesma thread. Se não for suportado no navegador, cai
// sozinho pro motor padrão (ScriptProcessorNode) sem quebrar nada.
engine.setPreferredBackend('worklet');
engine.addEventListener('backendchange', (e) => {
  if (e.detail.fallback) {
    console.warn('[App] Motor de thread separada não disponível aqui, usando o padrão. Motivo:', e.detail.reason);
  }
});

// CDG sempre renderiza suavizado — o formato é nativamente 300x216px (TV
// dos anos 90), então "nítido" só deixava tudo visivelmente quadriculado
// sem ganho real de qualidade.
cdgPlayer.setRenderMode('smooth');

// Cores personalizadas ficam DESLIGADAS por padrão — o usuário liga
// explicitamente no painel de configurações se quiser recolorir.
cdgPlayer.setCustomColors(null);

// Músicas Online (YouTube) tocam pelo player oficial do YouTube. Sem ajuste
// de tom e sem detecção de silêncio (o áudio do iframe não é acessível) —
// ver js/youtube-player.js.
//
// "Segunda tela como player principal": com a segunda tela aberta, a mídia
// pesada (vídeo do YouTube / vídeo do MP4) roda SÓ lá, e esta janela vira
// painel de controle. Pro YouTube, o player de verdade (com som) fica na
// segunda tela e aqui fica um "controle remoto" (ytRemote) com a mesma
// interface do player local — o resto do app usa yt() e não precisa saber
// onde o vídeo está tocando.
let secondScreenPlayer = false; // true = segunda tela aberta, pronta, e tocando a mídia

/** Eventos de um player do YouTube — ignorados se ele não for o ativo. */
// YouTube só diz "tocando" depois do buffering: nesse meio tempo a música
// ambiente achava que estava tudo parado e subia por cima do começo.
let ytStarting = false;
let ytStartingTimer = null;
function setYtStarting(on) {
  ytStarting = on;
  clearTimeout(ytStartingTimer);
  if (on) ytStartingTimer = setTimeout(() => { ytStarting = false; refreshIdleState(); }, 15000); // nunca começou
}

function ytCallbacksFor(getSelf) {
  const active = () => getSelf() === yt();
  return {
    onPlay: () => { if (!active()) return; setYtStarting(false); updatePlayIcon(); refreshIdleState(); },
    onPause: () => { if (!active()) return; setYtStarting(false); updatePlayIcon(); refreshIdleState(); },
    onEnded: () => {
      if (!active()) return;
      setYtStarting(false);
      updatePlayIcon();
      if (mode === 'youtube') handleTrackEnded();
      refreshIdleState();
    },
    onError: () => {
      if (!active()) return;
      setYtStarting(false);
      refreshIdleState();
      if (mode === 'youtube') showError(window.i18n.t('youtube_err_unavailable'));
    },
    onTime: (currentTime, duration) => {
      if (!active() || mode !== 'youtube') return;
      checkApplause(currentTime, duration);
      // Player local: a segunda tela (muda) se sincroniza por aqui. sentAt:
      // ela desconta o atraso da mensagem. Player remoto: ela é a fonte.
      if (!secondScreenPlayer) broadcastToSecondScreen({ type: 'time', currentTime, duration, sentAt: Date.now() });
      if (seeking) return;
      seekBar.max = String(Math.floor(duration * 1000));
      seekBar.value = String(Math.floor(currentTime * 1000));
      timeCurrent.textContent = formatTime(currentTime);
      timeDuration.textContent = formatTime(duration);
    },
  };
}

/** "Controle remoto" do player do YouTube que roda na segunda tela.
 * Manda comandos por BroadcastChannel e recebe o estado de volta
 * (yt-loaded / yt-state / yt-ended / yt-error, ver second-screen.js). */
function createRemoteYouTubePlayer(cbs) {
  let videoId = null;
  let playing = false;
  let time = 0;
  let timeAt = 0;
  let duration = 0;
  let volume = 0.9;
  let loadWaiter = null;
  const command = (cmd, value) => broadcastToSecondScreen({ type: 'yt-command', cmd, value });

  return {
    async load(id, { autoplay = false, startAt = 0 } = {}) {
      videoId = id;
      playing = false;
      time = startAt;
      timeAt = Date.now();
      duration = 0;
      await new Promise((resolve) => {
        loadWaiter = { id, resolve };
        setTimeout(() => { if (loadWaiter && loadWaiter.resolve === resolve) { loadWaiter = null; resolve(); } }, 8000);
        broadcastToSecondScreen({ type: 'init-youtube', videoId: id, remote: true, autoplay, startAt, volume });
      });
    },
    play() { if (videoId) command('play'); },
    pause() { if (videoId) command('pause'); },
    stop() { if (videoId) { playing = false; command('stop'); } },
    clear() { this.stop(); videoId = null; },
    seekTo(t) { time = t; timeAt = Date.now(); if (videoId) command('seek', t); },
    setVolume(v) { volume = v; if (videoId) command('volume', v); },
    getCurrentTime() { return playing ? time + (Date.now() - timeAt) / 1000 : time; },
    getDuration() { return duration; },
    isPlaying() { return playing; },
    getVideoId() { return videoId; },
    /** Mensagens da segunda tela sobre o player dela. */
    handleMessage(msg) {
      if (!videoId || msg.videoId !== videoId) return;
      if (msg.type === 'yt-loaded') {
        duration = msg.duration || duration;
        if (loadWaiter && loadWaiter.id === msg.videoId) { const r = loadWaiter.resolve; loadWaiter = null; r(); }
      } else if (msg.type === 'yt-state') {
        time = msg.currentTime || 0;
        timeAt = Date.now();
        duration = msg.duration || duration;
        if (!!msg.playing !== playing) {
          playing = !!msg.playing;
          if (playing) cbs.onPlay(); else cbs.onPause();
        }
        if (playing) cbs.onTime(time, duration);
      } else if (msg.type === 'yt-ended') {
        playing = false;
        cbs.onEnded();
      } else if (msg.type === 'yt-error') {
        cbs.onError(msg.code);
      }
    },
  };
}

const ytLocal = window.createYouTubePlayer(el('youtube-host'), ytCallbacksFor(() => ytLocal));
const ytRemote = createRemoteYouTubePlayer(ytCallbacksFor(() => ytRemote));
/** Player do YouTube ativo agora (local, ou o da segunda tela). */
function yt() { return secondScreenPlayer ? ytRemote : ytLocal; }
/** Elemento que toca o MP4 agora: o <video> daqui, ou só o <audio> (vídeo na segunda tela). */
function mediaEl() { return secondScreenPlayer ? audioEl : videoEl; }
let currentVideoUrl = null; // blob: do MP4 carregado (reaproveitado na troca de tela)

// ---------- Estado ----------

let mode = null; // 'cdg' | 'video'
let seeking = false;
let applauseTriggered = false; // evita disparar os aplausos mais de uma vez por música

let playlist = []; // { id, file, code, artist, title, format, type }
let playlistIdCounter = 0;
let currentIndex = -1;

let countdownTimerId = null;
let singerCountdownActive = false; // true só durante a contagem cronometrada de verdade
let countdownRemaining = 0;

let customIdleImageDataUrl = null; // imagem de fundo custom pra tela ociosa (base64), ou null = usa a logo
let modalTrackIndex = -1; // índice da música que o modal de info está mostrando
let modalPitchValue = 0;
let dragFromIndex = -1; // índice sendo arrastado na reordenação por drag&drop
let videoPitchRouted = false; // true se o <video> atual está passando pelo pitch shifter
// Modo Show: a vez carregada no player agora — { singerId, singerName, song }.
// A música é identificada pelo objeto/ID, não por "songs[0] do cantor
// atual", então mexer na fila durante a apresentação não confunde nada.
let showTurn = null;
// Buffer .cdg da música carregada — reenviado pra segunda tela quando ela
// abre/recarrega, sem precisar extrair o zip de novo.
let currentCdgBuffer = null;

// ---------- Utilidades ----------

/** Locale de datas/números conforme o idioma ativo. */
function getLocale() {
  return window.i18n.getCurrentLang() === 'pt' ? 'pt-BR' : 'en-US';
}

/** Tooltips do +/- de tom: avisa quando a música atual não aceita ajuste
 * (vídeo sem roteamento de áudio, ou música Online do YouTube). */
function updatePitchButtonTitles() {
  const reason = mode === 'youtube' ? 'pitch_unavailable_online'
    : (mode === 'video' && !videoPitchRouted) ? 'pitch_unavailable_video' : null;
  pitchDownBtn.title = reason ? window.i18n.t(reason) : window.i18n.t('pitch_down_title');
  pitchUpBtn.title = reason ? window.i18n.t(reason) : window.i18n.t('pitch_up_title');
  updatePitchLabel(currentSemitones);
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------- Modais próprios pra substituir prompt()/confirm() nativos ----------
// Motivo: os diálogos nativos do navegador não têm como ser traduzidos
// de forma confiável em todo navegador/SO, e destoam visualmente do
// resto do app. Essas funções têm a MESMA assinatura de uso (via
// await) que prompt()/confirm(), só que via modal próprio.

const genericPromptBackdrop = el('generic-prompt-backdrop');
const genericPromptTitle = el('generic-prompt-title');
const genericPromptInput = el('generic-prompt-input');
const genericPromptOkBtn = el('generic-prompt-ok-btn');
const genericPromptCancelBtn = el('generic-prompt-cancel-btn');

function showPromptModal(message, defaultValue) {
  return new Promise((resolve) => {
    genericPromptTitle.textContent = message;
    genericPromptInput.value = defaultValue || '';
    genericPromptBackdrop.classList.remove('hidden');
    genericPromptInput.focus();
    genericPromptInput.select();

    const cleanup = () => {
      genericPromptBackdrop.classList.add('hidden');
      genericPromptOkBtn.removeEventListener('click', onOk);
      genericPromptCancelBtn.removeEventListener('click', onCancel);
      genericPromptInput.removeEventListener('keydown', onKeydown);
    };
    const onOk = () => { const v = genericPromptInput.value; cleanup(); resolve(v); };
    const onCancel = () => { cleanup(); resolve(null); };
    const onKeydown = (e) => {
      if (e.key === 'Enter') onOk();
      else if (e.key === 'Escape') onCancel();
    };
    genericPromptOkBtn.addEventListener('click', onOk);
    genericPromptCancelBtn.addEventListener('click', onCancel);
    genericPromptInput.addEventListener('keydown', onKeydown);
  });
}

const genericConfirmBackdrop = el('generic-confirm-backdrop');
const genericConfirmMessage = el('generic-confirm-message');
const genericConfirmOkBtn = el('generic-confirm-ok-btn');
const genericConfirmCancelBtn = el('generic-confirm-cancel-btn');

function showConfirmModal(message) {
  return new Promise((resolve) => {
    genericConfirmMessage.textContent = message;
    genericConfirmBackdrop.classList.remove('hidden');

    const cleanup = () => {
      genericConfirmBackdrop.classList.add('hidden');
      genericConfirmOkBtn.removeEventListener('click', onOk);
      genericConfirmCancelBtn.removeEventListener('click', onCancel);
    };
    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    genericConfirmOkBtn.addEventListener('click', onOk);
    genericConfirmCancelBtn.addEventListener('click', onCancel);
  });
}

let errorBannerTimerId = null;
function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove('hidden');
  // Reinicia o timer: senão o timer de um erro anterior escondia o novo antes da hora.
  clearTimeout(errorBannerTimerId);
  errorBannerTimerId = setTimeout(() => errorBanner.classList.add('hidden'), 5000);
}

let isTrackLoading = false;

function showLoading(show) {
  isTrackLoading = show;
  loadingBanner.classList.toggle('hidden', !show);
  // Enquanto carrega de verdade, nenhum desses botões pode ficar
  // clicável -- clicar neles durante o carregamento (ex: "Iniciar
  // Agora" numa troca de cantor lenta) disparava um SEGUNDO
  // carregamento por cima do primeiro, ou mexia no motor no meio da
  // troca — deixando tudo travado num "carregando" infinito com
  // play/stop entrando em loop.
  cdSkipBtn.disabled = show;
  if (show) {
    playBtn.disabled = true;
    stopBtn.disabled = true;
    restartBtn.disabled = true;
  } else if (mode !== null) {
    // Carregamento terminou (com sucesso ou erro) e ainda há uma música
    // válida carregada -- reabilita os botões. Se o erro deixou tudo
    // vazio (mode === null), resetToEmptyState() já cuida de manter
    // desabilitado.
    playBtn.disabled = false;
    stopBtn.disabled = false;
    restartBtn.disabled = false;
  }
}

function setStage(newMode) {
  mode = newMode;
  updateStageVisibility();
}

/** Mostra no palco a mídia atual — ou, se ela estiver tocando na segunda
 * tela (MP4/YouTube com a segunda tela aberta), um painel com capa/título. */
function updateStageVisibility() {
  const remoteView = secondScreenPlayer && (mode === 'video' || mode === 'youtube');
  stageEmpty.classList.toggle('hidden', !!mode);
  stageCanvasWrap.classList.toggle('hidden', mode !== 'cdg');
  stageVideoWrap.classList.toggle('hidden', mode !== 'video' || remoteView);
  stageYoutubeWrap.classList.toggle('hidden', mode !== 'youtube' || remoteView);
  stageRemotePlaceholder.classList.toggle('hidden', !remoteView);
  if (remoteView) {
    const item = playlist[currentIndex] || {};
    const thumb = el('remote-thumb');
    thumb.classList.toggle('hidden', !item.thumbnail);
    if (item.thumbnail) thumb.src = item.thumbnail; else thumb.removeAttribute('src');
    el('remote-title').textContent = [item.artist, item.title].filter(Boolean).join(' — ');
  }
}

function updateMetaBar(item) {
  // Modo Show: o cantor da vez aparece antes dos dados da música.
  const singerName = singerModeEnabled && showTurn ? showTurn.singerName : null;
  metaSingerField.classList.toggle('hidden', !singerName);
  metaSinger.textContent = singerName || '—';
  metaSong.classList.toggle('none', !item);
  if (!item) {
    metaCode.textContent = '—';
    metaArtist.textContent = '—';
    metaSong.textContent = window.i18n.t('no_music_loaded');
    metaFormat.textContent = '';
    return;
  }
  metaCode.textContent = item.code || '—';
  metaArtist.textContent = item.artist || (item.type === 'youtube' ? item.channel : '') || '—';
  metaSong.textContent = item.title;
  metaFormat.textContent = item.format;
}

// ---------- Playlist ----------

function hasNext() {
  // Nota: NÃO exige currentIndex >= 0 — depois que uma música termina e
  // é removida da fila (removeFinishedTrackFromQueue), currentIndex fica
  // temporariamente em -1 (nada carregado ainda), mas ainda pode haver
  // músicas esperando pra tocar. -1 < length-1 continua correto nesse caso.
  return currentIndex < playlist.length - 1;
}

const ICON_UP = '<svg fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 15 7-7 7 7"/></svg>';
const ICON_DOWN = '<svg fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7"/></svg>';
const ICON_X = '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';

/** Título de lista com contador: "Queue 3" (o número em cinza). */
function setListTitle(label, count) {
  playlistCount.textContent = label;
  const em = document.createElement('em');
  em.textContent = String(count);
  playlistCount.appendChild(em);
}

/** Selo de formato (CDG / MP4 / YOUTUBE) das linhas de música. */
function createFormatChip(item) {
  const chip = document.createElement('span');
  chip.className = 'fmt';
  chip.textContent = item.type === 'youtube' ? window.i18n.t('online_badge')
    : item.type === 'video' ? 'MP4' : 'CDG';
  return chip;
}

/** Linha "artista · código · formato" das músicas. */
function createSongSubLine(song, { withTitle = false } = {}) {
  const sub = document.createElement('div');
  sub.className = 'l2';
  const text = document.createElement('span');
  text.className = 'ttl';
  const artist = song.artist || (song.type === 'youtube' ? song.channel : '') || '';
  text.textContent = withTitle ? [song.title, artist].filter(Boolean).join(' — ') : artist;
  sub.appendChild(text);
  if (song.code) {
    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = song.code;
    sub.appendChild(code);
  }
  sub.appendChild(createFormatChip(song));
  return sub;
}

/** Botão pequeno de ação das linhas (subir/descer/remover). */
function rowActionBtn(icon, title, disabled, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = icon;
  b.title = title;
  b.disabled = !!disabled;
  b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return b;
}

/** Número da posição do cantor clicável: vira caixinha, digita a nova
 * posição e Enter move (Esc/clicar fora cancela). Com 30 cantores, as
 * setas davam cliques demais. */
function makeSingerPositionEditable(badge, singerId, index, onMoved) {
  badge.classList.add('pos-edit');
  badge.title = window.i18n.t('position_edit_title');
  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    if (badge.querySelector('input')) return;
    const row = badge.parentElement;
    const wasDraggable = row.draggable;
    row.draggable = false; // senão selecionar o texto arrasta a linha
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.className = 'pos-input';
    input.value = String(index + 1);
    input.setAttribute('aria-label', window.i18n.t('position_edit_title'));
    badge.textContent = '';
    badge.appendChild(input);
    input.focus();
    input.select();
    let done = false;
    const finish = (commit) => {
      if (done) return;
      done = true;
      const n = parseInt(input.value, 10);
      badge.textContent = String(index + 1);
      row.draggable = wasDraggable;
      if (commit && n >= 1 && n - 1 !== index) { // acima do total, moveSinger põe no fim
        singerManager.moveSinger(singerId, n - 1);
        if (onMoved) onMoved();
      } else {
        // Pode ter havido mudança enquanto digitava (redesenho adiado).
        renderSingerRoundView();
        refreshManageSingersIfOpen();
      }
    };
    input.addEventListener('click', (ev) => ev.stopPropagation());
    input.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
      else if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    });
    input.addEventListener('blur', () => finish(false));
  });
}

/** Selo TOCANDO/CANTANDO da linha ativa (visível só enquanto toca). */
function createNowChip(key) {
  const chip = document.createElement('span');
  chip.className = 'chip is-now now-playing-badge' + (isAnythingPlaying() ? '' : ' hidden');
  chip.textContent = window.i18n.t(key);
  return chip;
}

function renderPlaylist() {
  // No Modo Show a lista é o rodízio (a "fila" guarda só a música da vez).
  if (!singerModeEnabled) setListTitle(window.i18n.t('queue_label'), playlist.length);
  playlistEl.innerHTML = '';
  clearQueueBtn.disabled = playlist.length === 0;

  if (playlist.length === 0) {
    const hint = document.createElement('p');
    hint.id = 'playlist-empty-hint';
    hint.className = 'list-empty';
    hint.textContent = window.i18n.t('queue_empty_hint');
    playlistEl.appendChild(hint);
    updateNextBtnState();
    persistPlaylist();
    return;
  }

  playlist.forEach((item, i) => {
    const isActive = i === currentIndex;
    const row = document.createElement('div');
    row.className = 'row playlist-item' + (isActive ? ' active' : '');
    row.draggable = true;
    row.dataset.index = String(i);

    const num = document.createElement('span');
    num.className = 'pos';
    num.textContent = String(i + 1);

    const meta = document.createElement('div');
    meta.style.minWidth = '0';
    const titleLine = document.createElement('div');
    titleLine.className = 'l1';
    const titleEl = document.createElement('span');
    titleEl.className = 'nm';
    titleEl.textContent = item.title;
    titleLine.appendChild(titleEl);
    if (isActive) titleLine.appendChild(createNowChip('now_playing_badge'));
    else if (i === currentIndex + 1 && currentIndex >= 0) {
      const next = document.createElement('span');
      next.className = 'chip is-next upnext-chip' + (isAnythingPlaying() ? '' : ' hidden');
      next.textContent = window.i18n.t('up_next_chip');
      titleLine.appendChild(next);
    }
    meta.appendChild(titleLine);
    meta.appendChild(createSongSubLine(item));

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.appendChild(rowActionBtn(ICON_UP, window.i18n.t('move_up_title'), i === 0, () => moveTrack(i, -1)));
    actions.appendChild(rowActionBtn(ICON_DOWN, window.i18n.t('move_down_title'), i === playlist.length - 1, () => moveTrack(i, 1)));
    actions.appendChild(rowActionBtn(ICON_X, window.i18n.t('remove_from_queue_title'), false, () => removeFromPlaylist(i)));

    row.appendChild(num);
    row.appendChild(meta);
    row.appendChild(actions);
    row.addEventListener('click', () => openTrackModal(i));

    // ---- Drag & drop pra reordenar ----
    row.addEventListener('dragstart', (e) => {
      dragFromIndex = i;
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(i)); } catch (err) {}
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      document.querySelectorAll('.playlist-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
      });
      dragFromIndex = -1;
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (dragFromIndex === -1 || dragFromIndex === i) return;
      const rect = row.getBoundingClientRect();
      const isTopHalf = (e.clientY - rect.top) < rect.height / 2;
      row.classList.toggle('drag-over-top', isTopHalf);
      row.classList.toggle('drag-over-bottom', !isTopHalf);
    });
    row.addEventListener('dragleave', () => {
      row.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over-top', 'drag-over-bottom');
      if (dragFromIndex === -1 || dragFromIndex === i) return;
      const rect = row.getBoundingClientRect();
      const isTopHalf = (e.clientY - rect.top) < rect.height / 2;
      const targetIndex = isTopHalf ? i : i + 1;
      reorderTrack(dragFromIndex, targetIndex);
    });

    playlistEl.appendChild(row);
  });

  updateNextBtnState();
  persistPlaylist();
}

function moveTrack(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= playlist.length) return;
  [playlist[index], playlist[newIndex]] = [playlist[newIndex], playlist[index]];
  if (currentIndex === index) currentIndex = newIndex;
  else if (currentIndex === newIndex) currentIndex = index;
  renderPlaylist();
}

/** Move o item de `fromIndex` pra posição `toIndex` (estilo drag&drop, onde toIndex já considera a inserção). */
function reorderTrack(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex + 1 === toIndex) return; // não muda nada
  const [moved] = playlist.splice(fromIndex, 1);
  let insertAt = toIndex;
  if (fromIndex < toIndex) insertAt -= 1; // compensa o item removido antes do alvo
  playlist.splice(insertAt, 0, moved);

  if (currentIndex === fromIndex) {
    currentIndex = insertAt;
  } else if (fromIndex < currentIndex && insertAt >= currentIndex) {
    currentIndex -= 1;
  } else if (fromIndex > currentIndex && insertAt <= currentIndex) {
    currentIndex += 1;
  }

  renderPlaylist();
}

function removeFromPlaylist(index) {
  if (index < 0 || index >= playlist.length) return;
  playlist.splice(index, 1);

  if (index === currentIndex) {
    // A música removida era a que estava tocando/selecionada agora.
    cancelCountdown();
    if (playlist.length === 0) {
      currentIndex = -1;
      resetToEmptyState();
      return;
    }
    const nextIndex = Math.min(index, playlist.length - 1);
    selectTrack(nextIndex, { autoplay: false });
    return;
  }

  if (index < currentIndex) {
    currentIndex -= 1;
  }
  renderPlaylist();
}

/** Arquivos-fantasma "._nome" que o macOS cria em HDs exFAT/FAT (metadados, não músicas). */
function isGhostFile(file) {
  return file.name.startsWith('._');
}

async function addFilesToQueue(files) {
  const list = Array.from(files || []).filter(f => !isGhostFile(f));
  if (!list.length) return;

  if (singerModeEnabled) {
    await addFilesInSingerMode(list);
    return;
  }

  const wasEmpty = playlist.length === 0;
  let firstNewIndex = -1;
  let skippedAny = false;

  for (const file of list) {
    const lower = file.name.toLowerCase();
    const isZip = lower.endsWith('.zip');
    const isMp4 = lower.endsWith('.mp4');
    if (!isZip && !isMp4) {
      skippedAny = true;
      continue;
    }
    const parsed = window.parseKaraokeFilename(file.name);
    const item = {
      id: 'track_' + (++playlistIdCounter),
      file,
      code: parsed.code,
      artist: parsed.artist,
      title: parsed.title,
      format: isMp4 ? 'MP4' : 'MP3+G',
      type: isMp4 ? 'video' : 'cdg',
    };
    if (firstNewIndex === -1) firstNewIndex = playlist.length;
    playlist.push(item);
  }

  renderPlaylist();

  if (skippedAny) {
    showError(window.i18n.t('err_unsupported_files'));
  }

  if (wasEmpty && firstNewIndex !== -1) {
    await selectTrack(firstNewIndex, { autoplay: false });
  }
}

let selectTrackGeneration = 0;

async function selectTrack(index, { autoplay, initialSemitones } = { autoplay: false, initialSemitones: 0 }) {
  if (index < 0 || index >= playlist.length) return;
  cancelCountdown();

  // Rede de segurança contra chamadas sobrepostas: se `selectTrack` for
  // chamada de novo antes dessa terminar de carregar (ex: clique duplo,
  // autoplay avançando rápido demais, etc.), a chamada mais velha se
  // auto-cancela nos pontos de espera assim que percebe que não é mais
  // a mais recente — evita carregar a mesma música (ou músicas erradas)
  // múltiplas vezes ao mesmo tempo, que é o que causava o travamento.
  const myGeneration = ++selectTrackGeneration;
  const isCurrent = () => myGeneration === selectTrackGeneration;

  currentIndex = index;
  renderPlaylist();

  // Para a mídia anterior ANTES de carregar a nova: sem isso, trocar de um
  // CDG tocando pra um MP4 (ou vice-versa) deixava a anterior tocando por
  // baixo — e o "ended" dela depois avançava a fila/rodada sozinho.
  stopCurrentMedia();

  const item = playlist[index];
  showLoading(true);
  try {
    const result = item.type === 'youtube'
      ? { type: 'youtube', videoId: item.videoId }
      : await window.loadKaraokeFile(item.file || await resolvePendingLibraryFile(item));
    if (!isCurrent()) return; // uma chamada mais nova já assumiu, descarta essa
    applauseTriggered = false;
    silenceAccumMs = 0;
    lastSilenceCheckMs = 0;
    updateMetaBar(item);
    setSemitones(initialSemitones || 0); // cada música começa no tom escolhido (ou original, por padrão)

    if (result.type === 'cdg') {
      currentCdgBuffer = result.cdgBuffer;
      cdgPlayer.load(result.cdgBuffer);
      await engine.loadArrayBuffer(result.audioBuffer);
      if (!isCurrent()) return;
      setStage('cdg');
      timeDuration.textContent = formatTime(engine.getDuration());
      seekBar.max = String(Math.floor(engine.getDuration() * 1000));
      seekBar.value = '0';
      broadcastToSecondScreen({
        type: 'init-cdg',
        cdgBuffer: result.cdgBuffer,
        colors: getActiveColors(),
        meta: { title: item.title, artist: item.artist, code: item.code, format: item.format },
      });
    } else if (result.type === 'video') {
      currentCdgBuffer = null;
      currentVideoUrl = result.videoBlobUrl;
      const media = mediaEl(); // <audio> se o vídeo for tocar só na segunda tela
      if (media === audioEl) { videoEl.removeAttribute('src'); videoEl.load(); }
      media.src = result.videoBlobUrl;
      setStage('video');
      media.load();

      // Tenta rotear o áudio do vídeo pelo mesmo pitch shifter usado no
      // CDG — só funciona no motor de thread separada (worklet); se caiu
      // pro motor antigo, o vídeo toca normal, sem ajuste de tom.
      const pitchOk = await engine.ensureVideoPitchSupport();
      if (!isCurrent()) return;
      videoPitchRouted = pitchOk && engine.attachVideoElement(media);
      applyMediaVolume();
      if (!videoPitchRouted) {
        console.warn('[App] Ajuste de tom não disponível pra esse vídeo neste navegador.');
      }

      broadcastToSecondScreen({
        type: 'init-video',
        videoUrl: result.videoBlobUrl,
        meta: { title: item.title, artist: item.artist, code: item.code, format: item.format },
      });
    } else if (result.type === 'youtube') {
      currentCdgBuffer = null;
      setStage('youtube');
      const player = yt();
      player.setVolume(Number(volumeSlider.value) / 100);
      try {
        await player.load(result.videoId, { autoplay: false });
      } catch (err) {
        throw new Error(window.i18n.t('youtube_err_load'));
      }
      if (!isCurrent()) return;
      timeDuration.textContent = formatTime(player.getDuration());
      seekBar.value = '0';
      // Player local: a segunda tela carrega uma cópia muda pra acompanhar.
      // (O remoto já mandou o init-youtube com remote:true no load.)
      if (player === ytLocal) {
        broadcastToSecondScreen({
          type: 'init-youtube',
          videoId: result.videoId,
          meta: { title: item.title, artist: item.artist, code: item.code, format: item.format },
        });
      }
    }

    updatePitchButtonTitles();
    playBtn.disabled = false;
    stopBtn.disabled = false;
    restartBtn.disabled = false;

    if (autoplay) await playLoadedTrack();
    refreshIdleState();
  } catch (err) {
    if (!isCurrent()) return; // erro de uma chamada já obsoleta -- ignora silenciosamente
    console.error(err);
    showError(err.message || window.i18n.t('err_load_generic'));
  } finally {
    if (isCurrent()) showLoading(false);
  }
}

/** Para qualquer mídia tocando agora (CDG e/ou vídeo), sem mexer no palco. */
function stopCurrentMedia() {
  setYtStarting(false);
  engine.stop();
  if (!videoEl.paused) videoEl.pause();
  if (!audioEl.paused) audioEl.pause();
  yt().stop();
  updatePlayIcon();
}

function playNextInQueue() {
  if (!hasNext()) return;
  const nextIndex = currentIndex + 1;
  const nextItem = playlist[nextIndex];
  // Respeita um tom pré-configurado no modal (via "Aplicar tom" numa
  // música ainda em espera), se existir.
  selectTrack(nextIndex, { autoplay: true, initialSemitones: nextItem.savedSemitones || 0 });
}

/** Posição atual de reprodução da mídia carregada (segundos). */
function getCurrentPosition() {
  if (mode === 'video') return mediaEl().currentTime || 0;
  if (mode === 'youtube') return yt().getCurrentTime();
  if (mode === 'cdg') return engine.getCurrentTime();
  return 0;
}

/** O botão "Próxima" muda de papel no Modo Show: depois que a
 * apresentação começou, encerra e passa a vez; antes disso (cantor sem
 * música, ou que foi embora), pula a vez dele. */
function updateNextBtnState() {
  if (singerModeEnabled) {
    if (showTurn && performanceStarted()) {
      nextBtn.disabled = false;
      nextBtn.title = window.i18n.t('end_performance_title');
    } else {
      nextBtn.disabled = singerManager.getAllSingers().length < 2 || !singerManager.getCurrentSinger();
      nextBtn.title = window.i18n.t('skip_turn_title');
    }
  } else {
    nextBtn.disabled = !hasNext();
    nextBtn.title = window.i18n.t('next_btn_title');
  }
}

/** Modo Show: encerra a apresentação no meio (conta como cantada, com o
 * tempo realmente cantado) e passa a vez pro próximo cantor. */
async function endCurrentPerformance() {
  if (!showTurn || mode === null) return;
  const turn = showTurn;
  const confirmed = await showConfirmModal(window.i18n.t('confirm_end_performance', { name: showTurn.singerName }));
  // Se a música acabou com a confirmação aberta, a vez já é de outro: não encerra a dele.
  if (!confirmed || showTurn !== turn || !performanceStarted()) return;
  const elapsedSec = getCurrentPosition();
  stopCurrentMedia();
  await handleSingerModeSongEnded({ elapsedSec });
}

/** Modo Show: pula a vez do cantor da vez antes de ele começar. Nada
 * vai pro histórico; ele continua na rodada com as músicas dele. */
async function skipCurrentSingerTurn() {
  const singer = singerManager.getCurrentSinger();
  if (!singer) return;
  const confirmed = await showConfirmModal(window.i18n.t('confirm_skip_turn', { name: singer.name }));
  if (!confirmed || performanceStarted() || singerManager.getCurrentSinger() !== singer) return;
  if (countdownTimerId || singerCountdownActive) cancelCountdown();
  stopCurrentMedia();
  showTurn = null;
  singerManager.skipTurn();
  await loadCurrentSingerTurn(false);
  updateNextBtnState();
}

nextBtn.addEventListener('click', () => {
  if (isTrackLoading) return; // duplo clique pulava duas músicas
  if (singerModeEnabled) {
    if (showTurn && performanceStarted()) endCurrentPerformance();
    else skipCurrentSingerTurn();
  }
  else playNextInQueue();
});

stopBtn.addEventListener('click', () => {
  // Invalida qualquer selectTrack() ainda em andamento (carregamento
  // travado, cliques duplos, etc.) antes de resetar tudo — assim o
  // resultado de uma chamada antiga não "chega atrasado" depois do
  // reset e bagunça o estado de novo.
  selectTrackGeneration++;
  handlingTrackEnded = false;
  resetToEmptyState();
});

/** "Voltar ao início": a música carregada volta pro começo e toca (quem
 * ia cantar se atrasou, a introdução passou, etc.). */
async function restartCurrentSong() {
  if (mode === null || isTrackLoading) return;
  if (countdownTimerId || singerCountdownActive) cancelCountdown();
  applauseTriggered = false;
  silenceAccumMs = 0;
  if (mode === 'cdg') {
    engine.seekTo(0);
    cdgPlayer.update(0);
  } else if (mode === 'video') {
    mediaEl().currentTime = 0;
  } else if (mode === 'youtube') {
    yt().seekTo(0);
  }
  seekBar.value = '0';
  timeCurrent.textContent = formatTime(0);
  await playLoadedTrack();
}
restartBtn.addEventListener('click', restartCurrentSong);

// ---------- Modal de informações da música (abre ao clicar na fila) ----------

function updateTmPitchLabel() {
  const sign = modalPitchValue > 0 ? '+' : '';
  tmPitchValue.textContent = `${sign}${modalPitchValue}`;
  tmPitchDownBtn.disabled = modalPitchValue <= -12;
  tmPitchUpBtn.disabled = modalPitchValue >= 12;
}

function openTrackModal(index) {
  const item = playlist[index];
  if (!item) return;
  modalTrackIndex = index;

  const isActive = index === currentIndex;
  // Pra música ativa, mostra o tom que está tocando agora. Pra música em
  // espera, mostra o tom já salvo pra ela (se algum dia "Aplicar tom" já
  // foi usado nela antes) — assim reabrir o modal não perde a escolha.
  modalPitchValue = isActive ? currentSemitones : (item.savedSemitones || 0);

  tmCode.textContent = item.code || '—';
  tmArtist.textContent = item.artist || '—';
  tmFormat.textContent = item.format;
  tmTitle.textContent = item.title;

  // "Aplicar tom" sempre existe. "Tocar" só faz sentido pra uma música
  // que ainda NÃO é a que está tocando agora (senão seria redundante).
  tmPlayBtn.classList.toggle('hidden', isActive);

  updateTmPitchLabel();
  // Músicas Online não aceitam ajuste de tom — esconde o seletor e o "Aplicar tom".
  const noPitch = item.type === 'youtube';
  el('tm-pitch-row').classList.toggle('hidden', noPitch);
  tmApplyBtn.classList.toggle('hidden', noPitch);

  trackModalBackdrop.classList.remove('hidden');
}

function closeTrackModal() {
  trackModalBackdrop.classList.add('hidden');
  modalTrackIndex = -1;
}

tmPitchDownBtn.addEventListener('click', () => {
  modalPitchValue = Math.max(-12, modalPitchValue - 1);
  updateTmPitchLabel();
});
tmPitchUpBtn.addEventListener('click', () => {
  modalPitchValue = Math.min(12, modalPitchValue + 1);
  updateTmPitchLabel();
});
tmCancelBtn.addEventListener('click', closeTrackModal);
trackModalBackdrop.addEventListener('click', (e) => {
  if (e.target === trackModalBackdrop) closeTrackModal();
});

// "Aplicar tom": SEMPRE só salva o valor no item da fila. Se a música
// clicada for a que já está tocando, também aplica na hora (efeito
// audível imediato). Se for uma música em espera, só guarda o valor pra
// quando ela realmente começar a tocar — NUNCA dá play aqui.
tmApplyBtn.addEventListener('click', () => {
  const index = modalTrackIndex;
  const semitones = modalPitchValue;
  const isActive = index === currentIndex;
  if (playlist[index]) playlist[index].savedSemitones = semitones;
  closeTrackModal();
  if (isActive) {
    setSemitones(semitones);
  } else {
    renderPlaylist(); // sem tocar nada — só garante que a escolha fica salva/persistida
  }
});

// "Tocar": troca pra essa música agora, já com o tom escolhido.
tmPlayBtn.addEventListener('click', () => {
  const index = modalTrackIndex;
  const semitones = modalPitchValue;
  if (playlist[index]) playlist[index].savedSemitones = semitones;
  closeTrackModal();
  selectTrack(index, { autoplay: true, initialSemitones: semitones });
});

// ---------- Reset (fila vazia) ----------

function resetToEmptyState() {
  showTurn = null;
  currentCdgBuffer = null;
  engine.stop();
  if (mode === 'video') {
    for (const media of [videoEl, audioEl]) {
      media.pause();
      media.removeAttribute('src');
      media.load();
    }
  }
  currentVideoUrl = null;
  ytLocal.clear();
  ytRemote.clear();
  cdgPlayer.reset();
  cdgPlayer.clearScreen();
  applauseAudio.pause();
  applauseAudio.currentTime = 0;
  applauseTriggered = false;
  silenceAccumMs = 0;
  lastSilenceCheckMs = 0;
  cancelCountdown();

  setStage(null);
  updateMetaBar(null);
  timeCurrent.textContent = '0:00';
  timeDuration.textContent = '0:00';
  seekBar.value = '0';

  playBtn.disabled = true;
  stopBtn.disabled = true;
  restartBtn.disabled = true;
  updatePlayIcon();
  renderPlaylist();
  refreshIdleState();

  broadcastToSecondScreen({ type: 'clear' });
}

// ---------- Carregar arquivos (botão / drop / input) ----------

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  addFilesToQueue(fileInput.files);
  fileInput.value = '';
});

// IMPORTANTE: o navegador, por padrão, abre/toca qualquer arquivo solto
// sobre a página (fora de um drop-target específico) em vez de deixar o
// nosso JS tratar o evento. Por isso precisamos interceptar 'dragover' e
// 'drop' em TODA a janela, chamando preventDefault() sempre — os arquivos
// podem ser soltos em qualquer lugar da tela.

['dragenter', 'dragover', 'drop'].forEach(evt => {
  window.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

// Aviso "Solte para adicionar" cobrindo a tela — só pra arquivos vindos de
// fora (arrastar uma linha da fila pra reordenar não mostra nada).
const dropOverlay = el('drop-overlay');
let dragDepth = 0;
const isFileDrag = (e) => !!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files'));
function setDropHighlight(on) {
  dropOverlay.classList.toggle('hidden', !on);
  dropZone.classList.toggle('drag-active', on);
  sidebarDropzone.classList.toggle('drag-active', on);
}
window.addEventListener('dragenter', (e) => {
  if (!isFileDrag(e)) return;
  dragDepth++;
  setDropHighlight(true);
});
window.addEventListener('dragleave', (e) => {
  if (!isFileDrag(e)) return;
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0 || e.relatedTarget === null) { dragDepth = 0; setDropHighlight(false); }
});
window.addEventListener('drop', (e) => {
  dragDepth = 0;
  setDropHighlight(false);
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length) addFilesToQueue(files);
});

// ---------- Transporte (play/pause/seek) ----------

function updatePlayIcon() {
  const playing = isAnythingPlaying();
  playIcon.classList.toggle('hidden', playing);
  pauseIcon.classList.toggle('hidden', !playing);

  const badge = playlistEl.querySelector('.now-playing-badge');
  if (badge) badge.classList.toggle('hidden', !playing);
  const nextChip = playlistEl.querySelector('.upnext-chip');
  if (nextChip) nextChip.classList.toggle('hidden', !playing);
  if (singerModeEnabled) updateSingerNowPlayingBadge();
  updateNextBtnState();
}

playBtn.addEventListener('click', async () => {
  try {
    if (mode === 'cdg') {
      if (engine.isPlaying()) {
        engine.pause();
      } else {
        await engine.play();
      }
    } else if (mode === 'video') {
      const media = mediaEl();
      if (media.paused) {
        await media.play();
      } else {
        media.pause();
      }
      updatePlayIcon();
    } else if (mode === 'youtube') {
      if (yt().isPlaying()) yt().pause(); else yt().play();
    }
  } catch (err) {
    console.error('Erro ao dar play:', err);
    showError(window.i18n.t('err_playback_start_fail', { msg: err.message || err }));
  }
});

seekBar.addEventListener('input', () => {
  seeking = true;
  timeCurrent.textContent = formatTime(Number(seekBar.value) / 1000);
});
seekBar.addEventListener('change', () => {
  const sec = Number(seekBar.value) / 1000;
  if (mode === 'cdg') {
    engine.seekTo(sec);
    cdgPlayer.update(sec);
  } else if (mode === 'video') {
    mediaEl().currentTime = sec;
  } else if (mode === 'youtube') {
    yt().seekTo(sec);
  }
  seeking = false;
});

// ---------- Volume ----------

volumeSlider.addEventListener('input', () => {
  const pct = Number(volumeSlider.value);
  const vol = pct / 100;
  engine.setVolume(vol);
  applyMediaVolume();
  ytLocal.setVolume(vol);
  if (secondScreenPlayer) ytRemote.setVolume(vol);
  volumePct.textContent = pct + '%';
});

/** Volume dos elementos de MP4. Se o elemento passa pelo pitch shifter, o
 * volume já é aplicado lá (gainNode) — setar .volume TAMBÉM multiplicaria
 * duas vezes; só controlamos .volume direto quando ele NÃO está roteado. */
function applyMediaVolume() {
  const vol = Number(volumeSlider.value) / 100;
  for (const media of [videoEl, audioEl]) {
    media.volume = engine.isVideoPitchRouted(media) ? 1 : vol;
  }
}
volumePct.textContent = volumeSlider.value + '%';

// ---------- Pitch (tom) ----------

let currentSemitones = 0;

function updatePitchLabel(semitones) {
  const sign = semitones > 0 ? '+' : '';
  pitchValue.textContent = `${sign}${semitones}`;
  const noPitch = mode === 'youtube'; // o áudio do YouTube não passa pelo nosso motor
  pitchDownBtn.disabled = noPitch || semitones <= -12;
  pitchUpBtn.disabled = noPitch || semitones >= 12;
  pitchResetBtn.disabled = noPitch;
}

function setSemitones(semitones) {
  currentSemitones = Math.max(-12, Math.min(12, semitones));
  engine.setPitchSemitones(currentSemitones);
  updatePitchLabel(currentSemitones);
}

pitchDownBtn.addEventListener('click', () => setSemitones(currentSemitones - 1));
pitchUpBtn.addEventListener('click', () => setSemitones(currentSemitones + 1));
pitchResetBtn.addEventListener('click', () => setSemitones(0));

// ---------- Aplausos automáticos ----------

const APPLAUSE_WINDOW_SEC = 5;       // dispara de qualquer forma nos últimos 5s (regra de segurança)
const SILENCE_ARM_WINDOW_SEC = 20;   // só passa a "escutar" silêncio nos últimos 20s (evita disparo falso no meio da música)
const SILENCE_RMS_THRESHOLD = 0.02;  // abaixo disso é considerado "silêncio" (escala 0-1)
const SILENCE_DURATION_MS = 1200;    // precisa ficar em silêncio por esse tempo seguido pra disparar

let silenceAccumMs = 0;
let lastSilenceCheckMs = 0;

function triggerApplauseNow() {
  if (applauseTriggered) return;
  applauseTriggered = true;
  applauseAudio.currentTime = 0;
  applauseAudio.volume = engine.getVolume();
  applauseAudio.play().catch(err => console.warn('[App] Não foi possível tocar os aplausos:', err));
}

function checkApplause(currentTime, duration) {
  if (!applauseToggle.checked || !duration) return;

  const remaining = duration - currentTime;

  // Regra 1 (sempre ativa): garante que os aplausos disparem o mais tardar
  // nos últimos 5 segundos do arquivo, mesmo que a detecção de silêncio
  // não pegue nada (ex: música termina com um acorde forte, sem fade out).
  if (remaining <= APPLAUSE_WINDOW_SEC && remaining > 0) {
    triggerApplauseNow();
  } else if (remaining > SILENCE_ARM_WINDOW_SEC && applauseTriggered) {
    // Só reseta quando sai de vez da "janela final" (ex: usuário deu seek
    // pra trás) — resetar já em "remaining > 5s" cancelaria, por engano,
    // um disparo legítimo que a Regra 2 (silêncio) já tinha feito mais
    // cedo, ainda dentro da janela de 20s mas fora da de 5s.
    applauseTriggered = false;
  }

  // Regra 2 (silêncio real): se a música já emudeceu antes desse ponto —
  // caso comum quando o arquivo tem alguns segundos de silêncio "morto"
  // no final — dispara mais cedo, assim que detecta o silêncio de verdade,
  // em vez de esperar os 5s fixos (que aí sim seriam silêncio demorado).
  checkSilenceForApplause(currentTime, duration, remaining);
}

let silenceData = null;

/**
 * Só funciona se o motor de áudio conseguir "escutar" o sinal de verdade
 * (CDG sempre; vídeo MP4 só quando o tom estiver roteado pelo pitch
 * shifter — ver videoPitchRouted). Fora disso, essa checagem não faz nada
 * e a Regra 1 acima (tempo fixo) continua sendo a única rede de segurança.
 */
function checkSilenceForApplause(currentTime, duration, remaining) {
  if (applauseTriggered) { silenceAccumMs = 0; return; }
  if (remaining > SILENCE_ARM_WINDOW_SEC || remaining <= 0) { silenceAccumMs = 0; return; }
  if (mode === 'video' && !videoPitchRouted) return; // sem sinal real pra analisar nesse caso
  if (mode === 'youtube') return; // áudio do YouTube não é acessível — só vale a regra dos 5s

  const analyser = engine.getAnalyser();
  if (!analyser) return;

  const now = performance.now();
  const dt = lastSilenceCheckMs ? Math.min(500, now - lastSilenceCheckMs) : 0;
  lastSilenceCheckMs = now;

  // Um buffer só, reaproveitado (antes alocava 60x/s nos últimos 20 s de cada música).
  if (!silenceData || silenceData.length !== analyser.fftSize) silenceData = new Uint8Array(analyser.fftSize);
  const data = silenceData;
  analyser.getByteTimeDomainData(data);
  let sumSquares = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    sumSquares += v * v;
  }
  const rms = Math.sqrt(sumSquares / data.length);

  if (rms < SILENCE_RMS_THRESHOLD) {
    silenceAccumMs += dt;
    if (silenceAccumMs >= SILENCE_DURATION_MS) {
      triggerApplauseNow();
    }
  } else {
    silenceAccumMs = 0;
  }
}

// ---------- Autoplay da fila (com contagem regressiva) ----------

// ---------- Indicadores "Ativado/Desativado" do novo design de Configurações ----------

/** Deixa um botão-indicador (texto + bolinha) sincronizado visualmente
 * com um checkbox escondido, e clicável pra alternar o checkbox. */
function syncToggleIndicator(indicatorEl, checkboxEl) {
  const update = () => {
    const on = checkboxEl.checked;
    indicatorEl.classList.toggle('on', on);
    const textEl = indicatorEl.querySelector('.toggle-state-text');
    if (textEl) textEl.textContent = on ? window.i18n.t('enabled') : window.i18n.t('disabled');
  };
  update();
  checkboxEl.addEventListener('change', update);
  indicatorEl.addEventListener('click', () => {
    checkboxEl.checked = !checkboxEl.checked;
    checkboxEl.dispatchEvent(new Event('change'));
  });
}

syncToggleIndicator(autoplayToggleIndicator, autoplayToggle);
syncToggleIndicator(ambientToggleIndicator, ambientToggle);
syncToggleIndicator(customColorsToggleIndicator, customColorsToggle);
syncToggleIndicator(el('applause-toggle-indicator'), applauseToggle);

// ---------- Modo leve (desempenho) ----------
// Ligado pelo usuário, vale pras duas telas. Com a segunda tela aberta, a
// tela principal usa o desenho leve automaticamente (ela vira só uma
// prévia — a qualidade total fica na segunda tela).
const lightModeToggle = el('light-mode-toggle');
const LIGHT_MODE_KEY = 'playkaraoke-light-mode';
try { lightModeToggle.checked = localStorage.getItem(LIGHT_MODE_KEY) === 'true'; } catch (err) {}
syncToggleIndicator(el('light-mode-toggle-indicator'), lightModeToggle);

function applyRenderMode() {
  cdgPlayer.setLightMode(lightModeToggle.checked || isSecondScreenOpen());
  broadcastToSecondScreen({ type: 'render-mode', light: lightModeToggle.checked });
}
lightModeToggle.addEventListener('change', () => {
  try { localStorage.setItem(LIGHT_MODE_KEY, String(lightModeToggle.checked)); } catch (err) {}
  applyRenderMode();
});

function updateAutoplayIndicator() {
  const on = autoplayToggle.checked;
  quickAutoplayBtn.classList.toggle('on', on);
  if (on) {
    const delay = Math.max(0, parseInt(autoplayDelayInput.value, 10) || 0);
    quickAutoplayBtn.title = window.i18n.t('pill_autoplay_on_title', { delay });
  } else {
    quickAutoplayBtn.title = window.i18n.t('pill_autoplay_title');
  }
}
autoplayToggle.addEventListener('change', updateAutoplayIndicator);
autoplayDelayInput.addEventListener('input', updateAutoplayIndicator);
quickAutoplayBtn.addEventListener('click', () => {
  autoplayToggle.checked = !autoplayToggle.checked;
  autoplayToggle.dispatchEvent(new Event('change'));
});

function cancelCountdown() {
  if (countdownTimerId) {
    clearInterval(countdownTimerId);
    countdownTimerId = null;
  }
  singerCountdownActive = false;
  if (singerModeEnabled) {
    // Em modo cantores, o card do cantor da vez continua visível mesmo
    // sem o timer rodando — updateIdleOverlay() decide isso já já. Só
    // escondemos as partes específicas do cronômetro na hora.
    countdownTimerParts.classList.add('hidden');
    cdSkipBtn.classList.add('hidden');
  } else {
    countdownOverlay.classList.add('hidden');
  }
  broadcastToSecondScreen({ type: 'countdown-end' });
  refreshIdleState();
}

function finishCountdown() {
  cancelCountdown();
  playLoadedTrack(); // a próxima já foi pré-carregada no fim da anterior
}

/** Chamado quando a apresentação termina no modo cantores (fim natural
 * ou "encerrar apresentação"). A música SEMPRE é registrada como cantada.
 * Em seguida a música do próximo cantor já fica carregada (pausada) — só
 * começa sozinha, após a contagem, se o autoplay estiver ligado.
 * @param {{elapsedSec?: number}} [opts] - tempo cantado, se foi interrompida */
async function handleSingerModeSongEnded({ elapsedSec } = {}) {
  const turn = showTurn;
  showTurn = null;
  if (turn) {
    const singer = singerManager.getAllSingers().find(s => s.id === turn.singerId);
    const fullDuration = mode === 'video' ? (mediaEl().duration || 0)
      : mode === 'youtube' ? yt().getDuration() : engine.getDuration();
    const duration = elapsedSec !== undefined ? elapsedSec : fullDuration;
    logSongToShowHistory(singer ? singer.name : turn.singerName, turn.song, currentSemitones, Math.round(duration));
    singerManager.completeTurn(turn.singerId, turn.song, { semitone: currentSemitones });
  }
  await loadCurrentSingerTurn(false);
  if (autoplayToggle.checked && showTurn) startSingerCountdown();
}

function startSingerCountdown() {
  const singer = singerManager.getCurrentSinger();
  if (!singer) { renderSingerRoundView(); return; }

  const delay = Math.max(0, parseInt(autoplayDelayInput.value, 10) || 0);
  const songText = singer.songs.length > 0
    ? [singer.songs[0].artist, singer.songs[0].title].filter(Boolean).join(' — ')
    : window.i18n.t('no_song_in_queue');
  const nextTitleText = `${singer.name} — ${songText}`;
  singerCountdownActive = true;
  renderRichCountdown(singer);
  countdownTimerParts.classList.remove('hidden');
  cdSkipBtn.classList.remove('hidden');
  countdownOverlay.classList.remove('hidden');
  countdownRemaining = delay;
  cdNumber.textContent = String(countdownRemaining);
  refreshIdleState();
  broadcastToSecondScreen({
    type: 'countdown-start', delay, remaining: countdownRemaining, nextTitle: nextTitleText,
    singerMode: true,
    singer: { name: singer.name, song: singer.songs[0] || null, position: getSingerPosition(singer.id) },
    upcoming: singerManager.getUpcomingSingers(2).map(s => ({ name: s.name, song: s.songs[0] || null, position: getSingerPosition(s.id) })),
    display: { upcoming: cdShowUpcomingToggle.checked, titles: cdShowTitlesToggle.checked, counter: cdShowCounterToggle.checked },
    labels: getCountdownLabels(),
  });

  if (delay <= 0) {
    finishSingerCountdown();
    return;
  }
  countdownTimerId = setInterval(() => {
    countdownRemaining -= 1;
    cdNumber.textContent = String(Math.max(0, countdownRemaining));
    broadcastToSecondScreen({ type: 'countdown-tick', remaining: Math.max(0, countdownRemaining) });
    if (countdownRemaining <= 0) finishSingerCountdown();
  }, 1000);
}

function finishSingerCountdown() {
  cancelCountdown();
  // Se a música do cantor da vez já está carregada (pré-carregada no fim da
  // anterior), só dá play; senão (fila mudou, stop, etc.) carrega de novo.
  const singer = singerManager.getCurrentSinger();
  const loadedIsCurrent = showTurn && mode !== null && singer && showTurn.singerId === singer.id
    && singer.songs.length > 0 && singer.songs[0].id === showTurn.song.id;
  if (loadedIsCurrent) playLoadedTrack();
  else loadCurrentSingerTurn(true);
}

/** Dá play na música que já está carregada no player. */
async function playLoadedTrack() {
  try {
    if (mode === 'cdg') {
      await engine.play();
    } else if (mode === 'video') {
      await mediaEl().play();
      updatePlayIcon();
    } else if (mode === 'youtube') {
      setYtStarting(true);
      yt().play();
      updateAmbientState();
    }
  } catch (err) {
    console.error('Erro ao dar play:', err);
    showError(window.i18n.t('err_playback_start_fail', { msg: err.message || err }));
  }
}

/** Ponto único chamado sempre que uma música termina — decide qual dos
 * dois modos (simples ou rodada de cantores) deve tratar o evento. */
let handlingTrackEnded = false;

function handleTrackEnded() {
  // Rede de segurança: se o evento "ended" disparar mais de uma vez pra
  // mesma música (ex: motor de áudio + rede de segurança do tick.js
  // disparando quase juntos, ou vídeo + engine ambos avisando), sem essa
  // proteção a gente consumiria/avançaria a rodada mais de uma vez —
  // pulando o cantor errado sem querer. Ignora repetições dentro de uma
  // janela curta.
  if (handlingTrackEnded) return;
  handlingTrackEnded = true;
  setTimeout(() => { handlingTrackEnded = false; }, 800);

  if (singerModeEnabled) {
    handleSingerModeSongEnded();
  } else {
    handleSimpleModeSongEnded();
  }
}

/** Remove da fila a música que acabou de tocar (modo simples). Ajusta
 * currentIndex pra continuar apontando corretamente pra próxima música
 * (que "deslizou" uma posição pra trás depois da remoção). */
function removeFinishedTrackFromQueue() {
  if (currentIndex < 0 || currentIndex >= playlist.length) return;
  playlist.splice(currentIndex, 1);
  currentIndex -= 1;
  renderPlaylist(); // já persiste a fila atualizada
  if (playlist.length === 0) resetToEmptyState();
}

/** Fim de música no modo simples: tira a que acabou da fila e deixa a
 * próxima carregada (pausada). Ela só começa sozinha, após a contagem, se
 * o autoplay estiver ligado. Sem próxima, o palco volta ao estado vazio
 * (senão o Play tocaria de novo a música que já saiu da fila). */
async function handleSimpleModeSongEnded() {
  removeFinishedTrackFromQueue();
  if (playlist.length === 0) return; // removeFinishedTrackFromQueue já resetou
  if (!hasNext()) {
    currentIndex = -1;
    resetToEmptyState();
    return;
  }
  const nextIndex = currentIndex + 1;
  await selectTrack(nextIndex, { autoplay: false, initialSemitones: playlist[nextIndex].savedSemitones || 0 });
  startAutoplayCountdownIfNeeded();
}

function startAutoplayCountdownIfNeeded() {
  if (!autoplayToggle.checked || mode === null || currentIndex < 0) return;
  resetCountdownDisplayToSimple();

  const delay = Math.max(0, parseInt(autoplayDelayInput.value, 10) || 0);
  const nextItem = playlist[currentIndex];
  const nextTitleText = [nextItem.artist, nextItem.title].filter(Boolean).join(' — ');
  cdNextTitle.textContent = nextTitleText;
  countdownOverlay.classList.remove('hidden');
  countdownRemaining = delay;
  cdNumber.textContent = String(countdownRemaining);
  refreshIdleState();
  broadcastToSecondScreen({ type: 'countdown-start', delay, remaining: countdownRemaining, nextTitle: nextTitleText, labels: getCountdownLabels() });

  if (delay <= 0) {
    finishCountdown();
    return;
  }

  countdownTimerId = setInterval(() => {
    countdownRemaining -= 1;
    cdNumber.textContent = String(Math.max(0, countdownRemaining));
    broadcastToSecondScreen({ type: 'countdown-tick', remaining: Math.max(0, countdownRemaining) });
    if (countdownRemaining <= 0) {
      finishCountdown();
    }
  }, 1000);
}

cdSkipBtn.addEventListener('click', () => {
  if (singerModeEnabled) finishSingerCountdown(); else finishCountdown();
});

// ---------- Aplausos: indicador clicável ----------

function updateApplauseIndicator() {
  const on = applauseToggle.checked;
  quickApplauseBtn.classList.toggle('on', on);
}
applauseToggle.addEventListener('change', updateApplauseIndicator);
quickApplauseBtn.addEventListener('click', () => {
  applauseToggle.checked = !applauseToggle.checked;
  applauseToggle.dispatchEvent(new Event('change'));
});

// ---------- Música ambiente (toca quando nada mais está tocando) ----------

const AMBIENT_TRACKS = [
  'assets/ambient/blues.mp3',
  'assets/ambient/afrobeat.mp3',
  'assets/ambient/jazz.mp3',
  'assets/ambient/reggae.mp3',
  'assets/ambient/pop.mp3',
];

let ambientActive = false; // true = tocando (ou em fade), controlado por updateAmbientState()
let ambientHasTrack = false; // já tem uma faixa carregada (retoma de onde parou entre músicas)
let ambientFadeIntervalId = null;

// De onde vem a música ambiente (faixas do app ou pasta própria) e a ordem
// aleatória sem repetição — ver js/ambient-playlist.js.
const ambientPlaylist = window.createAmbientPlaylist({
  builtinTracks: AMBIENT_TRACKS,
  onChange: renderAmbientSource,
});
const ambientSourceBuiltinBtn = el('ambient-source-builtin-btn');
const ambientSourceCustomBtn = el('ambient-source-custom-btn');
const ambientCustomRow = el('ambient-custom-row');
const ambientFolderInfo = el('ambient-folder-info');
const ambientChooseFolderBtn = el('ambient-choose-folder-btn');

function renderAmbientSource() {
  const custom = ambientPlaylist.getSource() === 'custom';
  ambientSourceBuiltinBtn.classList.toggle('on', !custom);
  ambientSourceCustomBtn.classList.toggle('on', custom);
  ambientCustomRow.classList.toggle('hidden', !custom);
  ambientChooseFolderBtn.classList.toggle('hidden', !custom);
  const folder = ambientPlaylist.getFolder();
  let info;
  let warn = false;
  if (!folder) { info = window.i18n.t('ambient_no_folder'); }
  else if (folder.needsPermission) { info = window.i18n.t('ambient_folder_needs_permission', { name: folder.name }); warn = true; }
  else if (!folder.count) { info = window.i18n.t('ambient_folder_empty', { name: folder.name }); warn = true; }
  else { info = window.i18n.t('ambient_folder_info', { name: folder.name, count: folder.count }); }
  ambientFolderInfo.textContent = info;
  ambientFolderInfo.title = info;
  ambientFolderInfo.classList.toggle('warn', warn);
  ambientChooseFolderBtn.textContent = window.i18n.t(
    folder && folder.needsPermission ? 'ambient_reconnect_folder' : folder ? 'ambient_change_folder' : 'ambient_choose_folder');
}

/** A fonte mudou: a próxima faixa já vem da fonte nova (troca na hora se estiver tocando). */
function restartAmbientFromNewSource() {
  ambientHasTrack = false;
  if (!ambientActive) return;
  ambientActive = false;
  if (ambientFadeIntervalId) { clearInterval(ambientFadeIntervalId); ambientFadeIntervalId = null; }
  ambientAudio.pause();
  startAmbient();
}

ambientSourceBuiltinBtn.addEventListener('click', () => {
  if (ambientPlaylist.getSource() === 'builtin') return;
  ambientPlaylist.setSource('builtin');
  restartAmbientFromNewSource();
});
ambientSourceCustomBtn.addEventListener('click', async () => {
  if (ambientPlaylist.getSource() === 'custom') return;
  ambientPlaylist.setSource('custom');
  if (!ambientPlaylist.getFolder()) await ambientPlaylist.chooseFolder(el('ambient-folder-input'));
  restartAmbientFromNewSource();
});
ambientChooseFolderBtn.addEventListener('click', async () => {
  const folder = ambientPlaylist.getFolder();
  const changed = folder && folder.needsPermission
    ? await ambientPlaylist.reconnect()
    : await ambientPlaylist.chooseFolder(el('ambient-folder-input'));
  if (changed) restartAmbientFromNewSource();
});
ambientPlaylist.restore().then(renderAmbientSource);

function getAmbientTargetVolume() {
  return Number(ambientVolumeSlider.value) / 100;
}

function fadeAudioTo(audioEl, targetVolume, durationMs, onComplete) {
  if (ambientFadeIntervalId) {
    clearInterval(ambientFadeIntervalId);
    ambientFadeIntervalId = null;
  }
  const steps = 24;
  const stepMs = Math.max(16, durationMs / steps);
  const startVolume = audioEl.volume;
  let step = 0;
  ambientFadeIntervalId = setInterval(() => {
    step += 1;
    const t = Math.min(1, step / steps);
    audioEl.volume = startVolume + (targetVolume - startVolume) * t;
    if (t >= 1) {
      clearInterval(ambientFadeIntervalId);
      ambientFadeIntervalId = null;
      if (onComplete) onComplete();
    }
  }, stepMs);
}

async function startAmbient() {
  if (ambientActive) return;
  ambientActive = true;

  if (!ambientHasTrack) {
    const url = await ambientPlaylist.next();
    if (!ambientActive) return; // parou enquanto a faixa era aberta
    ambientAudio.src = url;
    ambientHasTrack = true;
  }
  ambientAudio.volume = 0;
  ambientAudio.play().catch(err => console.warn('[App] Não foi possível tocar a música ambiente:', err));
  fadeAudioTo(ambientAudio, getAmbientTargetVolume(), 1200);
}

function stopAmbient() {
  if (!ambientActive) return;
  ambientActive = false;
  fadeAudioTo(ambientAudio, 0, 800, () => {
    ambientAudio.pause();
  });
}

/** Próxima faixa da rodada (aleatória, sem repetir até todas tocarem). */
async function playNextAmbientTrack() {
  if (!ambientActive) return;
  const url = await ambientPlaylist.next();
  if (!ambientActive) return;
  ambientAudio.src = url;
  ambientAudio.volume = getAmbientTargetVolume();
  ambientAudio.play().catch(() => {});
}
ambientAudio.addEventListener('ended', playNextAmbientTrack);
// Arquivo próprio corrompido/ilegível: pula pro próximo em vez de ficar mudo
// (com limite, pra não entrar em loop se nenhuma faixa abrir).
let ambientErrorStreak = 0;
ambientAudio.addEventListener('playing', () => { ambientErrorStreak = 0; });
ambientAudio.addEventListener('error', () => {
  if (!ambientHasTrack || ++ambientErrorStreak > 5) return;
  playNextAmbientTrack();
});

function isAnythingPlaying() {
  if (mode === 'cdg') return engine.isPlaying();
  if (mode === 'video') return !mediaEl().paused;
  if (mode === 'youtube') return yt().isPlaying();
  return false;
}

function updateAmbientState() {
  if (!ambientToggle.checked) {
    stopAmbient();
    return;
  }
  if (isAnythingPlaying() || (ytStarting && mode === 'youtube')) {
    stopAmbient();
  } else {
    startAmbient();
  }
}

/** Chamado sempre que o estado de "tocando/parado" muda — atualiza música
 * ambiente e o overlay de tela ociosa juntos, já que os dois dependem
 * exatamente da mesma condição. */
function refreshIdleState() {
  updateAmbientState();
  updateIdleOverlay();
}

function updateIdleOverlay() {
  if (singerModeEnabled) {
    idleOverlay.classList.add('hidden'); // em modo cantores, o card substitui a logo ociosa
    const idle = !isAnythingPlaying();
    const singer = singerManager.getCurrentSinger();

    if (idle && singer) {
      renderRichCountdown(singer);
      countdownOverlay.classList.remove('hidden');
      countdownTimerParts.classList.toggle('hidden', !singerCountdownActive);
      cdSkipBtn.classList.remove('hidden'); // botão "Iniciar Agora" sempre visível quando ocioso em modo cantores
      if (!singerCountdownActive) {
        broadcastToSecondScreen({
          type: 'countdown-start', delay: 0, remaining: 0,
          singerMode: true, timerless: true,
          singer: { name: singer.name, song: singer.songs[0] || null, position: getSingerPosition(singer.id) },
          upcoming: singerManager.getUpcomingSingers(2).map(s => ({ name: s.name, song: s.songs[0] || null, position: getSingerPosition(s.id) })),
          display: { upcoming: cdShowUpcomingToggle.checked, titles: cdShowTitlesToggle.checked, counter: cdShowCounterToggle.checked },
          labels: getCountdownLabels(),
        });
      }
    } else if (!singerCountdownActive) {
      countdownOverlay.classList.add('hidden');
      broadcastToSecondScreen({ type: 'countdown-end' });
    }
    broadcastToSecondScreen({ type: isAnythingPlaying() ? 'playing' : 'idle' });
    return;
  }

  const idle = mode !== null && !isAnythingPlaying();
  idleOverlay.classList.toggle('hidden', !idle);
  broadcastToSecondScreen({ type: isAnythingPlaying() ? 'playing' : 'idle' });
}

// ---------- Imagem de fundo customizada pra tela ociosa ----------

function applyIdleImage() {
  if (customIdleImageDataUrl) {
    idleLogo.classList.add('hidden');
    idleCustomImage.classList.remove('hidden');
    idleCustomImage.style.backgroundImage = `url(${customIdleImageDataUrl})`;
  } else {
    idleLogo.classList.remove('hidden');
    idleCustomImage.classList.add('hidden');
    idleCustomImage.style.backgroundImage = '';
  }
}

idleImageUploadBtn.addEventListener('click', () => idleImageInput.click());
idleImageInput.addEventListener('change', () => {
  const file = idleImageInput.files && idleImageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    customIdleImageDataUrl = reader.result;
    applyIdleImage();
    idleImageFilename.textContent = file.name;
    idleImageFilename.classList.remove('hidden');
    idleImageRemoveBtn.classList.remove('hidden');
    broadcastToSecondScreen({ type: 'idle-image', dataUrl: customIdleImageDataUrl });
  };
  reader.onerror = () => showError(window.i18n.t('err_image_read_fail'));
  reader.readAsDataURL(file);
  idleImageInput.value = '';
});
idleImageRemoveBtn.addEventListener('click', () => {
  customIdleImageDataUrl = null;
  applyIdleImage();
  idleImageFilename.classList.add('hidden');
  idleImageRemoveBtn.classList.add('hidden');
  broadcastToSecondScreen({ type: 'idle-image', dataUrl: null });
});

function updateAmbientIndicator() {
  const on = ambientToggle.checked;
  quickAmbientBtn.classList.toggle('on', on);
}
ambientToggle.addEventListener('change', () => {
  updateAmbientIndicator();
  refreshIdleState();
});
quickAmbientBtn.addEventListener('click', () => {
  ambientToggle.checked = !ambientToggle.checked;
  ambientToggle.dispatchEvent(new Event('change'));
});
ambientVolumeSlider.addEventListener('input', () => {
  const pct = Number(ambientVolumeSlider.value);
  ambientVolumePct.textContent = pct + '%';
  // Se já estiver tocando (fora de fade), ajusta o volume na hora.
  if (ambientActive && !ambientFadeIntervalId) {
    ambientAudio.volume = pct / 100;
  }
});

// ---------- Loop de renderização do CDG + sync da UI ----------

engine.addEventListener('play', () => { updatePlayIcon(); refreshIdleState(); });
engine.addEventListener('pause', () => { updatePlayIcon(); refreshIdleState(); });
engine.addEventListener('ended', () => {
  updatePlayIcon();
  if (mode === 'cdg') handleTrackEnded(); // "ended" de uma mídia que já não é a atual é ignorado
  refreshIdleState();
});
engine.addEventListener('error', (e) => {
  showError(window.i18n.t('err_audio_generic', { msg: e.detail.message }));
});

let lastUiUpdate = 0;
let lastBroadcastTime = 0;
const UI_UPDATE_INTERVAL_MS = 150; // ~6-7x/seg é mais que suficiente pra uma barra de progresso
const BROADCAST_INTERVAL_MS = 33; // ~30x/seg pra segunda tela, fluido sem exagerar em mensagens

engine.onTimeUpdate((currentTime, duration) => {
  // O canvas do CDG atualiza SEMPRE, a taxa cheia (essencial pra fluidez da letra).
  cdgPlayer.update(currentTime);
  checkApplause(currentTime, duration);

  const now = performance.now();
  if (now - lastBroadcastTime >= BROADCAST_INTERVAL_MS) {
    lastBroadcastTime = now;
    broadcastToSecondScreen({ type: 'time', currentTime, duration });
  }

  if (seeking) return;

  if (now - lastUiUpdate < UI_UPDATE_INTERVAL_MS) return;
  lastUiUpdate = now;

  seekBar.value = String(Math.floor(currentTime * 1000));
  timeCurrent.textContent = formatTime(currentTime);
  if (duration) timeDuration.textContent = formatTime(duration);
});

// Mesmos listeners no <video> e no <audio> do MP4 — eventos do elemento que
// não é o ativo (ex: o pause da troca de tela) são ignorados.
for (const media of [videoEl, audioEl]) {
  const isActive = () => media === mediaEl();
  media.addEventListener('play', () => { if (!isActive()) return; updatePlayIcon(); refreshIdleState(); });
  media.addEventListener('pause', () => { if (!isActive()) return; updatePlayIcon(); refreshIdleState(); });
  media.addEventListener('ended', () => {
    if (!isActive()) return;
    updatePlayIcon();
    if (mode === 'video') handleTrackEnded(); // "ended" de uma mídia que já não é a atual é ignorado
    refreshIdleState();
  });
  media.addEventListener('timeupdate', () => {
    if (mode !== 'video' || !isActive()) return;
    checkApplause(media.currentTime, media.duration || 0);
    broadcastToSecondScreen({ type: 'time', currentTime: media.currentTime, duration: media.duration || 0 });
    if (seeking) return;
    seekBar.max = String(Math.floor((media.duration || 0) * 1000));
    seekBar.value = String(Math.floor(media.currentTime * 1000));
    timeCurrent.textContent = formatTime(media.currentTime);
    timeDuration.textContent = formatTime(media.duration || 0);
  });
}

// ---------- Configurações ----------

const settingsNav = el('settings-nav');
const settingsTitle = el('settings-title');

function openSettings(section) {
  if (section) showSettingsSection(section);
  settingsModalBackdrop.classList.remove('hidden');
}
function closeSettings() {
  settingsModalBackdrop.classList.add('hidden');
}
function showSettingsSection(section) {
  settingsNav.querySelectorAll('button[data-sec]').forEach(b => b.classList.toggle('on', b.dataset.sec === section));
  settingsModalBackdrop.querySelectorAll('.s-sec').forEach(sec => sec.classList.toggle('on', sec.dataset.sec === section));
  const btn = settingsNav.querySelector(`button[data-sec="${section}"] span`);
  settingsTitle.dataset.i18n = btn ? btn.dataset.i18n : '';
  settingsTitle.textContent = btn ? btn.textContent : '';
}
settingsNav.querySelectorAll('button[data-sec]').forEach(b => b.addEventListener('click', () => showSettingsSection(b.dataset.sec)));
settingsBtn.addEventListener('click', () => openSettings());
settingsCloseBtn.addEventListener('click', closeSettings);
settingsModalBackdrop.addEventListener('click', (e) => {
  if (e.target === settingsModalBackdrop) closeSettings();
});

// Tema escuro (padrão) / claro. O <head> já aplica o tema salvo antes de
// desenhar a página; aqui só a troca.
const THEME_KEY = 'playkaraoke-theme';
const themeSeg = el('theme-seg');
function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch (err) {}
  themeSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.theme === theme));
  updateHelpLink();
}
themeSeg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));

// Ajuda / manual: abre no mesmo idioma e tema do app.
const helpLink = el('help-link');
function updateHelpLink() {
  helpLink.href = `help.html?lang=${window.i18n.getCurrentLang()}&theme=${currentTheme()}`;
}

function getActiveColors() {
  if (!customColorsToggle.checked) return null;
  return {
    background: colorBackground.value,
    text: colorText.value,
    highlight: colorHighlight.value,
  };
}

function applyCustomColors() {
  cdgPlayer.setCustomColors(getActiveColors());
  broadcastToSecondScreen({ type: 'colors', colors: getActiveColors() });
}

customColorsToggle.addEventListener('change', applyCustomColors);
[colorBackground, colorText, colorHighlight].forEach(input => {
  input.addEventListener('input', applyCustomColors);
});

// ---------- Tela cheia (CDG) ----------

fullscreenBtn.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await stageCanvasWrap.requestFullscreen();
    }
  } catch (err) {
    console.error('Erro ao entrar/sair de tela cheia:', err);
  }
});

// ---------- Segunda tela (janela separada / segundo monitor) ----------

let secondScreenWindow = null;
let secondScreenChannel = null;
let secondScreenPollId = null;

function ensureSecondScreenChannel() {
  if (!secondScreenChannel && 'BroadcastChannel' in window) {
    secondScreenChannel = new BroadcastChannel('playkaraoke-second-screen');
    secondScreenChannel.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg) return;
      if (msg.type === 'ready') {
        if (isSecondScreenOpen()) sendCurrentStateToSecondScreen();
      } else if (msg.type === 'bye') {
        // Segunda tela fechando/recarregando: a mídia volta pra cá na hora.
        setSecondScreenPlayer(false);
      } else if (typeof msg.type === 'string' && msg.type.startsWith('yt-') && msg.type !== 'yt-command') {
        ytRemote.handleMessage(msg);
      }
    });
  }
  return secondScreenChannel;
}

/** Textos fixos que a segunda tela precisa mostrar, já traduzidos no
 * idioma atual — ela não tem seletor de idioma próprio, então recebe
 * isso via broadcast toda vez que o countdown é montado. */
function getCountdownLabels() {
  return {
    cdLabel: window.i18n.t('cd_label_starts_in'),
    aSeguir: window.i18n.t('cd_label_up_next'),
    proximas: window.i18n.t('cd_label_upcoming'),
  };
}

function broadcastToSecondScreen(message) {
  if (!secondScreenWindow || secondScreenWindow.closed) return;
  const channel = ensureSecondScreenChannel();
  if (channel) channel.postMessage(message);
}

function sendCurrentStateToSecondScreen() {
  broadcastToSecondScreen({ type: 'render-mode', light: lightModeToggle.checked });
  broadcastToSecondScreen({ type: 'idle-image', dataUrl: customIdleImageDataUrl });
  // A segunda tela abriu (ou recarregou) e está pronta: vira o player da
  // mídia pesada. Se já era (recarregou), recarrega o YouTube no ponto atual.
  if (!secondScreenPlayer) {
    setSecondScreenPlayer(true);
  } else if (mode === 'youtube' && ytRemote.getVideoId()) {
    ytRemote.load(ytRemote.getVideoId(), { startAt: ytRemote.getCurrentTime(), autoplay: ytRemote.isPlaying() });
  }
  broadcastToSecondScreen({ type: isAnythingPlaying() ? 'playing' : 'idle' });

  if (currentIndex < 0 || !playlist[currentIndex]) return;
  broadcastToSecondScreen({ type: 'colors', colors: getActiveColors() });
  if (mode === 'cdg' && currentCdgBuffer) {
    // Reenvia o estado atual pra popup que acabou de abrir/recarregar.
    const item = playlist[currentIndex];
    broadcastToSecondScreen({
      type: 'init-cdg',
      cdgBuffer: currentCdgBuffer,
      colors: getActiveColors(),
      meta: { title: item.title, artist: item.artist, code: item.code, format: item.format },
    });
    broadcastToSecondScreen({ type: 'time', currentTime: engine.getCurrentTime(), duration: engine.getDuration() });
  } else if (mode === 'video' && currentVideoUrl) {
    const item = playlist[currentIndex];
    broadcastToSecondScreen({ type: 'init-video', videoUrl: currentVideoUrl, meta: { title: item.title, artist: item.artist, code: item.code, format: item.format } });
    broadcastToSecondScreen({ type: 'time', currentTime: mediaEl().currentTime || 0, duration: mediaEl().duration || 0 });
  }
}

/**
 * Liga/desliga "segunda tela como player principal" e transfere a música
 * atual no mesmo ponto (tocando ou pausada): YouTube passa pro player da
 * segunda tela (com som) ou volta pro daqui; MP4 troca entre o <video>
 * daqui e só o <audio> (vídeo só na segunda tela). CDG não muda (o áudio é
 * sempre daqui; só o desenho da tela principal fica leve).
 */
function setSecondScreenPlayer(on) {
  if (on === secondScreenPlayer) return;
  const fromYt = yt();
  const fromMedia = mediaEl();
  secondScreenPlayer = on;
  if (mode === 'youtube') handoffYouTube(fromYt, yt());
  else if (mode === 'video') handoffMedia(fromMedia, mediaEl());
  updateStageVisibility();
  updatePlayIcon();
}

async function handoffYouTube(from, to) {
  const id = from.getVideoId();
  if (!id) return;
  const startAt = from.getCurrentTime();
  const autoplay = from.isPlaying();
  from.stop();
  to.setVolume(Number(volumeSlider.value) / 100);
  try {
    await to.load(id, { startAt, autoplay });
  } catch (err) {
    showError(window.i18n.t('youtube_err_load'));
  }
  updatePlayIcon();
  refreshIdleState();
}

async function handoffMedia(from, to) {
  if (!currentVideoUrl) return;
  const startAt = from.currentTime || 0;
  const wasPlaying = !from.paused;
  from.pause();
  from.removeAttribute('src');
  from.load();
  to.src = currentVideoUrl;
  to.load();
  videoPitchRouted = engine.isVideoPitchRouted(to)
    || ((await engine.ensureVideoPitchSupport()) && engine.attachVideoElement(to));
  applyMediaVolume();
  if (to.readyState < 1) {
    await new Promise((resolve) => {
      to.addEventListener('loadedmetadata', resolve, { once: true });
      setTimeout(resolve, 3000);
    });
  }
  to.currentTime = startAt;
  if (wasPlaying) await to.play().catch(() => {});
  updatePlayIcon();
  refreshIdleState();
}

openSecondBtn.addEventListener('click', toggleSecondScreen);

function isSecondScreenOpen() {
  return !!(secondScreenWindow && !secondScreenWindow.closed);
}

function updateSecondScreenIndicator() {
  const open = isSecondScreenOpen();
  cdgPlayer.setLightMode(lightModeToggle.checked || open);
  secondScreenStatus.classList.toggle('hidden', !open);
  openSecondBtn.textContent = open ? window.i18n.t('second_screen_focus') : window.i18n.t('second_screen_open');
  quickSecondScreenBtn.classList.toggle('on', open);
}

function openSecondScreen() {
  if (secondScreenWindow && !secondScreenWindow.closed) {
    secondScreenWindow.focus();
    return;
  }
  ensureSecondScreenChannel();
  secondScreenWindow = window.open('second-screen.html', 'playkaraoke-second-screen', 'width=960,height=540');
  updateSecondScreenIndicator();

  if (secondScreenPollId) clearInterval(secondScreenPollId);
  secondScreenPollId = setInterval(() => {
    if (secondScreenWindow && secondScreenWindow.closed) {
      secondScreenWindow = null;
      setSecondScreenPlayer(false);
      updateSecondScreenIndicator();
      clearInterval(secondScreenPollId);
      secondScreenPollId = null;
    }
  }, 1000);
}

function closeSecondScreen() {
  if (secondScreenWindow && !secondScreenWindow.closed) {
    secondScreenWindow.close();
  }
  secondScreenWindow = null;
  setSecondScreenPlayer(false);
  if (secondScreenPollId) {
    clearInterval(secondScreenPollId);
    secondScreenPollId = null;
  }
  updateSecondScreenIndicator();
}

function toggleSecondScreen() {
  if (secondScreenWindow && !secondScreenWindow.closed) {
    closeSecondScreen();
  } else {
    openSecondScreen();
  }
}

quickSecondScreenBtn.addEventListener('click', toggleSecondScreen);

// ---------- Faixa "Arraste aqui arquivos de Karaoke" (acima da lista) ----------
// (soltar é tratado pela janela inteira, acima; aqui só o clique)

sidebarDropzone.addEventListener('click', () => fileInput.click());
sidebarDropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

// ---------- Limpar fila ----------

clearQueueBtn.addEventListener('click', async () => {
  if (!playlist.length) return;
  if (!await showConfirmModal(window.i18n.t('confirm_clear_queue'))) return;
  selectTrackGeneration++;
  playlist = [];
  currentIndex = -1;
  resetToEmptyState();
});

// ---------- Biblioteca (indexação de pastas locais) ----------

const library = window.createLibrary({
  onFoldersChange: renderLibraryFolders,
  onIndexChange: () => {
    // Se tiver uma busca aberta, atualiza os resultados com o índice novo.
    if (searchSource === 'device' && searchInput.value.trim() && !searchResults.classList.contains('hidden')) renderDeviceResults();
    // Pasta reconectada: se a música carregada não abriu por estar pendente, tenta de novo.
    if (mode === null && !isTrackLoading && playlist.length > 0 && playlistRestoreDone && libraryFolderReady(playlist[0])) {
      if (singerModeEnabled && showTurn) loadCurrentSingerTurn(false);
      else if (!singerModeEnabled && currentIndex === -1) selectTrack(0, { autoplay: false, initialSemitones: playlist[0].savedSemitones || 0 });
    }
  },
  onError: (msg) => showError(msg),
});

if (!library.isSupported()) {
  libraryUnsupported.classList.remove('hidden');
  connectFolderBtn.disabled = true;
}

const ICON_FOLDER = '<svg fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/></svg>';
const ICON_RESCAN = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>';

function renderLibraryFolders() {
  const folders = library.getConnectedFolders();
  libraryFoldersList.innerHTML = '';

  if (!folders.length) {
    const hint = document.createElement('p');
    hint.className = 'empty-small';
    hint.textContent = window.i18n.t('library_no_folders');
    libraryFoldersList.appendChild(hint);
    return;
  }

  folders.forEach((folder) => {
    const row = document.createElement('div');
    row.className = 'folder-row';

    const icon = document.createElement('span');
    icon.className = 'folder-icon';
    icon.innerHTML = ICON_FOLDER;

    const textWrap = document.createElement('div');
    textWrap.style.minWidth = '0';
    const nameEl = document.createElement('div');
    nameEl.className = 'folder-name';
    nameEl.textContent = folder.name;
    const countEl = document.createElement('div');
    if (folder.needsPermission) {
      countEl.className = 'folder-count warn';
      countEl.textContent = window.i18n.t('library_reconnect_needed');
    } else if (folder.scanning) {
      countEl.className = 'folder-count';
      countEl.textContent = folder.progress
        ? window.i18n.t('library_scanning_progress', { count: folder.progress.toLocaleString(getLocale()) })
        : window.i18n.t('library_scanning');
    } else {
      countEl.className = 'folder-count';
      countEl.textContent = window.i18n.t('library_files_count', { count: folder.fileCount.toLocaleString(getLocale()) })
        + (folder.scannedAt ? ' · ' + window.i18n.t('library_scanned_at', { date: new Date(folder.scannedAt).toLocaleDateString(getLocale()) }) : '');
    }
    textWrap.appendChild(nameEl);
    textWrap.appendChild(countEl);

    row.appendChild(icon);
    row.appendChild(textWrap);

    if (folder.needsPermission) {
      const reconnectBtn = document.createElement('button');
      reconnectBtn.type = 'button';
      reconnectBtn.className = 'btn sm primary folder-reconnect-btn';
      reconnectBtn.textContent = window.i18n.t('library_reconnect_btn');
      reconnectBtn.addEventListener('click', () => library.reconnectFolder(folder.id));
      row.appendChild(reconnectBtn);
    } else if (!folder.scanning) {
      // O índice fica salvo entre sessões (não reescaneia o HD toda vez que
      // o app abre) — este botão atualiza com arquivos novos/removidos.
      const rescanBtn = document.createElement('button');
      rescanBtn.type = 'button';
      rescanBtn.className = 'icon-btn folder-rescan-btn';
      rescanBtn.title = window.i18n.t('library_rescan_title');
      rescanBtn.innerHTML = ICON_RESCAN;
      rescanBtn.addEventListener('click', () => library.rescanFolder(folder.id));
      row.appendChild(rescanBtn);
    } else {
      // Escaneamento de HD grande pode demorar: dá pra cancelar (o índice
      // anterior continua valendo).
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn sm folder-cancel-btn';
      cancelBtn.textContent = window.i18n.t('library_cancel_scan');
      cancelBtn.addEventListener('click', () => library.cancelScan(folder.id));
      row.appendChild(cancelBtn);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'icon-btn folder-remove-btn';
    removeBtn.title = window.i18n.t('remove_folder_title');
    removeBtn.innerHTML = ICON_X;
    removeBtn.addEventListener('click', () => library.removeFolder(folder.id));
    row.appendChild(removeBtn);

    libraryFoldersList.appendChild(row);
  });
}
renderLibraryFolders();

/** Referência salva de um item da Biblioteca (sobrevive ao F5). */
function libraryItemSource(item) {
  return { folderId: item.folderId, fileName: item.name, path: item.path || [] };
}

/** Item da Biblioteca a partir da referência salva. Com o caminho salvo
 * (v2.6+) não precisa consultar o índice; referências antigas consultam. */
/** A pasta da música está conectada, com permissão e já escaneada? */
function libraryFolderReady(item) {
  const src = item && item.librarySource;
  return !!src && library.getConnectedFolders().some(f => f.id === src.folderId && !f.needsPermission && !f.scanning);
}

/** Música da Biblioteca restaurada sem arquivo (pasta sem permissão ou HD
 * desconectado depois de reiniciar): busca o arquivo na hora de tocar. */
async function resolvePendingLibraryFile(item) {
  try {
    const found = item._libraryItem || await libraryItemFromSource(item.librarySource);
    if (found) {
      item.file = await library.getFileForItem(found);
      return item.file;
    }
  } catch (err) { /* cai no aviso abaixo */ }
  throw new Error(window.i18n.t('err_library_song_pending'));
}

async function libraryItemFromSource(src) {
  if (!src) return null;
  if (Array.isArray(src.path)) {
    const p = window.parseKaraokeFilename(src.fileName);
    const isMp4 = src.fileName.toLowerCase().endsWith('.mp4');
    return { folderId: src.folderId, name: src.fileName, path: src.path, code: p.code, artist: p.artist, title: p.title,
      format: isMp4 ? 'MP4' : 'MP3+G', type: isMp4 ? 'video' : 'cdg' };
  }
  return library.findByFolderAndName(src.folderId, src.fileName);
}

async function addLibraryItemToQueue(item) {
  if (singerModeEnabled) {
    await addLibraryItemInSingerMode(item);
    return;
  }
  try {
    const file = await library.getFileForItem(item);
    const beforeLength = playlist.length;
    await addFilesToQueue([file]);
    if (playlist.length > beforeLength) {
      const newItem = playlist[playlist.length - 1];
      newItem.librarySource = libraryItemSource(item);
      persistPlaylist();
    }
  } catch (err) {
    console.error('[App] Erro ao ler arquivo da biblioteca:', err);
    showError(window.i18n.t('err_library_read_fail'));
  }
}

connectFolderBtn.addEventListener('click', () => library.connectNewFolder());

// ---------- Busca (topo): Dispositivos ou YouTube ----------
//
// Dispositivos: instantânea, a cada tecla (índice em memória, na worker).
// YouTube: cada busca gasta cota da API — só roda com Enter, nunca a cada
// tecla. Os resultados abrem numa lista suspensa embaixo da busca; o "+"
// adiciona na fila (ou pergunta o cantor, no Modo Show).

const onlineSearch = window.createOnlineSearch();

let searchSource = 'device'; // 'device' | 'online'
let deviceSearchGeneration = 0;
let onlineSearchGeneration = 0;
// Termo digitado em cada fonte — trocar de fonte não perde o que foi digitado.
const searchQueries = { device: '', online: '' };

function openSearchResults() { searchResults.classList.remove('hidden'); }
function closeSearchResults() { searchResults.classList.add('hidden'); }

function showSearchMessage(key, warn, vars) {
  searchResults.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'res-msg' + (warn ? ' warn' : '');
  p.textContent = window.i18n.t(key, vars);
  searchResults.appendChild(p);
  openSearchResults();
}

function searchResultLabel(text) {
  const label = document.createElement('div');
  label.className = 'res-label';
  label.textContent = text;
  return label;
}

/** Linha de resultado com o "+" colorido. */
function searchResultRow({ title, sub, chip, thumb, onPick, addTitle }) {
  const row = document.createElement('div');
  row.className = 'res';
  if (thumb !== undefined) {
    const img = document.createElement('img');
    img.className = 'thumb';
    img.loading = 'lazy';
    img.alt = '';
    if (thumb) img.src = thumb;
    row.appendChild(img);
  }
  const meta = document.createElement('div');
  meta.className = 'rmeta';
  const t = document.createElement('div');
  t.className = 't';
  t.textContent = title;
  const s = document.createElement('div');
  s.className = 's';
  const subText = document.createElement('span');
  subText.textContent = sub;
  s.appendChild(subText);
  if (chip) s.appendChild(chip);
  meta.appendChild(t);
  meta.appendChild(s);
  const add = document.createElement('span');
  add.className = 'add';
  add.textContent = '+';
  if (addTitle) add.title = addTitle;
  row.appendChild(meta);
  row.appendChild(add);
  row.addEventListener('click', onPick);
  return row;
}

async function renderDeviceResults() {
  const query = searchInput.value;
  const gen = ++deviceSearchGeneration;
  if (!query.trim()) { searchResults.innerHTML = ''; closeSearchResults(); return; }
  if (!library.isSupported()) { showSearchMessage('library_unsupported', true); return; }
  if (!library.getConnectedFolders().length) { showSearchMessage('library_no_folders_search'); return; }

  // A busca roda na thread da Biblioteca; resposta de uma tecla antiga é descartada.
  const results = await library.search(query);
  if (gen !== deviceSearchGeneration || searchSource !== 'device') return;
  searchResults.innerHTML = '';
  if (results.length === 0) { showSearchMessage('library_no_results'); return; }

  searchResults.appendChild(searchResultLabel(window.i18n.t(results.length === 1 ? 'library_results_count_one' : 'library_results_count', { count: results.length })));
  results.forEach((item) => {
    searchResults.appendChild(searchResultRow({
      title: item.title,
      sub: [item.artist, item.code, item.folderName].filter(Boolean).join(' · '),
      chip: createFormatChip(item),
      addTitle: window.i18n.t('online_add_title'),
      onPick: () => addLibraryItemToQueue(item),
    }));
  });
  openSearchResults();
}

async function runOnlineSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  const myGeneration = ++onlineSearchGeneration;
  showSearchMessage('online_searching');
  try {
    const results = await onlineSearch.search(query);
    if (myGeneration !== onlineSearchGeneration || searchSource !== 'online') return;
    renderOnlineResults(results);
  } catch (err) {
    if (myGeneration !== onlineSearchGeneration || searchSource !== 'online') return;
    const code = err && err.code ? err.code : 'server';
    showSearchMessage('online_err_' + code, true);
  }
}

function renderOnlineResults(results) {
  searchResults.innerHTML = '';
  if (!results.length) { showSearchMessage('online_no_results'); return; }
  searchResults.appendChild(searchResultLabel(window.i18n.t('online_results_label')));
  results.forEach((r) => {
    const chip = document.createElement('span');
    chip.className = 'fmt';
    chip.textContent = window.i18n.t('online_badge');
    searchResults.appendChild(searchResultRow({
      title: r.title, sub: r.channel, chip, thumb: r.thumbnail || '',
      addTitle: window.i18n.t('online_add_title'),
      onPick: () => addOnlineResultToQueue(r),
    }));
  });
  openSearchResults();
}

function updateSearchPlaceholder() {
  searchInput.placeholder = window.i18n.t(searchSource === 'online' ? 'online_placeholder' : 'search_placeholder');
}

function setSearchSource(source) {
  if (source === searchSource) return;
  searchQueries[searchSource] = searchInput.value;
  searchSource = source;
  const online = source === 'online';
  searchSourceDeviceBtn.classList.toggle('on', !online);
  searchSourceOnlineBtn.classList.toggle('on', online);
  updateSearchPlaceholder();
  searchInput.value = searchQueries[source];
  searchClearBtn.classList.toggle('hidden', !searchInput.value.trim());
  searchResults.innerHTML = '';
  closeSearchResults();
  onlineSearchGeneration++;
  if (!online) renderDeviceResults();
  searchInput.focus();
}
// Enquanto o Worker não estiver configurado (ONLINE_SEARCH_ENDPOINT vazio),
// a opção YouTube nem aparece — ninguém vê uma função que não funciona.
if (!onlineSearch.isConfigured()) el('search-source-toggle').classList.add('hidden');

searchSourceDeviceBtn.addEventListener('click', () => setSearchSource('device'));
searchSourceOnlineBtn.addEventListener('click', () => setSearchSource('online'));

searchInput.addEventListener('input', () => {
  searchClearBtn.classList.toggle('hidden', !searchInput.value.trim());
  if (searchSource === 'device') renderDeviceResults();
  else if (!searchInput.value.trim()) { searchResults.innerHTML = ''; closeSearchResults(); }
});
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchSource === 'online') runOnlineSearch();
  else if (e.key === 'Escape') { closeSearchResults(); searchInput.blur(); }
});
// Clicar de novo na busca reabre os últimos resultados.
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim() && searchResults.childElementCount) openSearchResults();
});
searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchClearBtn.classList.add('hidden');
  searchResults.innerHTML = '';
  closeSearchResults();
  onlineSearchGeneration++;
  deviceSearchGeneration++;
  searchInput.focus();
});
// Clique fora da busca fecha a lista (um modal aberto por cima, como o
// "Pra quem é essa música?", não conta como "fora").
document.addEventListener('mousedown', (e) => {
  if (searchBox.contains(e.target) || e.target.closest('.modal-back')) return;
  closeSearchResults();
});

/** Transforma um resultado Online num item de fila. Tenta separar
 * "Artista - Música" do título do vídeo; o canal fica guardado à parte. */
function buildOnlineItem(r) {
  const cleanTitle = r.title.replace(/\s*[([]?\s*karaok[eê]\s*(version|versão)?\s*[)\]]?\s*/gi, ' ').replace(/\s+/g, ' ').trim() || r.title;
  const parts = cleanTitle.split(/\s+[-–—|]\s+/).map(p => p.trim()).filter(Boolean);
  return {
    id: 'track_' + (++playlistIdCounter),
    type: 'youtube',
    format: 'YouTube',
    file: null,
    videoId: r.videoId,
    thumbnail: r.thumbnail || '',
    channel: r.channel || '',
    code: null,
    artist: parts.length >= 2 ? parts[0] : null,
    title: parts.length >= 2 ? parts.slice(1).join(' - ') : cleanTitle,
    savedSemitones: 0,
  };
}

async function addOnlineResultToQueue(r) {
  const item = buildOnlineItem(r);
  if (singerModeEnabled) {
    const choice = await openSingerPickerModal({ name: r.title });
    if (!choice) return;
    try {
      singerManager.addSongToSinger(choice.singerId, choice.isNew, item);
    } catch (err) {
      showError(err.message);
      return;
    }
    if (mode === null) loadCurrentSingerTurn(false);
    return;
  }
  const wasEmpty = playlist.length === 0;
  playlist.push(item);
  renderPlaylist();
  if (wasEmpty) await selectTrack(playlist.length - 1, { autoplay: false });
}

// ---------- Rodada de cantores ----------

let singerModeEnabled = false;
const SINGERS_STORAGE_KEY = 'playkaraoke-singers-v1';

const singerManager = window.createSingerManager({
  onChange: () => {
    renderSingerRoundView(); persistSingers(); scheduleShowTurnSync(); syncRotationModeSeg();
    refreshManageSingersIfOpen(); // a música pode acabar com o Gerenciar aberto
    if (singerModeEnabled) updateNextBtnState();
    if (singerModeEnabled && playlistRestoreDone) updateIdleOverlay(); // cartão "A seguir" acompanha a rodada
  },
});

/**
 * A música do cantor da vez fica pré-carregada (pausada) antes de ele
 * começar. Se o operador trocar/remover/reordenar a fila DESSE cantor nesse
 * momento, recarrega a música certa — antes o player continuava com a
 * antiga e o Play tocava a música errada. Não mexe em nada se a
 * apresentação já começou (tocando ou pausada no meio).
 */
let showTurnSyncScheduled = false;
function scheduleShowTurnSync() {
  if (showTurnSyncScheduled) return;
  showTurnSyncScheduled = true;
  setTimeout(() => { showTurnSyncScheduled = false; syncLoadedShowTurn(); }, 0);
}
function syncLoadedShowTurn() {
  // (durante a restauração inicial quem carrega é a própria inicialização)
  if (!playlistRestoreDone || !singerModeEnabled || isTrackLoading || singerCountdownActive) return;
  if (isAnythingPlaying() || getCurrentPosition() > 0) return; // apresentação em andamento
  const singer = singerManager.getCurrentSinger();
  const wanted = singer && singer.songs.length ? singer.songs[0] : null;
  if (showTurn) {
    if (singer && singer.id === showTurn.singerId && wanted && wanted.id === showTurn.song.id) return; // já é a certa
    loadCurrentSingerTurn(false);
  } else if (mode === null && wanted) {
    loadCurrentSingerTurn(false); // cantor da vez estava sem música e ganhou uma
  }
}

function applySingerModeVisibility() {
  playlistEl.classList.toggle('hidden', singerModeEnabled);
  singerRoundView.classList.toggle('hidden', !singerModeEnabled);
  clearQueueBtn.classList.toggle('hidden', singerModeEnabled);
  addSingerBtn.classList.toggle('hidden', !singerModeEnabled);
  manageSingersSidebarBtn.classList.toggle('hidden', !singerModeEnabled);
  if (singerModeEnabled) renderSingerRoundView(); else renderPlaylist();
}

function updateShowModeBtnDisplay() {
  showModeBtn.classList.toggle('active', singerModeEnabled);
  showModeBtnLabel.textContent = singerModeEnabled ? window.i18n.t('end_show') : window.i18n.t('start_show_mode');
  el('show-mode-icon-start').classList.toggle('hidden', singerModeEnabled);
  el('show-mode-icon-end').classList.toggle('hidden', !singerModeEnabled);
  // No Modo Show o "Próxima" encerra a apresentação (tooltip muda junto).
  updateNextBtnState();
}

const SHOW_WELCOME_HIDE_KEY = 'playkaraoke-hide-show-welcome';
const showModeWelcomeBackdrop = el('show-mode-welcome-backdrop');
const welcomeDontShowAgain = el('welcome-dont-show-again');
const welcomeStartBtn = el('welcome-start-btn');

const SHOW_START_KEY = 'playkaraoke-show-start';

function actuallyEnableSingerMode() {
  // A duração do show conta a partir daqui (não do login).
  try { localStorage.setItem(SHOW_START_KEY, String(Date.now())); } catch (err) {}
  singerModeEnabled = true;
  applySingerModeVisibility();
  updateShowModeBtnDisplay();
  persistSingers();
  loadCurrentSingerTurn(false);
}

showModeBtn.addEventListener('click', () => {
  if (!singerModeEnabled) {
    let alreadyDismissed = false;
    try { alreadyDismissed = localStorage.getItem(SHOW_WELCOME_HIDE_KEY) === 'true'; } catch (err) {} // dados do site bloqueados
    if (alreadyDismissed) {
      rotationModeBackdrop.classList.remove('hidden');
    } else {
      welcomeDontShowAgain.checked = false;
      showModeWelcomeBackdrop.classList.remove('hidden');
    }
  } else {
    // Já está ligado: "encerrar" passa pelo fluxo completo (confirmação
    // + relatório) — não existe mais um jeito de só desligar sem
    // encerrar de verdade.
    endShowConfirmBackdrop.classList.remove('hidden');
  }
});

welcomeStartBtn.addEventListener('click', () => {
  if (welcomeDontShowAgain.checked) {
    try { localStorage.setItem(SHOW_WELCOME_HIDE_KEY, 'true'); } catch (err) {}
  }
  showModeWelcomeBackdrop.classList.add('hidden');
  rotationModeBackdrop.classList.remove('hidden');
});

// Tipo de rodízio: perguntado a cada show novo; o show começa ao escolher.
const rotationModeBackdrop = el('rotation-mode-backdrop');
rotationModeBackdrop.querySelectorAll('.rot-mode').forEach(btn => btn.addEventListener('click', () => {
  rotationModeBackdrop.classList.add('hidden');
  singerManager.setRotationMode(btn.dataset.mode);
  actuallyEnableSingerMode();
}));
el('rotation-cancel-btn').addEventListener('click', () => rotationModeBackdrop.classList.add('hidden'));
rotationModeBackdrop.addEventListener('click', (e) => {
  if (e.target === rotationModeBackdrop) rotationModeBackdrop.classList.add('hidden');
});

// Configurações: trocar o tipo no meio do show (vale pra quem chegar depois).
const rotationModeSeg = el('rotation-mode-seg');
function syncRotationModeSeg() {
  const mode = singerManager.getRotationMode();
  rotationModeSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
}
rotationModeSeg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  singerManager.setRotationMode(b.dataset.mode);
  if (!manageSingersBackdrop.classList.contains('hidden')) {
    renderManageSingersList();
    if (selectedManageSingerId) renderManageSingerDetail(selectedManageSingerId);
  }
}));
syncRotationModeSeg();

/** Modo mesa: pergunta a mesa de um cantor (vazio = sem mesa). */
async function askSingerTable(name, current) {
  const v = await showPromptModal(window.i18n.t('prompt_singer_table', { name }), current ? String(current) : '');
  if (v === null) return undefined; // cancelou
  const n = parseInt(v, 10);
  return n > 0 ? n : null;
}

/** Selo AUSENTE do cantor. */
function awayChip(singer) {
  if (!singer.away) return null;
  const chip = document.createElement('span');
  chip.className = 'away-chip';
  chip.textContent = window.i18n.t('away_chip');
  return chip;
}

/** Selo "M4" do cantor no modo mesa. */
function tableChip(singer) {
  if (singerManager.getRotationMode() !== 'table' || !singer.table) return null;
  const chip = document.createElement('span');
  chip.className = 'table-chip';
  chip.textContent = window.i18n.t('table_short', { n: singer.table });
  chip.title = window.i18n.t('table_label', { n: singer.table });
  return chip;
}
showModeWelcomeBackdrop.addEventListener('click', (e) => {
  if (e.target === showModeWelcomeBackdrop) showModeWelcomeBackdrop.classList.add('hidden');
});

/** Posição real (1-based) de um cantor na lista completa da rodada —
 * NÃO é relativo a quem está tocando agora, é a posição de cadastro. */
function getSingerPosition(singerId) {
  const idx = singerManager.getAllSingers().findIndex(s => s.id === singerId);
  return idx >= 0 ? idx + 1 : null;
}

function renderSingerRoundView() {
  if (editingSingerPosition()) return;
  const allSingers = singerManager.getAllSingers();
  singerListFull.innerHTML = '';
  if (singerModeEnabled) setListTitle(window.i18n.t('singer_rotation_label'), allSingers.length);

  if (allSingers.length === 0) {
    currentSingerEmpty.classList.remove('hidden');
    return;
  }
  currentSingerEmpty.classList.add('hidden');

  const currentSinger = singerManager.getCurrentSinger();
  const upNext = singerManager.getUpcomingSingers(1)[0] || null;

  allSingers.forEach((s, i) => {
    const isActive = currentSinger && s.id === currentSinger.id;
    const row = document.createElement('div');
    row.className = 'row singer-playlist-item' + (isActive ? ' active' : '');
    row.draggable = true;
    row.dataset.singerId = s.id;

    const posBadge = document.createElement('span');
    posBadge.className = 'pos';
    posBadge.textContent = String(i + 1);
    if (!isActive) makeSingerPositionEditable(posBadge, s.id, i);

    const meta = document.createElement('div');
    meta.style.minWidth = '0';
    const nameLine = document.createElement('div');
    nameLine.className = 'l1';
    const nameText = document.createElement('span');
    nameText.className = 'nm';
    nameText.textContent = s.name;
    const songCountBadge = document.createElement('span');
    songCountBadge.className = 'count' + (s.songs.length === 0 ? ' empty' : '');
    songCountBadge.textContent = `${s.songs.length}/${singerManager.MAX_SONGS_PER_SINGER}`;
    nameLine.appendChild(nameText);
    const tChip = tableChip(s);
    if (tChip) nameLine.appendChild(tChip);
    nameLine.appendChild(songCountBadge);
    const aChip = awayChip(s);
    if (aChip) { nameLine.appendChild(aChip); row.classList.add('is-away'); }
    if (isActive) {
      // CANTANDO enquanto toca; antes de começar, é quem vem a seguir.
      const chip = createNowChip('singing_chip');
      chip.dataset.idleText = window.i18n.t('up_next_chip');
      chip.dataset.playText = window.i18n.t('singing_chip');
      nameLine.appendChild(chip);
      syncSingerChip(chip);
    } else if (upNext && s.id === upNext.id && s.id !== (currentSinger && currentSinger.id)) {
      const next = document.createElement('span');
      next.className = 'chip is-next upnext-chip' + (isAnythingPlaying() ? '' : ' hidden');
      next.textContent = window.i18n.t('up_next_chip');
      nameLine.appendChild(next);
    }
    meta.appendChild(nameLine);

    if (s.songs.length > 0) {
      meta.appendChild(createSongSubLine(s.songs[0], { withTitle: true }));
    } else {
      const subLine = document.createElement('div');
      subLine.className = 'l2' + (isActive ? ' waiting' : '');
      subLine.textContent = window.i18n.t(isActive ? 'waiting_for_song' : 'no_song_in_queue');
      meta.appendChild(subLine);
    }

    row.appendChild(posBadge);
    row.appendChild(meta);

    if (isActive) {
      // "Trocar música": antes de começar ou no meio (cantor que desiste da
      // música e pede outra) — aí a atual para e não conta como cantada.
      const swapBtn = document.createElement('button');
      swapBtn.type = 'button';
      swapBtn.className = 'singer-swap-btn';
      swapBtn.textContent = window.i18n.t('swap_song_btn');
      swapBtn.title = window.i18n.t('swap_song_btn_title');
      swapBtn.addEventListener('click', (e) => { e.stopPropagation(); openSwapSongModal(s.id); });
      row.appendChild(swapBtn);
    } else {
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.appendChild(rowActionBtn(ICON_UP, window.i18n.t('move_up_title'), i === 0, () => singerManager.reorderSinger(i, i - 1)));
      actions.appendChild(rowActionBtn(ICON_DOWN, window.i18n.t('move_down_title'), i === allSingers.length - 1, () => singerManager.reorderSinger(i, i + 2)));
      actions.appendChild(rowActionBtn(ICON_X, window.i18n.t('remove_singer_title'), false, async () => {
        if (await showConfirmModal(window.i18n.t('confirm_remove_singer', { name: s.name }))) {
          singerManager.removeSinger(s.id);
        }
      }));
      row.appendChild(actions);
    }

    // Clique abre o Gerenciar Cantores já no cantor certo.
    row.addEventListener('click', () => {
      selectedManageSingerId = s.id;
      openManageSingersModal();
    });

    // Arrastar pra reordenar.
    row.addEventListener('dragstart', () => {
      singerDragFromIndex = i;
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      singerListFull.querySelectorAll('.row').forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (singerDragFromIndex === null || singerDragFromIndex === i) return;
      const rect = row.getBoundingClientRect();
      const isTopHalf = e.clientY < rect.top + rect.height / 2;
      row.classList.toggle('drag-over-top', isTopHalf);
      row.classList.toggle('drag-over-bottom', !isTopHalf);
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over-top', 'drag-over-bottom'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over-top', 'drag-over-bottom');
      if (singerDragFromIndex === null || singerDragFromIndex === i) return;
      const rect = row.getBoundingClientRect();
      const isTopHalf = e.clientY < rect.top + rect.height / 2;
      const targetIndex = isTopHalf ? i : i + 1;
      singerManager.reorderSinger(singerDragFromIndex, targetIndex);
      singerDragFromIndex = null;
    });

    singerListFull.appendChild(row);
  });
}

/** Selo do cantor da vez: CANTANDO enquanto toca, A SEGUIR antes de começar. */
function syncSingerChip(chip) {
  const playing = isAnythingPlaying();
  chip.classList.remove('hidden');
  chip.classList.toggle('is-now', playing);
  chip.classList.toggle('is-next', !playing);
  chip.textContent = playing ? chip.dataset.playText : chip.dataset.idleText;
}

/** Chamado sempre que o estado de play/pause muda, pra manter a tag
 * TOCANDO da lista de cantores sincronizada (sem precisar re-renderizar
 * a lista inteira, que perderia o estado de drag). */
function updateSingerNowPlayingBadge() {
  const badge = singerListFull.querySelector('.now-playing-badge');
  if (badge) syncSingerChip(badge);
  // Enquanto ninguém canta, "a seguir" é o próprio cantor da vez.
  const nextChip = singerListFull.querySelector('.upnext-chip');
  if (nextChip) nextChip.classList.toggle('hidden', !isAnythingPlaying());
}

/** A música carregada já começou (tocando, ou pausada no meio)? */
function performanceStarted() {
  return mode !== null && (isAnythingPlaying() || getCurrentPosition() > 0);
}

// ---------- Modal "Trocar música" (cantor da vez, Modo Show) ----------

const swapSongBackdrop = el('swap-song-backdrop');
const swapSongSearch = el('swap-song-search');
const swapSongResults = el('swap-song-results');
const swapSourceDeviceBtn = el('swap-source-device-btn');
const swapSourceOnlineBtn = el('swap-source-online-btn');
const swapSongFileInput = el('swap-song-file-input');
let swapSingerId = null;
let swapOpenedTurn = null;        // a vez de quando o modal abriu
let swapOpenedInterrupting = false; // abriu com o cantor já cantando
let swapSource = 'device';
let swapSearchGeneration = 0;

function openSwapSongModal(singerId) {
  const singer = singerManager.getAllSingers().find(s => s.id === singerId);
  if (!singer) return;
  swapSingerId = singerId;
  el('swap-song-title').textContent = window.i18n.t('swap_song_title', { name: singer.name });
  // Se ele já está cantando, "atual" é a que está tocando (o operador pode
  // ter reordenado a fila dele no meio da apresentação).
  const playing = performanceStarted() && showTurn && showTurn.singerId === singerId ? showTurn.song : null;
  swapOpenedTurn = showTurn;
  swapOpenedInterrupting = !!playing;
  const current = playing || singer.songs[0];
  el('swap-song-current').textContent = current
    ? window.i18n.t('swap_song_current', { song: [current.artist, current.title].filter(Boolean).join(' — ') })
    : window.i18n.t('swap_song_none');
  // YouTube só se a busca Online estiver configurada.
  el('swap-source-toggle').classList.toggle('hidden', !onlineSearch.isConfigured());
  setSwapSource(library.isSupported() || !onlineSearch.isConfigured() ? 'device' : 'online');
  swapSongSearch.value = '';
  swapSongResults.innerHTML = '';
  swapSongBackdrop.classList.remove('hidden');
  swapSongSearch.focus();
}

function closeSwapSongModal() {
  swapSongBackdrop.classList.add('hidden');
  swapSingerId = null;
  swapSearchGeneration++;
}

function setSwapSource(source) {
  swapSource = source;
  swapSourceDeviceBtn.classList.toggle('on', source === 'device');
  swapSourceOnlineBtn.classList.toggle('on', source === 'online');
  swapSongSearch.placeholder = window.i18n.t(source === 'online' ? 'online_placeholder' : 'swap_song_search_placeholder');
  swapSongResults.innerHTML = '';
  if (source === 'device' && !library.isSupported()) showSwapMessage('library_unsupported');
  else if (source === 'device' && swapSongSearch.value.trim()) renderSwapDeviceResults();
}

function showSwapMessage(key, warn) {
  swapSongResults.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'res-msg' + (warn ? ' warn' : '');
  p.textContent = window.i18n.t(key);
  swapSongResults.appendChild(p);
}

/** Linha de resultado (mesmo visual da busca do topo). */
function swapResultRow(title, sub, onPick, item) {
  return searchResultRow({ title, sub, chip: item ? createFormatChip(item) : null, onPick });
}

async function renderSwapDeviceResults() {
  const q = swapSongSearch.value;
  const gen = ++swapSearchGeneration;
  if (!q.trim()) { swapSongResults.innerHTML = ''; return; }
  const results = await library.search(q);
  if (gen !== swapSearchGeneration) return;
  swapSongResults.innerHTML = '';
  if (!results.length) { showSwapMessage('library_no_results'); return; }
  results.forEach(item => {
    swapSongResults.appendChild(swapResultRow(item.title, [item.artist, item.code].filter(Boolean).join(' · ') || item.format, async () => {
      try {
        const file = await library.getFileForItem(item);
        applySwap({
          id: 'track_' + (++playlistIdCounter), file,
          code: item.code, artist: item.artist, title: item.title,
          format: item.format, type: item.type, savedSemitones: 0,
          librarySource: libraryItemSource(item),
        });
      } catch (err) {
        showError(window.i18n.t('err_library_read_fail'));
      }
    }, item));
  });
}

async function runSwapOnlineSearch() {
  const q = swapSongSearch.value.trim();
  if (!q) return;
  const gen = ++swapSearchGeneration;
  showSwapMessage('online_searching');
  try {
    const results = await onlineSearch.search(q);
    if (gen !== swapSearchGeneration) return;
    swapSongResults.innerHTML = '';
    if (!results.length) { showSwapMessage('online_no_results'); return; }
    results.forEach(r => swapSongResults.appendChild(swapResultRow(r.title, r.channel, () => applySwap(buildOnlineItem(r)), { type: 'youtube' })));
  } catch (err) {
    if (gen !== swapSearchGeneration) return;
    showSwapMessage('online_err_' + (err && err.code ? err.code : 'server'), true);
  }
}

/** Troca a música do cantor pela escolhida. Antes de começar, a recarga
 * no player é automática (scheduleShowTurnSync, no onChange da rodada).
 * No meio da apresentação (cantor desistiu e pediu outra), a que está
 * tocando para, sai da fila sem ir pro histórico, e a nova fica carregada
 * (pausada) pro operador dar Play. */
function applySwap(song) {
  if (!swapSingerId) return;
  const singerId = swapSingerId;
  // A música pode ter acabado com o modal aberto: aí a abandonada já saiu
  // da fila e a nova entra na frente, sem apagar a próxima que ele pediu.
  const turnEnded = swapOpenedInterrupting && showTurn !== swapOpenedTurn;
  const interrupting = !turnEnded && performanceStarted() && showTurn && showTurn.singerId === singerId;
  try {
    if (interrupting) {
      // Tira a abandonada (se ainda estiver na fila) e a nova entra na frente.
      const singer = singerManager.getAllSingers().find(s => s.id === singerId);
      const idx = singer ? singer.songs.findIndex(s => s.id === showTurn.song.id) : -1;
      if (idx !== -1) singerManager.removeSongFromSinger(singerId, idx);
      singerManager.replaceSong(singerId, -1, song);
    } else {
      singerManager.replaceSong(singerId, turnEnded ? -1 : 0, song);
    }
  } catch (err) {
    showError(err.message);
    return;
  }
  closeSwapSongModal();
  if (interrupting) {
    stopCurrentMedia();
    loadCurrentSingerTurn(false);
  }
}

swapSourceDeviceBtn.addEventListener('click', () => setSwapSource('device'));
swapSourceOnlineBtn.addEventListener('click', () => setSwapSource('online'));
swapSongSearch.addEventListener('input', () => { if (swapSource === 'device') renderSwapDeviceResults(); });
swapSongSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && swapSource === 'online') runSwapOnlineSearch();
  else if (e.key === 'Escape') closeSwapSongModal();
});
el('swap-song-cancel-btn').addEventListener('click', closeSwapSongModal);
swapSongBackdrop.addEventListener('click', (e) => { if (e.target === swapSongBackdrop) closeSwapSongModal(); });
el('swap-song-upload-btn').addEventListener('click', () => swapSongFileInput.click());
swapSongFileInput.addEventListener('change', () => {
  const file = swapSongFileInput.files && swapSongFileInput.files[0];
  swapSongFileInput.value = '';
  if (!file || isGhostFile(file)) return;
  const lower = file.name.toLowerCase();
  const isMp4 = lower.endsWith('.mp4');
  if (!isMp4 && !lower.endsWith('.zip')) { showError(window.i18n.t('err_unsupported_files')); return; }
  const parsed = window.parseKaraokeFilename(file.name);
  applySwap({
    id: 'track_' + (++playlistIdCounter), file,
    code: parsed.code, artist: parsed.artist, title: parsed.title,
    format: isMp4 ? 'MP4' : 'MP3+G', type: isMp4 ? 'video' : 'cdg', savedSemitones: 0,
  });
});

/** Carrega a música do cantor da vez no player (ou mostra estado de espera/vazio). */
async function loadCurrentSingerTurn(autoplay) {
  renderSingerRoundView();
  const singer = singerManager.getCurrentSinger();
  if (!singer || singer.songs.length === 0) {
    resetToEmptyState();
    renderSingerRoundView();
    return;
  }
  const song = singer.songs[0];
  playlist = [song];
  currentIndex = -1;
  showTurn = { singerId: singer.id, singerName: singer.name, song };
  await selectTrack(0, { autoplay, initialSemitones: song.savedSemitones || 0 });
}


// ---------- Modal "Escolher cantor" (aparece ao adicionar música em modo cantores) ----------

let singerPickerResolve = null;
let singerPickerOptions = []; // [{ el, pick }] — opções selecionáveis, na ordem da tela
let singerPickerHi = -1;

const stripAccents = (str) => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function openSingerPickerModal(file) {
  return new Promise((resolve) => {
    singerPickerResolve = resolve;
    singerPickerFilename.textContent = file.name;
    singerPickerInput.value = '';
    renderSingerPickerList();
    singerPickerBackdrop.classList.remove('hidden');
    singerPickerInput.focus();
  }).then(async (choice) => {
    // Modo mesa: cantor novo já nasce com a mesa (pergunta logo depois do nome).
    if (!choice || !choice.isNew || singerManager.getRotationMode() !== 'table') return choice;
    const table = await askSingerTable(choice.singerId);
    if (table === undefined) return null;
    try {
      return { singerId: singerManager.addSinger(choice.singerId, { table }).id, isNew: false };
    } catch (err) {
      showError(err.message);
      return null;
    }
  });
}

/** Nome com o trecho digitado destacado. */
function highlightMatch(name, query) {
  const frag = document.createDocumentFragment();
  const idx = query ? stripAccents(name).indexOf(stripAccents(query)) : -1;
  if (idx < 0) { frag.append(name); return frag; }
  const mark = document.createElement('mark');
  mark.textContent = name.slice(idx, idx + query.length);
  frag.append(name.slice(0, idx), mark, name.slice(idx + query.length));
  return frag;
}

/**
 * "Pra quem é essa música?" — a busca É a lista: cantores em ordem
 * alfabética, filtrando enquanto digita. O primeiro que serve já fica
 * destacado (Enter escolhe). "+ Adicionar 'X'" aparece por último quando há
 * resultados, ou primeiro quando não há. Cantor com a fila cheia aparece
 * desativado.
 */
function renderSingerPickerList() {
  const query = singerPickerInput.value.trim();
  const q = stripAccents(query);
  const max = singerManager.MAX_SONGS_PER_SINGER;
  const singers = singerManager.getAllSingers()
    .filter(s => !q || stripAccents(s.name).includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, getLocale(), { sensitivity: 'base' }));
  const exact = !!query && singerManager.getAllSingers().some(s => stripAccents(s.name) === q);

  singerPickerList.innerHTML = '';
  singerPickerOptions = [];

  const addNewOption = () => {
    const opt = document.createElement('div');
    opt.className = 'opt new';
    const plus = document.createElement('span');
    plus.className = 'plus';
    plus.textContent = '+';
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.textContent = window.i18n.t('singer_picker_add_new', { name: query });
    opt.appendChild(plus);
    opt.appendChild(nm);
    const pick = () => resolveSingerPicker({ singerId: query, isNew: true });
    opt.addEventListener('click', pick);
    singerPickerList.appendChild(opt);
    singerPickerOptions.push({ el: opt, pick });
  };

  if (query && !exact && !singers.length) addNewOption();

  singers.forEach(s => {
    const full = s.songs.length >= max;
    const opt = document.createElement('div');
    opt.className = 'opt' + (full ? ' full' : '');
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.appendChild(highlightMatch(s.name, query));
    const cnt = document.createElement('span');
    cnt.className = 'cnt';
    cnt.textContent = full ? window.i18n.t('singer_picker_full', { count: s.songs.length, max }) : `${s.songs.length}/${max}`;
    opt.appendChild(nm);
    opt.appendChild(cnt);
    if (!full) {
      const pick = () => resolveSingerPicker({ singerId: s.id, isNew: false });
      opt.addEventListener('click', pick);
      singerPickerOptions.push({ el: opt, pick });
    }
    singerPickerList.appendChild(opt);
  });

  if (query && !exact && singers.length) addNewOption();

  if (!singerPickerList.childElementCount) {
    const p = document.createElement('p');
    p.className = 'combo-empty';
    p.textContent = window.i18n.t('singer_picker_empty');
    singerPickerList.appendChild(p);
  }
  setSingerPickerHighlight(singerPickerOptions.length ? 0 : -1);
}

function setSingerPickerHighlight(i) {
  singerPickerOptions.forEach((o, n) => o.el.classList.toggle('hi', n === i));
  singerPickerHi = i;
  if (i >= 0 && singerPickerOptions[i].el.scrollIntoView) singerPickerOptions[i].el.scrollIntoView({ block: 'nearest' });
}

singerPickerInput.addEventListener('input', renderSingerPickerList);
singerPickerInput.addEventListener('keydown', (e) => {
  const n = singerPickerOptions.length;
  if (e.key === 'ArrowDown' && n) { e.preventDefault(); setSingerPickerHighlight((singerPickerHi + 1) % n); }
  else if (e.key === 'ArrowUp' && n) { e.preventDefault(); setSingerPickerHighlight((singerPickerHi - 1 + n) % n); }
  else if (e.key === 'Enter') { e.preventDefault(); if (singerPickerHi >= 0) singerPickerOptions[singerPickerHi].pick(); }
  else if (e.key === 'Escape') { e.preventDefault(); resolveSingerPicker(null); }
});

function resolveSingerPicker(result) {
  if (!singerPickerResolve) return;
  if (result && result.isNew && singerManager.nameExists(result.singerId)) {
    showError(window.i18n.t('err_singer_name_duplicate'));
    return;
  }
  const resolve = singerPickerResolve;
  singerPickerResolve = null;
  singerPickerBackdrop.classList.add('hidden');
  resolve(result);
}

singerPickerCancelBtn.addEventListener('click', () => resolveSingerPicker(null));
singerPickerBackdrop.addEventListener('click', (e) => { if (e.target === singerPickerBackdrop) resolveSingerPicker(null); });

/** Processa uma leva de arquivos perguntando o cantor de cada um, um por um. */
async function addFilesInSingerMode(list) {
  let skippedAny = false;
  for (const file of list) {
    const lower = file.name.toLowerCase();
    const isZip = lower.endsWith('.zip');
    const isMp4 = lower.endsWith('.mp4');
    if (!isZip && !isMp4) { skippedAny = true; continue; }

    const choice = await openSingerPickerModal(file);
    if (!choice) continue; // usuário optou por pular essa música

    const parsed = window.parseKaraokeFilename(file.name);
    const song = {
      id: 'track_' + (++playlistIdCounter),
      file,
      code: parsed.code, artist: parsed.artist, title: parsed.title,
      format: isMp4 ? 'MP4' : 'MP3+G', type: isMp4 ? 'video' : 'cdg',
      savedSemitones: 0,
    };
    try {
      singerManager.addSongToSinger(choice.singerId, choice.isNew, song);
    } catch (err) {
      showError(err.message);
    }
  }
  if (skippedAny) showError(window.i18n.t('err_unsupported_files'));

  if (mode === null) loadCurrentSingerTurn(false);
}

/** Igual, mas pra um único item vindo da Biblioteca (já tem metadados prontos). */
async function addLibraryItemInSingerMode(item) {
  const choice = await openSingerPickerModal({ name: item.name });
  if (!choice) return;
  try {
    const file = await library.getFileForItem(item);
    const song = {
      id: 'track_' + (++playlistIdCounter),
      file,
      code: item.code, artist: item.artist, title: item.title,
      format: item.format, type: item.type,
      savedSemitones: 0,
      librarySource: libraryItemSource(item),
    };
    singerManager.addSongToSinger(choice.singerId, choice.isNew, song);
    if (mode === null) loadCurrentSingerTurn(false);
  } catch (err) {
    console.error('[App] Erro ao ler arquivo da biblioteca:', err);
    showError(window.i18n.t('err_library_read_fail'));
  }
}

// ---------- Persistência da rodada de cantores ----------

function persistSingers() {
  try {
    const raw = singerManager.serialize();
    const safeSingers = raw.singers.map(s => ({
      id: s.id, name: s.name,
      songs: s.songs.map(song => ({
        code: song.code, artist: song.artist, title: song.title,
        format: song.format, type: song.type,
        savedSemitones: song.savedSemitones || 0,
        librarySource: song.librarySource || null,
        ...(song.type === 'youtube' ? { videoId: song.videoId, thumbnail: song.thumbnail, channel: song.channel } : {}),
      })),
      history: s.history,
      table: s.table || null,
      turnRound: s.turnRound,
      away: !!s.away,
    }));
    localStorage.setItem(SINGERS_STORAGE_KEY, JSON.stringify({
      enabled: singerModeEnabled,
      idCounter: raw.idCounter,
      currentSingerId: raw.currentSingerId,
      rotationMode: raw.rotationMode,
      round: raw.round,
      forcedNextId: raw.forcedNextId,
      singers: safeSingers,
    }));
  } catch (err) {
    console.warn('[App] Não foi possível salvar a rodada de cantores:', err);
  }
}

async function restoreSingersFromStorage() {
  let saved;
  try {
    const rawStr = localStorage.getItem(SINGERS_STORAGE_KEY);
    if (!rawStr) return;
    saved = JSON.parse(rawStr);
  } catch (err) { return; }
  if (!saved) return;

  singerModeEnabled = !!saved.enabled;
  applySingerModeVisibility();
  updateShowModeBtnDisplay();

  // Restaura músicas que vieram da Biblioteca (têm referência viva);
  // músicas manuais não sobrevivem a um F5 (mesma limitação já conhecida
  // da fila simples) — ficam de fora, silenciosamente, nessa primeira
  // versão.
  let droppedSongs = 0;
  let pendingSongs = 0;
  const restoredSingers = [];
  for (const s of (saved.singers || [])) {
    const songs = [];
    for (const song of (s.songs || [])) {
      if (song.type === 'youtube' && song.videoId) {
        songs.push({ ...song, id: 'track_' + (++playlistIdCounter), file: null });
        continue;
      }
      if (song.librarySource) {
        // Mesmo com a pasta pedindo permissão, a música fica: o arquivo é
        // buscado na hora de tocar (resolvePendingLibraryFile).
        const ready = library.getConnectedFolders().some(f => f.id === song.librarySource.folderId && !f.needsPermission);
        const found = ready ? await libraryItemFromSource(song.librarySource) : null;
        if (!found) pendingSongs++;
        songs.push({ ...song, id: 'track_' + (++playlistIdCounter), file: null, ...(found ? { _libraryItem: found } : {}) });
        continue;
      }
      droppedSongs++;
    }
    restoredSingers.push({ ...s, songs });
  }

  const snapshot = { idCounter: saved.idCounter || 0, currentSingerId: saved.currentSingerId, rotationMode: saved.rotationMode, round: saved.round, forcedNextId: saved.forcedNextId, singers: restoredSingers };
  singerManager.restore(snapshot);

  // Resolve o `file` de verdade (async) pras músicas restauradas da Biblioteca.
  for (const s of singerManager.getAllSingers()) {
    for (const song of s.songs) {
      if (song._libraryItem && !song.file) {
        try { song.file = await library.getFileForItem(song._libraryItem); } catch (err) { /* ignora */ }
      }
    }
  }

  if (singerModeEnabled) {
    renderSingerRoundView();
    if (droppedSongs > 0) {
      showError(window.i18n.t('err_singer_songs_dropped', { count: droppedSongs }));
    } else if (pendingSongs > 0) {
      showError(window.i18n.t('err_library_songs_pending', { count: pendingSongs }));
    }
  }
}

// ---------- Histórico do show (feature 3) ----------

let showHistory = []; // { horario, cantor, musica, artista, codigo, tom, duracao }
const SHOW_HISTORY_KEY = 'playkaraoke-show-history-v1';

function persistShowHistory() {
  try { localStorage.setItem(SHOW_HISTORY_KEY, JSON.stringify(showHistory)); } catch (err) {}
}
function restoreShowHistory() {
  try {
    const raw = localStorage.getItem(SHOW_HISTORY_KEY);
    if (raw) showHistory = JSON.parse(raw) || [];
  } catch (err) { showHistory = []; }
}

function logSongToShowHistory(singerName, song, semitone, duracao) {
  showHistory.push({
    horario: Date.now(),
    cantor: singerName,
    musica: song.title,
    artista: song.artist || '',
    codigo: song.code || '',
    tom: semitone || 0,
    duracao: duracao || 0,
  });
  persistShowHistory();
}

// ---------- Tela de espera rica (countdown enriquecido em modo cantores) ----------

const CD_SETTINGS_KEY = 'playkaraoke-countdown-settings-v1';

function persistCountdownSettings() {
  try {
    localStorage.setItem(CD_SETTINGS_KEY, JSON.stringify({
      upcoming: cdShowUpcomingToggle.checked,
      titles: cdShowTitlesToggle.checked,
      counter: cdShowCounterToggle.checked,
    }));
  } catch (err) {}
}
function restoreCountdownSettings() {
  try {
    const raw = localStorage.getItem(CD_SETTINGS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    cdShowUpcomingToggle.checked = s.upcoming !== false;
    cdShowTitlesToggle.checked = s.titles !== false;
    cdShowCounterToggle.checked = s.counter !== false;
  } catch (err) {}
}
[cdShowUpcomingToggle, cdShowTitlesToggle, cdShowCounterToggle].forEach(t => t.addEventListener('change', persistCountdownSettings));

function renderRichCountdown(singer) {
  const showTitles = cdShowTitlesToggle.checked;
  const showUpcoming = cdShowUpcomingToggle.checked;
  const showCounter = cdShowCounterToggle.checked;

  cdNumber.classList.toggle('hidden', !showCounter);
  cdNextTitle.classList.add('hidden'); // a versão simples de texto some, usamos o card rico
  cdSingerHighlight.classList.remove('hidden');

  cdSingerNameDisplay.textContent = singer.name;

  if (singer.songs.length > 0) {
    const song = singer.songs[0];
    cdSingerSongDisplay.classList.toggle('hidden', !showTitles);
    cdSingerSongDisplay.textContent = [song.title, song.artist].filter(Boolean).join(' — ');
    cdSingerToneDisplay.classList.add('hidden');
  } else {
    cdSingerSongDisplay.classList.add('hidden');
    cdSingerToneDisplay.classList.remove('hidden');
    cdSingerToneDisplay.textContent = window.i18n.t('waiting_for_song');
  }

  cdUpcomingList.innerHTML = '';
  cdUpcomingSection.classList.toggle('hidden', !showUpcoming);
  if (showUpcoming) {
    const upcoming = singerManager.getUpcomingSingers(2);
    upcoming.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'cd-upcoming-row';
      const posBadge = document.createElement('span');
      posBadge.className = 'pos-badge';
      posBadge.textContent = String(getSingerPosition(s.id));
      const nameBadge = document.createElement('span');
      nameBadge.className = 'name-badge';
      nameBadge.textContent = s.name;
      row.appendChild(posBadge);
      row.appendChild(nameBadge);
      if (showTitles) {
        const songText = document.createElement('span');
        songText.className = 'song-info';
        songText.textContent = s.songs.length > 0 ? [s.songs[0].title, s.songs[0].artist].filter(Boolean).join(' - ') : window.i18n.t('no_song_in_queue');
        row.appendChild(songText);
      }
      cdUpcomingList.appendChild(row);
    });
  }
}

function resetCountdownDisplayToSimple() {
  cdSingerHighlight.classList.add('hidden');
  cdNextTitle.classList.remove('hidden');
  const numEl = document.getElementById('cd-number');
  if (numEl) numEl.classList.remove('hidden');
}

// ---------- Gerenciar Cantores (feature 2) ----------

let selectedManageSingerId = null;
let manageDetailTab = 'queue';

function openManageSingersModal() {
  manageSingersBackdrop.classList.remove('hidden');
  renderManageSingersList();
  if (selectedManageSingerId && singerManager.getAllSingers().some(s => s.id === selectedManageSingerId)) {
    renderManageSingerDetail(selectedManageSingerId);
  } else {
    manageSingersEmpty.classList.remove('hidden');
    manageSingersDetail.classList.add('hidden');
  }
}
openManageSingersBtn.addEventListener('click', openManageSingersModal);
manageSingersSidebarBtn.addEventListener('click', openManageSingersModal);
manageSingersCloseBtn.addEventListener('click', () => manageSingersBackdrop.classList.add('hidden'));
manageSingersBackdrop.addEventListener('click', (e) => { if (e.target === manageSingersBackdrop) manageSingersBackdrop.classList.add('hidden'); });

/** Redesenha o Gerenciar Cantores se estiver aberto (lista + detalhe). */
function refreshManageSingersIfOpen() {
  if (manageSingersBackdrop.classList.contains('hidden')) return;
  renderManageSingersList();
  if (selectedManageSingerId && singerManager.getAllSingers().some(s => s.id === selectedManageSingerId)) {
    renderManageSingerDetail(selectedManageSingerId);
  } else {
    selectedManageSingerId = null;
    manageSingersEmpty.classList.remove('hidden');
    manageSingersDetail.classList.add('hidden');
  }
}

/** Digitando a posição de um cantor: as listas esperam pra redesenhar
 * (senão a caixinha some e os números seguintes disparam os pads). */
function editingSingerPosition() {
  const a = document.activeElement;
  return !!(a && a.classList && a.classList.contains('pos-input'));
}

function renderManageSingersList() {
  if (editingSingerPosition()) return;
  manageSingersList.innerHTML = '';
  const singers = singerManager.getAllSingers();
  const current = singerManager.getCurrentSinger();
  singers.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'ms manage-singer-row' + (s.id === selectedManageSingerId ? ' sel' : '');

    const pos = document.createElement('span');
    pos.className = 'p';
    pos.textContent = String(i + 1);
    makeSingerPositionEditable(pos, s.id, i, renderManageSingersList);

    const info = document.createElement('div');
    info.style.minWidth = '0';
    const nameLine = document.createElement('div');
    nameLine.className = 'nm';
    const nameEl = document.createElement('span');
    nameEl.textContent = s.name;
    nameLine.appendChild(nameEl);
    const tChip = tableChip(s);
    if (tChip) nameLine.appendChild(tChip);
    const aChip = awayChip(s);
    if (aChip) { nameLine.appendChild(aChip); row.classList.add('is-away'); }
    if (current && current.id === s.id) {
      const dot = document.createElement('span');
      dot.className = 'dotnow';
      dot.title = window.i18n.t('singing_chip');
      nameLine.appendChild(dot);
    }
    const count = document.createElement('div');
    count.className = 'c';
    count.textContent = `${s.songs.length}/${singerManager.MAX_SONGS_PER_SINGER} ${window.i18n.t('manage_singers_songs_count')}`;
    info.appendChild(nameLine);
    info.appendChild(count);

    const actions = document.createElement('div');
    actions.className = 'acts';
    actions.appendChild(rowActionBtn(ICON_UP, window.i18n.t('move_up_title'), i === 0, () => { singerManager.reorderSinger(i, i - 1); renderManageSingersList(); }));
    actions.appendChild(rowActionBtn(ICON_DOWN, window.i18n.t('move_down_title'), i === singers.length - 1, () => { singerManager.reorderSinger(i, i + 2); renderManageSingersList(); }));
    actions.appendChild(rowActionBtn(ICON_X, window.i18n.t('delete_btn_title'), false, async () => {
      if (await showConfirmModal(window.i18n.t('confirm_remove_singer', { name: s.name }))) {
        singerManager.removeSinger(s.id);
        if (selectedManageSingerId === s.id) selectedManageSingerId = null;
        renderManageSingersList();
        manageSingersEmpty.classList.remove('hidden');
        manageSingersDetail.classList.add('hidden');
        renderSingerRoundView();
      }
    }));

    row.appendChild(pos);
    row.appendChild(info);
    row.appendChild(actions);
    row.addEventListener('click', () => { selectedManageSingerId = s.id; renderManageSingersList(); renderManageSingerDetail(s.id); });

    manageSingersList.appendChild(row);
  });
}

async function promptAddSinger() {
  const name = await showPromptModal(window.i18n.t('prompt_new_singer_name'));
  if (!name || !name.trim()) return null;
  let table = null;
  if (singerManager.getRotationMode() === 'table') {
    if (singerManager.nameExists(name)) { showError(window.i18n.t('err_singer_name_duplicate')); return null; }
    table = await askSingerTable(name.trim());
    if (table === undefined) return null;
  }
  try {
    return singerManager.addSinger(name, { table });
  } catch (err) {
    showError(err.message);
    return null;
  }
}
addSingerBtn.addEventListener('click', promptAddSinger);

addNewSingerBtn.addEventListener('click', async () => {
  const singer = await promptAddSinger();
  if (!singer) return;
  if (singer.id) selectedManageSingerId = singer.id;
  renderManageSingersList();
  renderSingerRoundView();
  if (singer.id) renderManageSingerDetail(singer.id);
});

function renderManageSingerDetail(singerId) {
  const singer = singerManager.getAllSingers().find(s => s.id === singerId);
  if (!singer) return;
  manageSingersEmpty.classList.add('hidden');
  manageSingersDetail.classList.remove('hidden');
  detailSingerName.textContent = singer.name;
  const current = singerManager.getCurrentSinger();
  el('detail-singing-chip').classList.toggle('hidden', !(current && current.id === singer.id && isAnythingPlaying()));
  const isCurrent = !!(current && current.id === singer.id);
  detailSingNextBtn.disabled = isCurrent;
  detailSingLastBtn.disabled = isCurrent;
  detailAwayBtn.textContent = window.i18n.t(singer.away ? 'away_back_btn' : 'away_btn');
  detailAwayBtn.classList.toggle('on', !!singer.away);
  // O da vez no meio da apresentação não sai: encerre antes.
  detailAwayBtn.disabled = !singer.away && isCurrent && performanceStarted();
  detailTableBtn.classList.toggle('hidden', singerManager.getRotationMode() !== 'table');
  detailTableBtn.textContent = singer.table ? window.i18n.t('table_label', { n: singer.table }) : window.i18n.t('table_none');
  renderDetailQueueList(singer);
  renderDetailHistoryList(singer);
}

detailAwayBtn.addEventListener('click', async () => {
  const singer = singerManager.getAllSingers().find(s => s.id === selectedManageSingerId);
  if (!singer) return;
  const goingAway = !singer.away;
  const isCurrent = singerManager.getCurrentSinger() === singer;
  if (goingAway && isCurrent && performanceStarted()) return;
  singerManager.setSingerAway(singer.id, goingAway);
  // Era a vez dele e ainda não tinha começado: a vez passa pro próximo.
  if (goingAway && isCurrent && singerManager.getAllSingers().some(s => !s.away)) {
    if (countdownTimerId || singerCountdownActive) cancelCountdown();
    stopCurrentMedia();
    showTurn = null;
    singerManager.skipTurn();
    await loadCurrentSingerTurn(false);
    updateNextBtnState();
  }
  refreshManageSingersIfOpen();
});

detailTableBtn.addEventListener('click', async () => {
  const singer = singerManager.getAllSingers().find(s => s.id === selectedManageSingerId);
  if (!singer) return;
  const table = await askSingerTable(singer.name, singer.table);
  if (table === undefined) return;
  singerManager.setSingerTable(singer.id, table);
  renderManageSingersList();
  renderManageSingerDetail(singer.id);
});

// "Próximo a cantar" / "Pro final da fila": logo depois / logo antes do cantor da vez.
for (const [btn, move] of [[detailSingNextBtn, 'moveSingerNext'], [detailSingLastBtn, 'moveSingerLast']]) {
  btn.addEventListener('click', () => {
    if (!selectedManageSingerId) return;
    singerManager[move](selectedManageSingerId);
    renderManageSingersList();
  });
}

detailEditNameBtn.addEventListener('click', async () => {
  const singer = singerManager.getAllSingers().find(s => s.id === selectedManageSingerId);
  if (!singer) return;
  const newName = await showPromptModal(window.i18n.t('prompt_rename_singer'), singer.name);
  if (newName === null) return; // cancelou
  const trimmed = newName.trim();
  if (!trimmed || trimmed === singer.name) return;
  try {
    singerManager.renameSinger(singer.id, trimmed);
    detailSingerName.textContent = singer.name;
    renderManageSingersList();
    renderSingerRoundView();
  } catch (err) {
    showError(err.message);
  }
});

function switchDetailTab(tab) {
  manageDetailTab = tab;
  detailTabQueueBtn.classList.toggle('on', tab === 'queue');
  detailTabHistoryBtn.classList.toggle('on', tab === 'history');
  detailQueuePanel.classList.toggle('hidden', tab !== 'queue');
  detailHistoryPanel.classList.toggle('hidden', tab !== 'history');
}
detailTabQueueBtn.addEventListener('click', () => switchDetailTab('queue'));
detailTabHistoryBtn.addEventListener('click', () => switchDetailTab('history'));

function renderDetailQueueList(singer) {
  detailQueueList.innerHTML = '';
  if (singer.songs.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'empty-small';
    hint.textContent = window.i18n.t('manage_singers_queue_empty');
    detailQueueList.appendChild(hint);
  }
  const loadedSongId = showTurn && showTurn.singerId === singer.id ? showTurn.song.id : null;
  singer.songs.forEach((song, i) => {
    const row = document.createElement('div');
    row.className = 'ds detail-song-row' + (song.id === loadedSongId ? ' cur' : '');
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = String(i + 1);
    const info = document.createElement('div');
    info.style.minWidth = '0';
    const title = document.createElement('div');
    title.className = 't';
    title.textContent = song.title;
    const sub = document.createElement('div');
    sub.className = 's';
    const artist = document.createElement('span');
    artist.textContent = song.artist || (song.type === 'youtube' ? song.channel : '') || '';
    sub.appendChild(artist);
    if (song.code) {
      const code = document.createElement('span');
      code.className = 'code';
      code.textContent = song.code;
      sub.appendChild(code);
    }
    sub.appendChild(createFormatChip(song));
    info.appendChild(title);
    info.appendChild(sub);

    // Tom salvo da música (YouTube não tem ajuste de tom).
    const tone = document.createElement('div');
    if (song.type !== 'youtube') {
      tone.className = 'mini-pitch';
      const st = song.savedSemitones || 0;
      const minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '−';
      minus.title = window.i18n.t('pitch_down_title');
      minus.addEventListener('click', () => {
        song.savedSemitones = Math.max(-12, (song.savedSemitones || 0) - 1);
        persistSingers();
        renderDetailQueueList(singer);
      });
      const val = document.createElement('span');
      val.textContent = `${st > 0 ? '+' : ''}${st}`;
      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.title = window.i18n.t('pitch_up_title');
      plus.addEventListener('click', () => {
        song.savedSemitones = Math.min(12, (song.savedSemitones || 0) + 1);
        persistSingers();
        renderDetailQueueList(singer);
      });
      tone.appendChild(minus);
      tone.appendChild(val);
      tone.appendChild(plus);
    }

    const reorder = document.createElement('div');
    reorder.className = 'acts';
    reorder.appendChild(rowActionBtn(ICON_UP, window.i18n.t('move_up_title'), i === 0, () => {
      const at = singer.songs.indexOf(song); // pelo objeto: a fila pode ter mudado com o modal aberto
      if (at > 0) singerManager.reorderSongInSinger(singer.id, at, at - 1);
      renderDetailQueueList(singer);
      renderSingerRoundView();
    }));
    reorder.appendChild(rowActionBtn(ICON_DOWN, window.i18n.t('move_down_title'), i === singer.songs.length - 1, () => {
      const at = singer.songs.indexOf(song);
      if (at !== -1) singerManager.reorderSongInSinger(singer.id, at, at + 2);
      renderDetailQueueList(singer);
      renderSingerRoundView();
    }));
    const remove = document.createElement('div');
    remove.className = 'acts';
    const removeBtn = rowActionBtn(ICON_X, window.i18n.t('remove_from_queue_title'), false, () => {
      const at = singer.songs.indexOf(song);
      if (at !== -1) singerManager.removeSongFromSinger(singer.id, at);
      renderDetailQueueList(singer);
      renderManageSingersList();
      renderSingerRoundView();
    });
    removeBtn.classList.add('remove-song-btn');
    remove.appendChild(removeBtn);

    row.appendChild(n);
    row.appendChild(info);
    row.appendChild(tone);
    row.appendChild(reorder);
    row.appendChild(remove);
    detailQueueList.appendChild(row);
  });
}

function renderDetailHistoryList(singer) {
  detailHistoryList.innerHTML = '';
  if (singer.history.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'empty-small';
    hint.textContent = window.i18n.t('manage_singers_history_empty');
    detailHistoryList.appendChild(hint);
    return;
  }
  singer.history.slice().reverse().forEach(h => {
    const row = document.createElement('div');
    row.className = 'hist';
    const tm = document.createElement('span');
    tm.className = 'tm';
    tm.textContent = h.timestamp ? new Date(h.timestamp).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' }) : '';
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 't';
    title.textContent = h.title;
    const sub = document.createElement('div');
    sub.className = 's';
    sub.textContent = h.artist || '';
    info.appendChild(title);
    info.appendChild(sub);
    const pitch = document.createElement('span');
    pitch.className = 'fmt';
    pitch.textContent = `${window.i18n.t('history_pitch_label')} ${h.semitone > 0 ? '+' : ''}${h.semitone || 0}`;
    row.appendChild(tm);
    row.appendChild(info);
    row.appendChild(pitch);
    detailHistoryList.appendChild(row);
  });
}

detailAddSongBtn.addEventListener('click', () => {
  detailAddSongSearch.classList.toggle('hidden');
  detailSongSearchInput.value = '';
  detailSongSearchResults.innerHTML = '';
  if (!detailAddSongSearch.classList.contains('hidden')) detailSongSearchInput.focus();
});

let detailSearchGeneration = 0;
let detailSource = 'device';

/** Adiciona uma música na fila do cantor aberto no Gerenciar Cantores. */
function addSongToManagedSinger(song) {
  singerManager.addSongToSinger(selectedManageSingerId, false, song);
  detailAddSongSearch.classList.add('hidden');
  renderManageSingerDetail(selectedManageSingerId);
  renderManageSingersList();
  renderSingerRoundView();
}

function showDetailMessage(key, warn) {
  detailSongSearchResults.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'res-msg' + (warn ? ' warn' : '');
  p.textContent = window.i18n.t(key);
  detailSongSearchResults.appendChild(p);
}

function setDetailSource(source) {
  detailSource = source;
  el('detail-source-device-btn').classList.toggle('on', source === 'device');
  el('detail-source-online-btn').classList.toggle('on', source === 'online');
  detailSongSearchInput.placeholder = window.i18n.t(source === 'online' ? 'online_placeholder' : 'manage_singers_search_placeholder');
  detailSongSearchResults.innerHTML = '';
  detailSearchGeneration++;
  if (source === 'device' && detailSongSearchInput.value.trim()) renderDetailDeviceResults();
  detailSongSearchInput.focus();
}
el('detail-source-device-btn').addEventListener('click', () => setDetailSource('device'));
el('detail-source-online-btn').addEventListener('click', () => setDetailSource('online'));
if (!onlineSearch.isConfigured()) el('detail-source-toggle').classList.add('hidden');

async function renderDetailDeviceResults() {
  const q = detailSongSearchInput.value;
  const gen = ++detailSearchGeneration;
  if (!q.trim()) { detailSongSearchResults.innerHTML = ''; return; }
  const results = await library.search(q);
  if (gen !== detailSearchGeneration) return;
  detailSongSearchResults.innerHTML = '';
  if (!results.length) { showDetailMessage(library.getConnectedFolders().length ? 'library_no_results' : 'library_no_folders_search'); return; }
  results.forEach(item => {
    detailSongSearchResults.appendChild(searchResultRow({
      title: item.title,
      sub: [item.artist, item.code].filter(Boolean).join(' · '),
      chip: createFormatChip(item),
      onPick: async () => {
        try {
          const file = await library.getFileForItem(item);
          addSongToManagedSinger({
            id: 'track_' + (++playlistIdCounter),
            file, code: item.code, artist: item.artist, title: item.title,
            format: item.format, type: item.type, savedSemitones: 0,
            librarySource: libraryItemSource(item),
          });
        } catch (err) {
          showError(err.message || window.i18n.t('err_load_generic'));
        }
      },
    }));
  });
}

async function runDetailOnlineSearch() {
  const q = detailSongSearchInput.value.trim();
  if (!q) return;
  const gen = ++detailSearchGeneration;
  showDetailMessage('online_searching');
  try {
    const results = await onlineSearch.search(q);
    if (gen !== detailSearchGeneration) return;
    detailSongSearchResults.innerHTML = '';
    if (!results.length) { showDetailMessage('online_no_results'); return; }
    results.forEach(r => detailSongSearchResults.appendChild(searchResultRow({
      title: r.title, sub: r.channel, chip: createFormatChip({ type: 'youtube' }), thumb: r.thumbnail || '',
      onPick: () => {
        try { addSongToManagedSinger(buildOnlineItem(r)); } catch (err) { showError(err.message); }
      },
    })));
  } catch (err) {
    if (gen !== detailSearchGeneration) return;
    showDetailMessage('online_err_' + (err && err.code ? err.code : 'server'), true);
  }
}

detailSongSearchInput.addEventListener('input', () => { if (detailSource === 'device') renderDetailDeviceResults(); });
detailSongSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && detailSource === 'online') runDetailOnlineSearch();
});

// Upload direto de arquivo(s) do computador, pra adicionar na fila do
// cantor selecionado sem precisar passar pela Biblioteca.
detailUploadFileBtn.addEventListener('click', () => detailUploadFileInput.click());
detailUploadFileInput.addEventListener('change', async () => {
  const files = Array.from(detailUploadFileInput.files || []).filter(f => !isGhostFile(f));
  detailUploadFileInput.value = ''; // permite selecionar o mesmo arquivo de novo depois, se precisar

  let addedAny = false;
  for (const file of files) {
    const lower = file.name.toLowerCase();
    const isZip = lower.endsWith('.zip');
    const isMp4 = lower.endsWith('.mp4');
    if (!isZip && !isMp4) {
      showError(window.i18n.t('err_unsupported_files'));
      continue;
    }
    const parsed = window.parseKaraokeFilename(file.name);
    const song = {
      id: 'track_' + (++playlistIdCounter),
      file,
      code: parsed.code, artist: parsed.artist, title: parsed.title,
      format: isMp4 ? 'MP4' : 'MP3+G', type: isMp4 ? 'video' : 'cdg',
      savedSemitones: 0,
    };
    try {
      singerManager.addSongToSinger(selectedManageSingerId, false, song);
      addedAny = true;
    } catch (err) {
      showError(err.message);
    }
  }

  if (addedAny) {
    detailAddSongSearch.classList.add('hidden');
    renderManageSingerDetail(selectedManageSingerId);
    renderManageSingersList();
    renderSingerRoundView();
  }
});

// ---------- Encerrar Show (feature 3) ----------

// (o clique que abre a confirmação de encerrar já é tratado no listener do showModeBtn, acima)
endShowConfirmCancelBtn.addEventListener('click', () => endShowConfirmBackdrop.classList.add('hidden'));
endShowConfirmBackdrop.addEventListener('click', (e) => { if (e.target === endShowConfirmBackdrop) endShowConfirmBackdrop.classList.add('hidden'); });

endShowConfirmOkBtn.addEventListener('click', () => {
  endShowConfirmBackdrop.classList.add('hidden');
  openShowReport();
});

function formatShowDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}

function openShowReport() {
  let savedStart = null;
  try { savedStart = localStorage.getItem(SHOW_START_KEY); } catch (err) {}
  const startRaw = savedStart
    || (showHistory.length ? String(showHistory[0].horario) : null); // shows iniciados antes dessa chave existir
  const start = startRaw ? Number(startRaw) : Date.now();
  const duration = Date.now() - start;

  reportDuration.textContent = formatShowDuration(duration);
  const hm = (ms) => new Date(ms).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
  el('report-subtitle').textContent = `${new Date(start).toLocaleDateString(getLocale())} · ${hm(start)} – ${hm(Date.now())}`;
  reportTotalSongs.textContent = String(showHistory.length);

  const uniqueSingers = new Set(showHistory.map(h => h.cantor));
  reportUniqueSingers.textContent = String(uniqueSingers.size);

  const countBySinger = {};
  showHistory.forEach(h => { countBySinger[h.cantor] = (countBySinger[h.cantor] || 0) + 1; });
  let topSinger = '—', topCount = 0;
  Object.entries(countBySinger).forEach(([name, count]) => {
    if (count > topCount) { topSinger = name; topCount = count; }
  });
  reportHighlight.textContent = topCount > 0 ? `${topSinger} (${topCount})` : '—';

  showReportTbody.innerHTML = '';
  showHistory.slice().reverse().forEach(h => {
    const tr = document.createElement('tr');
    const time = new Date(h.horario).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
    [time, h.cantor, h.musica, h.artista, `${h.tom > 0 ? '+' : ''}${h.tom}`].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    showReportTbody.appendChild(tr);
  });

  showReportBackdrop.classList.remove('hidden');
}

showReportCloseBtn.addEventListener('click', () => showReportBackdrop.classList.add('hidden'));

/** Célula de CSV: entre aspas, e com um apóstrofo na frente se começar
 * com = + @ (evita o Excel interpretar um nome digitado como fórmula). */
function csvCell(v) {
  let str = String(v ?? '');
  // Texto que o Excel/LibreOffice leria como fórmula (inclui "-" e espaços antes); números puros (tom -2) ficam.
  if (typeof v !== 'number' && /^\s*[=+\-@\t\r]/.test(str)) str = "'" + str;
  return `"${str.replace(/"/g, '""')}"`;
}

function buildShowCsv() {
  const t = window.i18n.t;
  const lines = [];
  lines.push([t('report_col_datetime'), t('report_col_singer'), t('report_col_song'), t('report_col_artist'),
    t('report_col_code'), t('report_col_pitch'), t('report_col_duration')].map(csvCell).join(','));
  showHistory.forEach(h => {
    const time = new Date(h.horario).toLocaleString(getLocale());
    lines.push([time, h.cantor, h.musica, h.artista, h.codigo, h.tom, h.duracao].map(csvCell).join(','));
  });
  // BOM no início: sem ele o Excel abre o UTF-8 como Latin-1 e quebra os acentos.
  return '\uFEFF' + lines.join('\r\n');
}

exportCsvBtn.addEventListener('click', () => {
  const csv = buildShowCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `playkaraoke-show-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

newShowBtn.addEventListener('click', async () => {
  // Fica ao lado do "Exportar CSV": um clique errado apagava a noite inteira.
  if (!(await showConfirmModal(window.i18n.t('confirm_new_show')))) return;
  try {
    localStorage.removeItem(SHOW_HISTORY_KEY);
    localStorage.removeItem(SINGERS_STORAGE_KEY);
    localStorage.removeItem(PLAYLIST_STORAGE_KEY);
    localStorage.removeItem(SHOW_START_KEY);
    localStorage.removeItem('playkaraoke-session-start'); // chave antiga (versões anteriores)
  } catch (err) {}
  window.location.reload();
});

// ---------- Persistência da fila (sobrevive a um F5 acidental) ----------
//
// Só restauramos automaticamente músicas que vieram da Biblioteca — elas
// têm uma referência viva ao arquivo no disco (via File System Access
// API), então dá pra "reabrir" sem pedir nada ao usuário. Músicas
// carregadas manualmente (arrastadas ou pelo seletor de arquivo comum)
// usam um tipo de referência que o navegador não deixa reabrir sozinho
// depois de recarregar a página — nesse caso, avisamos que precisam ser
// adicionadas de novo, em vez de fingir que "restauramos" algo quebrado.

const PLAYLIST_STORAGE_KEY = 'playkaraoke-playlist-v1';

// Fica false até a restauração terminar: a inicialização chama
// renderPlaylist() com a fila ainda vazia, e sem essa trava isso gravava
// uma fila vazia por cima da salva ANTES de ela ser lida.
let playlistRestoreDone = false;

function persistPlaylist() {
  if (!playlistRestoreDone) return;
  try {
    const data = {
      items: playlist.map(item => ({
        code: item.code,
        artist: item.artist,
        title: item.title,
        format: item.format,
        type: item.type,
        librarySource: item.librarySource || null,
        savedSemitones: item.savedSemitones || 0,
        ...(item.type === 'youtube' ? { videoId: item.videoId, thumbnail: item.thumbnail, channel: item.channel } : {}),
      })),
    };
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[App] Não foi possível salvar a fila:', err);
  }
}

async function restorePlaylistFromStorage() {
  let saved;
  try {
    const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (!raw) return;
    saved = JSON.parse(raw);
  } catch (err) {
    return;
  }
  if (!saved || !Array.isArray(saved.items) || saved.items.length === 0) return;

  let restoredCount = 0;
  let droppedCount = 0;
  let pendingCount = 0;

  for (const savedItem of saved.items) {
    let restored = false;
    // Músicas Online só precisam do ID do vídeo — sempre restauráveis.
    if (savedItem.type === 'youtube' && savedItem.videoId) {
      playlist.push({ ...savedItem, id: 'track_' + (++playlistIdCounter), file: null, format: 'YouTube', code: null });
      restoredCount++;
      continue;
    }
    if (savedItem.librarySource) {
      const found = await libraryItemFromSource(savedItem.librarySource);
      let file = null;
      if (found) {
        try { file = await library.getFileForItem(found); } catch (err) { /* pasta sem permissão / HD fora: fica pendente */ }
      }
      // Sem arquivo agora (pasta pedindo permissão, HD desconectado), a
      // música fica na fila e o arquivo é buscado na hora de tocar —
      // antes ela era descartada e a fila salva sem ela, pra sempre.
      if (!file) pendingCount++;
      playlist.push({
        id: 'track_' + (++playlistIdCounter),
        file,
        code: found ? found.code : savedItem.code,
        artist: found ? found.artist : savedItem.artist,
        title: found ? found.title : savedItem.title,
        format: found ? found.format : savedItem.format,
        type: found ? found.type : savedItem.type,
        librarySource: savedItem.librarySource,
        savedSemitones: savedItem.savedSemitones || 0,
      });
      restoredCount++;
      restored = true;
    }
    if (!restored) droppedCount++;
  }

  if (restoredCount > 0) {
    renderPlaylist();
    // Deixa a primeira música carregada (pausada), pronta pra tocar.
    // (se a primeira está pendente, espera reconectar a pasta — senão dava erro ao abrir)
    if (mode === null && currentIndex === -1 && (playlist[0].file || playlist[0].type === 'youtube')) await selectTrack(0, { autoplay: false, initialSemitones: playlist[0].savedSemitones || 0 });
  }
  if (droppedCount > 0) {
    showError(window.i18n.t('err_playlist_songs_dropped', { count: droppedCount }));
  } else if (pendingCount > 0) {
    showError(window.i18n.t('err_library_songs_pending', { count: pendingCount }));
  }
}

// Tenta restaurar pastas já conectadas em sessões anteriores (silencioso).
const appReady = library.restoreSavedFolders().then(async () => {
  try {
    await restoreSingersFromStorage();
    if (singerModeEnabled) {
      await loadCurrentSingerTurn(false);
    } else {
      await restorePlaylistFromStorage();
    }
  } finally {
    playlistRestoreDone = true;
    persistPlaylist(); // grava o estado real (restaurado + o que o usuário tenha adicionado nesse meio tempo)
  }
});

// ---------- Pads (efeitos sonoros avulsos) ----------

const pads = window.createPads({
  onError: (key) => showError(window.i18n.t(key)),
  getVolume: () => Number(volumeSlider.value) / 100,
});
const padsGrid = el('pads-grid');
const padsSettingsList = el('pads-settings-list');
const padFileInput = el('pad-file-input');
let padFileTarget = -1;

/** Nome do pad: o dado pelo operador, o padrão (traduzido) ou o do arquivo. */
function padLabel(pad) {
  if (pad.name) return pad.name;
  if (pad.defaultKey) return window.i18n.t(pad.defaultKey);
  return pad.fileName ? pad.fileName.replace(/\.[^.]+$/, '').slice(0, 24) : '';
}

function renderPads() {
  padsGrid.innerHTML = '';
  pads.getPads().forEach((pad, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pad' + (pad.hasSound ? '' : ' empty');
    const k = document.createElement('span');
    k.className = 'k';
    k.textContent = String(i + 1);
    b.appendChild(k);
    b.append(pad.hasSound ? padLabel(pad) : window.i18n.t('pads_load'));
    b.addEventListener('click', () => {
      if (pad.hasSound) firePad(i);
      else { padFileTarget = i; padFileInput.click(); }
    });
    padsGrid.appendChild(b);
  });
  renderPadsSettings();
}

/** Toca o pad (do começo, mesmo se já estiver tocando) e pisca o botão. */
function firePad(i) {
  if (!pads.fire(i)) return;
  const b = padsGrid.children[i];
  if (!b) return;
  b.classList.remove('fire');
  void b.offsetWidth; // reinicia a animação
  b.classList.add('fire');
  clearTimeout(b._fireTimer);
  b._fireTimer = setTimeout(() => b.classList.remove('fire'), 350);
}

function renderPadsSettings() {
  padsSettingsList.innerHTML = '';
  pads.getPads().forEach((pad, i) => {
    const row = document.createElement('div');
    row.className = 'pad-row';
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = String(i + 1);
    const name = document.createElement('input');
    name.className = 'txt';
    name.value = padLabel(pad);
    name.placeholder = window.i18n.t('pads_name_placeholder');
    name.maxLength = 24;
    name.addEventListener('change', () => { pads.rename(i, name.value); renderPads(); });
    const file = document.createElement('span');
    file.className = 'file' + (pad.hasSound ? '' : ' none');
    file.textContent = pad.hasSound ? (pad.fileName || window.i18n.t('pads_default_sound')) : window.i18n.t('pads_no_sound');
    file.title = file.textContent;
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'btn sm';
    load.textContent = window.i18n.t(pad.hasSound ? 'pads_replace' : 'pads_load_btn');
    load.addEventListener('click', () => { padFileTarget = i; padFileInput.click(); });
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'icon-btn';
    clear.title = window.i18n.t('pads_clear');
    clear.innerHTML = ICON_X;
    clear.disabled = !pad.hasSound;
    clear.addEventListener('click', async () => { await pads.clear(i); renderPads(); });
    row.appendChild(n);
    row.appendChild(name);
    row.appendChild(file);
    row.appendChild(load);
    row.appendChild(clear);
    padsSettingsList.appendChild(row);
  });
}

padFileInput.addEventListener('change', async () => {
  const file = padFileInput.files && padFileInput.files[0];
  padFileInput.value = '';
  if (!file || padFileTarget < 0) return;
  await pads.setSound(padFileTarget, file);
  padFileTarget = -1;
  renderPads();
});
el('pads-restore-btn').addEventListener('click', async () => {
  if (!await showConfirmModal(window.i18n.t('pads_restore_confirm'))) return;
  await pads.restoreDefaults();
  renderPads();
});
pads.restore().then(renderPads);
renderPads();

// ---------- Atalhos de teclado ----------
//
// Desligados por padrão (um esbarrão no teclado não pode atrapalhar o
// show) — liga em Configurações › Atalhos. Nunca valem enquanto se digita
// ou com alguma janela aberta.

const shortcutsToggle = el('shortcuts-toggle');
const SHORTCUTS_KEY = 'playkaraoke-shortcuts';
try { shortcutsToggle.checked = localStorage.getItem(SHORTCUTS_KEY) === 'true'; } catch (err) {}
syncToggleIndicator(el('shortcuts-toggle-indicator'), shortcutsToggle);
shortcutsToggle.addEventListener('change', () => {
  try { localStorage.setItem(SHORTCUTS_KEY, String(shortcutsToggle.checked)); } catch (err) {}
});

/** Atalhos ficam desligados enquanto se digita ou com algum modal aberto
 * (senão o Espaço num modal de confirmação dava play/pause por trás). */
function shortcutsBlocked() {
  const active = document.activeElement;
  if (active && active.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return !!document.querySelector('[id$="-backdrop"]:not(.hidden)');
}

function nudgeVolume(delta) {
  volumeSlider.value = String(Math.max(0, Math.min(100, Number(volumeSlider.value) + delta)));
  volumeSlider.dispatchEvent(new Event('input'));
}

window.addEventListener('keydown', (e) => {
  if (!shortcutsToggle.checked || shortcutsBlocked()) return;
  const mod = e.ctrlKey || e.metaKey;
  // Tecla segurada só repete o volume (Ctrl+→ segurado pulava várias músicas).
  if (e.repeat && !(mod && e.shiftKey && (e.code === 'ArrowUp' || e.code === 'ArrowDown'))) { if (e.code === 'Space') e.preventDefault(); return; }
  const press = (btn) => { e.preventDefault(); if (!btn.disabled) btn.click(); };

  if (!mod && !e.altKey && e.code === 'Space') {
    e.preventDefault();
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); // evita o Espaço "clicar" também o botão focado
    if (!playBtn.disabled) playBtn.click();
    return;
  }
  if (mod && !e.altKey) {
    if (e.shiftKey && e.code === 'ArrowUp') { e.preventDefault(); nudgeVolume(5); return; }
    if (e.shiftKey && e.code === 'ArrowDown') { e.preventDefault(); nudgeVolume(-5); return; }
    if (e.shiftKey) return;
    // Clicar nos botões (em vez de chamar as funções direto) reaproveita o
    // habilitado/desabilitado de cada um — no Modo Show o "Próxima" encerra
    // a apresentação (com confirmação), só depois que ela começou.
    if (e.code === 'ArrowLeft') return press(restartBtn);
    if (e.code === 'ArrowRight') return press(nextBtn);
    if (e.code === 'Period') return press(stopBtn);
    if (e.code === 'ArrowUp') return press(pitchUpBtn);
    if (e.code === 'ArrowDown') return press(pitchDownBtn);
    if (e.code === 'Digit0' || e.code === 'Numpad0') return press(pitchResetBtn);
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const digit = /^(Digit|Numpad)([1-6])$/.exec(e.code);
  if (digit) { e.preventDefault(); firePad(Number(digit[2]) - 1); return; }
  if (e.key === '/') { e.preventDefault(); searchInput.focus(); searchInput.select(); }
});

// Estado inicial
setStage(null);
updateMetaBar(null);
updatePitchLabel(0);
updateAutoplayIndicator();
updateApplauseIndicator();
updateAmbientIndicator();
updateSecondScreenIndicator();
ambientVolumePct.textContent = ambientVolumeSlider.value + '%';
applyIdleImage();
updateIdleOverlay();
renderPlaylist();
restoreShowHistory();
updateShowModeBtnDisplay();
restoreCountdownSettings();
// (depois de restaurar: os switches já nascem mostrando o valor salvo)
syncToggleIndicator(el('cd-show-upcoming-indicator'), cdShowUpcomingToggle);
syncToggleIndicator(el('cd-show-titles-indicator'), cdShowTitlesToggle);
syncToggleIndicator(el('cd-show-counter-indicator'), cdShowCounterToggle);

// ---------- Idioma (i18n) ----------
const languageSeg = el('language-seg');
function updateLanguageSeg() {
  languageSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.lang === window.i18n.getCurrentLang()));
}
languageSeg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => window.i18n.setLanguage(b.dataset.lang)));
window.i18n.applyTranslations();
updateLanguageSeg();
applyTheme(currentTheme());
window.i18n.onLanguageChange(() => {
  // Alguns textos são gerados dinamicamente (não têm data-i18n no HTML
  // estático) — precisam ser re-renderizados manualmente quando o
  // idioma muda, senão ficam "presos" no idioma anterior até a próxima
  // ação do usuário atualizar aquele pedaço da tela.
  document.documentElement.lang = window.i18n.getCurrentLang() === 'pt' ? 'pt-BR' : 'en';
  updateLanguageSeg();
  updateHelpLink();
  renderPlaylist();
  updateAutoplayIndicator();
  updateApplauseIndicator();
  updateAmbientIndicator();
  updateShowModeBtnDisplay();
  if (singerModeEnabled) renderSingerRoundView();
  updateMetaBar(mode === null ? null : playlist[currentIndex] || null);
  renderAmbientSource();
  renderLibraryFolders();
  renderPads();
  updateNextBtnState();
  updatePitchButtonTitles();
  updateSearchPlaceholder();
  if (searchSource === 'device' && searchInput.value.trim() && !searchResults.classList.contains('hidden')) renderDeviceResults();
});
document.documentElement.lang = window.i18n.getCurrentLang() === 'pt' ? 'pt-BR' : 'en';
