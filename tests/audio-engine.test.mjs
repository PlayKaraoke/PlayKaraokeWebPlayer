/**
 * Testa o AudioEngine real (js/audio-engine.js) contra um AudioContext
 * falso — valida a lógica de transporte/fim de música, não o som.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function installFakeWebAudio() {
  const created = { workletNodes: [], sources: [] };
  class FakeCtx {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; this.sampleRate = 44100;
      this.audioWorklet = { addModule: async () => {} }; }
    async resume() {}
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    async decodeAudioData() { return { duration: 10 }; }
    createBufferSource() {
      const src = { connect() {}, disconnect() {}, start() { this.started = true; }, stop() { this.stopped = true; }, onended: null };
      created.sources.push(src);
      return src;
    }
  }
  globalThis.window = globalThis;
  globalThis.AudioContext = FakeCtx;
  globalThis.AudioWorkletNode = class { constructor(ctx, name, opts) { this.opts = opts; this.parameters = new Map([['pitchRatio', { value: 1 }]]); created.workletNodes.push(this); } connect() {} };
  // Worker falso com a mesma interface do js/tick-worker.js.
  globalThis.Worker = class {
    postMessage({ command, intervalMs }) {
      clearInterval(this._id);
      if (command === 'start') this._id = setInterval(() => this.onmessage && this.onmessage({ data: 'tick' }), intervalMs);
    }
    terminate() { clearInterval(this._id); }
  };
  return created;
}

const created = installFakeWebAudio();
const { AudioEngine } = await import(path.join(ROOT, 'js/audio-engine.js'));

async function loadedEngine() {
  const engine = new AudioEngine();
  engine.setPreferredBackend('worklet');
  await engine.loadArrayBuffer(new ArrayBuffer(8));
  return engine;
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));

test('o módulo carrega sem depender do CDN do soundtouchjs', () => {
  assert.equal(typeof AudioEngine, 'function');
});

test("'ended' dispara UMA vez (rede de segurança + evento nativo)", async () => {
  const engine = await loadedEngine();
  let ended = 0;
  engine.addEventListener('ended', () => ended++);
  await engine.play();
  const source = engine.workletSource;
  engine.audioCtx.currentTime = 10; // chegou no fim
  await wait(60); // tick de segurança detecta
  if (source.onended) source.onended(); // evento nativo chegando depois
  assert.equal(ended, 1);
  assert.equal(engine.isPlaying(), false);
  engine.stop();
});

test('pausar, dar seek ou parar nunca dispara ended', async () => {
  const engine = await loadedEngine();
  let ended = 0;
  engine.addEventListener('ended', () => ended++);
  await engine.play();
  const s1 = engine.workletSource;
  engine.seekTo(3);
  assert.equal(s1.onended, null);
  engine.pause();
  engine.stop();
  await wait(40);
  assert.equal(ended, 0);
});

test('play depois do fim recomeça do início', async () => {
  const engine = await loadedEngine();
  await engine.play();
  engine.audioCtx.currentTime = 10;
  await wait(60);
  assert.equal(engine.getCurrentTime(), 0);
  engine.stop();
});

test('o pitch shifter força entrada estéreo (áudio mono nos dois lados)', async () => {
  await loadedEngine();
  const opts = created.workletNodes.at(-1).opts;
  assert.equal(opts.channelCount, 2);
  assert.equal(opts.channelCountMode, 'explicit');
});

test('processador de pitch com entrada mono preenche os dois canais', () => {
  let Proc;
  globalThis.AudioWorkletProcessor = class {};
  globalThis.registerProcessor = (name, cls) => { Proc = cls; };
  new Function(readFileSync(path.join(ROOT, 'js/pitch-worklet-processor.js'), 'utf8'))();
  const p = new Proc();
  const inL = new Float32Array(128).fill(0.5);
  for (const ratio of [1, Math.pow(2, 2 / 12)]) {
    const out = [new Float32Array(128), new Float32Array(128)];
    for (let k = 0; k < 40; k++) p.process([[inL]], [out], { pitchRatio: [ratio] });
    assert.ok(Math.abs(out[1][127]) > 0.1, `canal direito mudo (ratio ${ratio})`);
  }
});

test('troca rápida: o decode lento da música anterior não sobrescreve o da nova', async () => {
  const engine = new AudioEngine();
  engine.setPreferredBackend('worklet');
  engine._ensureContext();
  const ctx = engine.audioCtx;
  const real = ctx.decodeAudioData;
  // A (anterior) demora 50 ms; B (nova, mais curta) termina antes.
  ctx.decodeAudioData = (buf) => buf.byteLength === 1
    ? new Promise(r => setTimeout(() => r({ duration: 300 }), 50))
    : Promise.resolve({ duration: 120 });
  const a = engine.loadArrayBuffer(new ArrayBuffer(1));
  await engine.loadArrayBuffer(new ArrayBuffer(2));
  await a;
  ctx.decodeAudioData = real;
  assert.equal(engine.workletBuffer.duration, 120, 'ficou com o áudio da música anterior');
});
