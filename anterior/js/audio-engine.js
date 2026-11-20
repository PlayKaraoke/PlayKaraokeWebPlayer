/**
 * Audio Engine — decodifica o áudio, aplica pitch shift em tempo real
 * (sem alterar a velocidade), e expõe uma API simples de transporte
 * (play/pause/seek/volume/pitch).
 *
 * Dois "motores" de processamento de áudio disponíveis:
 *
 * 1. 'worklet' (o que o app usa — app.js chama setPreferredBackend('worklet'))
 *    — usa a API AudioWorklet,
 *    rodando numa thread separada, dedicada só ao áudio (mesma ideia de
 *    apps nativos como KaraFun). Esse motor usa um processador de pitch
 *    shift ESCRITO DO ZERO (js/pitch-worklet-processor.js) — depois de
 *    tentar usar uma biblioteca de terceiros pra isso e esbarrar em bugs
 *    não documentados dela, preferi implementar algo mais simples que eu
 *    consigo garantir que funciona, mesmo que a qualidade do pitch-shift
 *    seja um pouco mais simples que a de bibliotecas mais sofisticadas.
 *    Arquitetura: AudioBufferSourceNode (toca o arquivo normalmente, sem
 *    alterar velocidade) -> AudioWorkletNode (efeito de pitch em tempo
 *    real) -> saída. Isso mantém a posição de reprodução sempre em
 *    sincronia 1:1 com o tempo real, o que é ótimo pra sincronizar com o
 *    CDG.
 *
 * 2. 'scriptprocessor' (fallback automático) — ScriptProcessorNode + a
 *    biblioteca soundtouchjs, rodando na thread principal. Só é usado se o
 *    worklet falhar ao carregar. A biblioteca vem de CDN e é importada SOB
 *    DEMANDA: se o CDN estiver fora do ar, só o fallback é afetado — o app
 *    continua funcionando normalmente com o worklet.
 */

const SOUNDTOUCH_URL = 'https://unpkg.com/soundtouchjs@0.3.0/dist/soundtouch.js';
let pitchShifterClassPromise = null;
function loadPitchShifterClass() {
  if (!pitchShifterClassPromise) {
    pitchShifterClassPromise = import(SOUNDTOUCH_URL).then(m => m.PitchShifter).catch(err => {
      pitchShifterClassPromise = null; // permite tentar de novo depois
      throw err;
    });
  }
  return pitchShifterClassPromise;
}

const WORKLET_PROCESSOR_URL = 'js/pitch-worklet-processor.js'; // arquivo local, mesmo servidor — sem CORS

function semitonesToRatio(semitones) {
  return Math.pow(2, semitones / 12);
}

class AudioEngine extends EventTarget {
  constructor() {
    super();
    this.audioCtx = null;
    this.gainNode = null;

    // Backend 'scriptprocessor'
    this.shifter = null;
    this.buffer = null;

    // Backend 'worklet'
    this.pitchNode = null;      // AudioWorkletNode (efeito, fica conectado o tempo todo)
    this.workletBuffer = null;  // AudioBuffer decodificado
    this.workletSource = null;  // AudioBufferSourceNode atual (recriado a cada play)
    this._segmentStartCtxTime = 0;
    this._segmentStartOffset = 0;
    this._pausedOffset = 0;

    this._playing = false;
    this._semitones = 0;
    this._volume = 0.9;
    this._rafId = null;
    this._lastTickMs = 0;

    this._preferredBackend = 'scriptprocessor'; // trocável via setPreferredBackend() — o app usa 'worklet'
    this._backend = 'scriptprocessor';           // backend REALMENTE ativo após tentar carregar
    this._workletModuleLoaded = false;

    // 'timeupdate' dispara a ~60x/segundo. Usar addEventListener/CustomEvent
    // pra isso cria um objeto novo no heap a cada frame — o navegador
    // precisa limpar esse lixo periodicamente (garbage collection), o que
    // causa micro-engasgos justamente na hora que menos queremos. Por isso
    // esse evento de alta frequência usa uma lista de callback simples em
    // vez do EventTarget genérico (que continua sendo usado pros eventos
    // raros: play/pause/ended/error/pitchchange/backendchange).
    this._timeUpdateCallbacks = [];
  }

  /** @param {(currentTime: number, duration: number) => void} callback */
  onTimeUpdate(callback) {
    this._timeUpdateCallbacks.push(callback);
  }

  /**
   * @param {'scriptprocessor'|'worklet'} backend - efeito só no PRÓXIMO
   * loadArrayBuffer(). Se 'worklet' falhar ao inicializar, cai automaticamente
   * pra 'scriptprocessor' e dispara o evento 'backendchange' avisando disso.
   */
  setPreferredBackend(backend) {
    this._preferredBackend = backend === 'worklet' ? 'worklet' : 'scriptprocessor';
  }

  /** Backend que está DE FATO ativo agora (pode ter caído pro padrão). */
  getActiveBackend() {
    return this._backend;
  }

  _ensureContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this._volume;
      this.gainNode.connect(this.audioCtx.destination);
    }
  }

  /**
   * Carrega um ArrayBuffer de áudio (mp3/wav/etc), decodifica e prepara
   * o motor de pitch shift. Não inicia a reprodução automaticamente.
   */
  async loadArrayBuffer(arrayBuffer) {
    this._ensureContext();
    this.stop();
    // Cada carga tem um número: se outra começar antes do decode desta
    // terminar, esta não grava o buffer (senão a música nova tocava o
    // áudio da anterior).
    const token = this._loadToken = (this._loadToken || 0) + 1;
    this._isStale = () => token !== this._loadToken;

    if (this._preferredBackend === 'worklet') {
      try {
        await this._loadWorklet(arrayBuffer);
        this._backend = 'worklet';
        this.dispatchEvent(new CustomEvent('backendchange', { detail: { backend: 'worklet', fallback: false } }));
        return;
      } catch (err) {
        console.warn('[AudioEngine] Modo experimental (worklet) falhou, revertendo pro motor padrão:', err);
        this.dispatchEvent(new CustomEvent('backendchange', { detail: { backend: 'scriptprocessor', fallback: true, reason: err.message || String(err) } }));
        // cai pro caminho padrão abaixo
      }
    }

    await this._loadScriptProcessor(arrayBuffer);
    this._backend = 'scriptprocessor';
  }

  async _loadScriptProcessor(arrayBuffer) {
    const isStale = this._isStale;
    const PitchShifter = await loadPitchShifterClass();
    const decoded = await this.audioCtx.decodeAudioData(arrayBuffer.slice(0));
    if (isStale()) return;
    this.buffer = decoded;

    this.shifter = new PitchShifter(this.audioCtx, this.buffer, 4096, () => this._finishPlayback());
    this.shifter.tempo = 1; // nunca mudamos o tempo, só o pitch
    this.shifter.pitchSemitones = this._semitones;

    this.dispatchEvent(new CustomEvent('loaded', { detail: { duration: this.buffer.duration } }));
  }

  async _loadWorklet(arrayBuffer) {
    const isStale = this._isStale;
    await this._ensurePitchNode();

    // decodeAudioData "consome" (detach) o buffer passado. O app não reusa
    // esse ArrayBuffer depois (é extraído do zip a cada carregamento), então
    // não precisamos de uma cópia — economiza a memória do arquivo inteiro.
    if (!isStale()) this.workletBuffer = null; // libera o anterior antes de decodificar (pico de memória em 4GB)
    const decoded = await this.audioCtx.decodeAudioData(arrayBuffer);
    if (isStale()) return;
    this.workletBuffer = decoded;

    this._pausedOffset = 0;
    this._segmentStartOffset = 0;
    this.workletSource = null;

    this.dispatchEvent(new CustomEvent('loaded', { detail: { duration: this.workletBuffer.duration } }));
  }

  /**
   * Cria (uma vez só) o AudioWorkletNode que faz o pitch shift. É
   * reaproveitado tanto pro áudio extraído do CDG quanto pro áudio de
   * vídeos MP4 — ambos passam pelo MESMO node de efeito, então ajustar o
   * tom funciona igual nos dois formatos.
   */
  async _ensurePitchNode() {
    if (this.pitchNode) return;
    if (!this.audioCtx.audioWorklet) {
      throw new Error('AudioWorklet não é suportado neste navegador');
    }
    if (!this._workletModuleLoaded) {
      await this.audioCtx.audioWorklet.addModule(WORKLET_PROCESSOR_URL);
      this._workletModuleLoaded = true;
    }
    this.pitchNode = new AudioWorkletNode(this.audioCtx, 'pitch-shifter-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      // Força a entrada a sempre chegar em estéreo: com o padrão ('max'),
      // um arquivo mono chegava com 1 canal só e saía só no lado esquerdo.
      channelCount: 2,
      channelCountMode: 'explicit',
      channelInterpretation: 'speakers',
    });
    this.pitchNode.onprocessorerror = (err) => {
      console.error('[AudioEngine] Erro dentro do AudioWorkletProcessor:', err);
      this.dispatchEvent(new CustomEvent('error', {
        detail: { message: 'Erro interno do processador de áudio (modo experimental): ' + (err.message || String(err)) }
      }));
    };
    this.pitchNode.parameters.get('pitchRatio').value = semitonesToRatio(this._semitones);
    this.pitchNode.connect(this.gainNode);
  }

  /**
   * Prepara o pitch shift pra funcionar com um elemento <video>. Só
   * funciona no backend 'worklet' (o motor padrão) — se o navegador caiu
   * pro motor antigo (scriptprocessor), o vídeo toca normalmente mas sem
   * ajuste de tom, já que a biblioteca usada nesse motor não foi feita
   * pra aceitar uma fonte de áudio "ao vivo" como um <video>.
   * @returns {Promise<boolean>} true se o tom vai funcionar pro vídeo
   */
  async ensureVideoPitchSupport() {
    this._ensureContext();
    if (this._preferredBackend !== 'worklet') return false;
    try {
      await this._ensurePitchNode();
      this._backend = 'worklet';
      return true;
    } catch (err) {
      console.warn('[AudioEngine] Pitch shift indisponível pra vídeo nesse navegador:', err);
      return false;
    }
  }

  /**
   * Conecta um <video>/<audio> ao pitchNode, uma única vez por elemento (o
   * navegador não deixa chamar createMediaElementSource() mais de uma vez
   * pro mesmo elemento — por isso reaproveitamos a mesma conexão mesmo
   * quando o .src muda pra uma música diferente). Aceita vários elementos
   * (o app usa um <video> e, com a segunda tela aberta, um <audio>).
   * @returns {boolean} true se conectado (ou já estava) com sucesso
   */
  attachVideoElement(mediaEl) {
    if (!this._mediaSources) this._mediaSources = new Map();
    if (this._mediaSources.has(mediaEl)) return true;
    if (!this.pitchNode) return false;
    try {
      const source = this.audioCtx.createMediaElementSource(mediaEl);
      source.connect(this.pitchNode);
      this._mediaSources.set(mediaEl, source);
      return true;
    } catch (err) {
      console.warn('[AudioEngine] Falha ao conectar o vídeo ao pitch shifter:', err);
      return false;
    }
  }

  /** true se o elemento está roteado pelo pitch shifter (ver attachVideoElement). */
  isVideoPitchRouted(mediaEl) {
    return !!(this._mediaSources && this._mediaSources.has(mediaEl));
  }

  /** Para e descarta o AudioBufferSourceNode atual SEM disparar 'ended'
   * (o onended é desligado antes — paradas intencionais nunca contam como
   * "fim da música"). */
  _discardWorkletSource() {
    const source = this.workletSource;
    if (!source) return;
    this.workletSource = null;
    source.onended = null;
    try { source.stop(); } catch (e) {}
    try { source.disconnect(); } catch (e) {}
  }

  /** Fim natural da música. Só dispara 'ended' UMA vez por reprodução,
   * venha o aviso do evento nativo do navegador ou da rede de segurança
   * do loop de tick (o que chegar primeiro). */
  _finishPlayback() {
    if (!this._playing) return;
    this._playing = false;
    this._stopTicking();
    this._discardWorkletSource();
    this._pausedOffset = 0; // um play() depois do fim recomeça do início
    this.dispatchEvent(new CustomEvent('ended'));
  }

  /** Cria e inicia um novo AudioBufferSourceNode a partir de `offsetSec`. */
  _workletStartSegment(offsetSec) {
    this._discardWorkletSource();

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.workletBuffer;
    source.connect(this.pitchNode);
    source.onended = () => {
      // Chegou ao fim do áudio naturalmente (paradas intencionais desligam
      // o onended antes, ver _discardWorkletSource).
      if (source === this.workletSource) this._finishPlayback();
    };
    source.start(0, Math.max(0, offsetSec));

    this.workletSource = source;
    this._segmentStartCtxTime = this.audioCtx.currentTime;
    this._segmentStartOffset = offsetSec;
  }

  async play() {
    this._ensureContext();
    try {
      if (this._playing) return;

      if (this._backend === 'worklet') {
        if (!this.workletBuffer || !this.pitchNode) {
          console.warn('[AudioEngine] play() chamado sem áudio carregado (worklet)');
          return;
        }
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        this._workletStartSegment(this._pausedOffset);
      } else {
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        if (!this.shifter) {
          console.warn('[AudioEngine] play() chamado sem shifter carregado');
          return;
        }
        // Workaround para Safari/WebKit: o ScriptProcessorNode às vezes só
        // dispara 'onaudioprocess' de forma confiável quando tem uma
        // entrada conectada. Conectamos uma fonte silenciosa na entrada
        // do node interno do PitchShifter só para "acordá-lo".
        this._connectSilentKeepAlive();
        this.shifter.connect(this.gainNode);
      }

      this._playing = true;
      this._startTicking();
      this.dispatchEvent(new CustomEvent('play'));
    } catch (err) {
      console.error('[AudioEngine] erro ao iniciar playback:', err);
      this.dispatchEvent(new CustomEvent('error', { detail: { message: err.message || String(err) } }));
    }
  }

  _connectSilentKeepAlive() {
    try {
      if (this._keepAliveSource) return;
      const silentBuffer = this.audioCtx.createBuffer(2, 2, this.audioCtx.sampleRate);
      const src = this.audioCtx.createBufferSource();
      src.buffer = silentBuffer;
      src.loop = true;
      src.connect(this.shifter.node);
      src.start(0);
      this._keepAliveSource = src;
    } catch (err) {
      console.warn('[AudioEngine] keep-alive silencioso falhou (não crítico):', err);
    }
  }

  pause() {
    if (!this._playing) return;
    if (this._backend === 'worklet') {
      this._pausedOffset = this.getCurrentTime();
      this._discardWorkletSource();
    } else {
      if (this.shifter) this.shifter.disconnect();
    }
    this._playing = false;
    this._stopTicking();
    this.dispatchEvent(new CustomEvent('pause'));
  }

  toggle() {
    this._playing ? this.pause() : this.play();
  }

  stop() {
    this._discardWorkletSource();
    this._pausedOffset = 0;
    if (this.shifter) {
      try { this.shifter.disconnect(); } catch (e) {}
    }
    if (this._keepAliveSource) {
      try { this._keepAliveSource.stop(); this._keepAliveSource.disconnect(); } catch (e) {}
      this._keepAliveSource = null;
    }
    this._playing = false;
    this._stopTicking();
  }

  /** @param {number} sec */
  seekTo(sec) {
    let currentTime, duration;
    if (this._backend === 'worklet') {
      if (!this.workletBuffer) return;
      duration = this.workletBuffer.duration;
      const clamped = Math.max(0, Math.min(duration, sec));
      if (this._playing) {
        this._workletStartSegment(clamped);
      } else {
        this._pausedOffset = clamped;
      }
      currentTime = clamped;
    } else {
      if (!this.shifter || !this.buffer) return;
      const pct = Math.max(0, Math.min(1, sec / this.buffer.duration));
      this.shifter.percentagePlayed = pct;
      currentTime = this.getCurrentTime();
      duration = this.buffer.duration;
    }
    for (let i = 0; i < this._timeUpdateCallbacks.length; i++) {
      this._timeUpdateCallbacks[i](currentTime, duration);
    }
  }

  /** @param {number} semitones -12..+12 */
  setPitchSemitones(semitones) {
    this._semitones = semitones;
    if (this._backend === 'worklet' && this.pitchNode) {
      this.pitchNode.parameters.get('pitchRatio').value = semitonesToRatio(semitones);
    } else if (this.shifter) {
      this.shifter.pitchSemitones = semitones;
    }
    this.dispatchEvent(new CustomEvent('pitchchange', { detail: { semitones } }));
  }

  getPitchSemitones() {
    return this._semitones;
  }

  /** @param {number} vol 0..1 */
  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) this.gainNode.gain.value = this._volume;
  }

  getVolume() {
    return this._volume;
  }

  /**
   * Retorna um AnalyserNode "grampeado" na saída de áudio (sem interferir
   * no som), pra quem quiser analisar o volume em tempo real — usado pra
   * detectar silêncio perto do fim da música. Funciona pra CDG sempre;
   * pra vídeo MP4, só funciona se o vídeo estiver roteado pelo pitch
   * shifter (ver attachVideoElement) — se não estiver, retorna o analyser
   * mesmo assim, mas ele não vai captar nada do vídeo (fica "mudo").
   */
  getAnalyser() {
    this._ensureContext();
    if (!this._analyser) {
      this._analyser = this.audioCtx.createAnalyser();
      this._analyser.fftSize = 512;
      this._analyser.smoothingTimeConstant = 0.4;
      // Conecta em PARALELO ao destino (não substitui, só "escuta").
      this.gainNode.connect(this._analyser);
    }
    return this._analyser;
  }

  getCurrentTime() {
    if (this._backend === 'worklet') {
      if (!this._playing) return this._pausedOffset;
      const t = this._segmentStartOffset + (this.audioCtx.currentTime - this._segmentStartCtxTime);
      return this.workletBuffer ? Math.min(t, this.workletBuffer.duration) : t;
    }
    return this.shifter ? this.shifter.timePlayed : 0;
  }

  getDuration() {
    if (this._backend === 'worklet') {
      return this.workletBuffer ? this.workletBuffer.duration : 0;
    }
    return this.buffer ? this.buffer.duration : 0;
  }

  isPlaying() {
    return this._playing;
  }

  // IMPORTANTE: o cronômetro que dispara o desenho da letra e o envio de
  // tempo pra segunda tela roda dentro de uma Web Worker (tick-worker.js),
  // não com setInterval/requestAnimationFrame direto aqui na thread
  // principal. Descobrimos que mesmo setInterval sofre desaceleração do
  // navegador quando a aba não está em primeiro plano (cai pra ~1x por
  // segundo em vez de ~60x) — o suficiente pra parecer "travado" mesmo
  // sem estar 100% parado. Web Workers rodam numa thread verdadeiramente
  // separada, e essa política de desaceleração do navegador não se aplica
  // a elas — por isso o timer de dentro da worker continua na taxa normal
  // mesmo com a aba em segundo plano ou a segunda tela em foco/tela cheia.
  _startTicking() {
    const TICK_INTERVAL_MS = 16; // ~60x/segundo

    const onTick = () => {
      if (!this._playing) return;
      // Num PC lento, os tiques da worker se acumulam na fila enquanto a
      // thread principal está ocupada e chegavam em rajada (cada um
      // redesenhando o CDG) — o "engasgo". Tiques colados são descartados.
      const nowMs = performance.now();
      if (nowMs - this._lastTickMs < TICK_INTERVAL_MS / 2) return;
      this._lastTickMs = nowMs;
      const currentTime = this.getCurrentTime();
      const duration = this.getDuration();

      // Rede de segurança: o evento 'ended' nativo do navegador (que
      // detecta o fim da música) tem relatos conhecidos de não disparar
      // de forma 100% confiável em alguns casos raros do Chrome — quando
      // isso acontece, o player fica "travado" no fim da música sem
      // avançar sozinho. Como esse loop já sabe o tempo atual e a
      // duração (via relógio do AudioContext, independente do evento
      // nativo), detectamos esse caso aqui e forçamos o fim manualmente,
      // em vez de depender só do navegador.
      if (duration > 0 && currentTime >= duration - 0.05) {
        this._finishPlayback();
        return;
      }

      // Chamada direta, sem alocar objeto de evento — roda a cada frame.
      for (let i = 0; i < this._timeUpdateCallbacks.length; i++) {
        this._timeUpdateCallbacks[i](currentTime, duration);
      }
    };

    if (!this._tickWorker && !this._tickWorkerFailed) {
      try {
        this._tickWorker = new Worker('js/tick-worker.js');
        this._tickWorker.onmessage = onTick;
        this._tickWorker.onerror = (err) => {
          console.warn('[AudioEngine] tick-worker falhou, caindo pro setInterval normal:', err);
          this._tickWorkerFailed = true;
          try { this._tickWorker.terminate(); } catch (e) {}
          this._tickWorker = null;
          this._stopTicking();
          this._startTicking(); // reinicia já usando o fallback
        };
      } catch (err) {
        console.warn('[AudioEngine] Não foi possível criar a tick-worker, usando setInterval normal:', err);
        this._tickWorkerFailed = true;
      }
    }

    if (this._tickWorker) {
      this._tickWorker.postMessage({ command: 'start', intervalMs: TICK_INTERVAL_MS });
    } else {
      // Fallback: sem Web Worker disponível, roda na thread principal mesmo
      // (sofre a desaceleração em segundo plano, mas não quebra o app).
      this._rafId = setInterval(onTick, TICK_INTERVAL_MS);
    }
  }

  _stopTicking() {
    if (this._tickWorker) {
      this._tickWorker.postMessage({ command: 'stop' });
    }
    if (this._rafId) {
      clearInterval(this._rafId);
      this._rafId = null;
    }
  }
}

window.AudioEngine = AudioEngine;
export { AudioEngine };
