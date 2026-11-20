/** Sincronia do YouTube na segunda tela (js/second-screen.js real, player falso). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function setup() {
  const html = readFileSync(path.join(ROOT, 'second-screen.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const win = dom.window;
  win.HTMLCanvasElement.prototype.getContext = () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {}, drawImage() {}, fillRect() {} });
  win.HTMLMediaElement.prototype.pause = () => {};
  win.HTMLMediaElement.prototype.play = () => Promise.resolve();
  let listener = null;
  const posted = [];
  win.BroadcastChannel = class { postMessage(m) { posted.push(m); } addEventListener(_, fn) { listener = fn; } };
  const yt = { t: 0, playing: false, seeks: [], muted: true, loads: [], cmds: [],
    async load(id, o) { this.loads.push({ id, ...o }); if (o && o.autoplay) this.playing = true; },
    setMuted(m) { this.muted = m; }, setVolume(v) { this.vol = v; }, getDuration() { return 200; }, play() { this.playing = true; }, pause() { this.playing = false; },
    stop() {}, clear() {}, seekTo(t) { this.seeks.push(t); this.t = t; }, getCurrentTime() { return this.t; }, isPlaying() { return this.playing; } };
  win.createYouTubePlayer = () => yt;
  win.console.info = () => {};
  win.eval(readFileSync(path.join(ROOT, 'js/cdg-player.js'), 'utf8'));
  win.eval(readFileSync(path.join(ROOT, 'js/ticker.js'), 'utf8'));
  win.eval(readFileSync(path.join(ROOT, 'js/second-screen.js'), 'utf8'));
  const send = (msg) => listener({ data: msg });
  send({ type: 'init-youtube', videoId: 'v1' });
  send({ type: 'playing' });
  yt.playing = true;
  return { win, yt, send, posted };
}
const time = (currentTime) => ({ type: 'time', currentTime, duration: 200, sentAt: Date.now() });

test('diferença pequena não gera seek (sem congelar à toa)', () => {
  const { yt, send } = setup();
  yt.t = 10;
  for (let i = 0; i < 10; i++) send(time(10.2));
  assert.equal(yt.seeks.length, 0);
});

test('uma leitura isolada fora da tolerância não corrige; atraso persistente corrige 1x, pulando à frente', () => {
  const { yt, send } = setup();
  yt.t = 10;
  send(time(10.6)); send(time(10.1));           // oscilação isolada
  assert.equal(yt.seeks.length, 0);
  send(time(10.6)); send(time(10.6)); send(time(10.6)); // atraso persistente
  assert.equal(yt.seeks.length, 1);
  assert.ok(yt.seeks[0] > 10.6, 'deveria compensar o tempo de recarga');
  yt.t = 10; send(time(10.6)); send(time(10.6)); send(time(10.6));
  assert.equal(yt.seeks.length, 1, 'correções seguidas demais (intervalo mínimo)');
});

test('salto grande (operador arrastou a barra) corrige na hora', () => {
  const { yt, send } = setup();
  yt.t = 10;
  send(time(60));
  assert.equal(yt.seeks.length, 1);
});

test('pausado não corrige', () => {
  const { yt, send } = setup();
  yt.playing = false; yt.t = 10;
  send(time(60));
  assert.equal(yt.seeks.length, 0);
});

test('modo player principal: toca com som no ponto pedido, obedece comandos e avisa a principal', async () => {
  const { win, yt, send, posted } = setup();
  send({ type: 'init-youtube', videoId: 'v2', remote: true, autoplay: true, startAt: 42, volume: 0.5 });
  await new Promise(r => setTimeout(r, 0));
  assert.equal(yt.muted, false);
  assert.equal(yt.vol, 0.5);
  assert.deepEqual({ ...yt.loads.at(-1) }, { id: 'v2', autoplay: true, startAt: 42 });
  assert.equal(posted.find(m => m.type === 'yt-loaded').videoId, 'v2');
  send({ type: 'yt-command', cmd: 'pause' });
  assert.equal(yt.playing, false);
  assert.equal(posted.at(-1).type, 'yt-state');
  assert.equal(posted.at(-1).playing, false);
  // no modo player principal, não se ressincroniza com a outra tela
  yt.playing = true; yt.t = 10;
  send({ type: 'time', currentTime: 90, duration: 200, sentAt: Date.now() });
  assert.equal(yt.seeks.length, 0);
  win.dispatchEvent(new win.Event('pagehide'));
  assert.equal(posted.at(-1).type, 'bye');
});

test('YouTube carregando/pausado: segunda tela mostra a tela de espera por cima do player', async () => {
  const { win, yt, send } = setup();
  const idle = win.document.getElementById('idle-overlay');
  send({ type: 'init-youtube', videoId: 'v3', remote: true, autoplay: false, startAt: 0 });
  await new Promise(r => setTimeout(r, 0));
  yt.playing = false;
  send({ type: 'playing' }); // tela principal acha que está tocando, mas o player daqui ainda não começou
  assert.equal(idle.classList.contains('hidden'), false, 'player parado deveria ficar coberto');
  assert.equal(win.document.getElementById('youtube-wrap').classList.contains('hidden'), false, 'iframe precisa continuar exibido pra conseguir tocar');
  yt.playing = true;
  send({ type: 'playing' });
  assert.equal(idle.classList.contains('hidden'), true);
});

test('mensagem ticker mostra e esconde a barra', () => {
  const { win, send } = setup();
  const seg = [{ color: '#ffffff', parts: [{ text: 'Oi', bold: false }] }];
  send({ type: 'ticker', state: { on: true, segments: seg, bg: '#000000', size: 'medium', speed: 5 } });
  assert.equal(win.document.querySelector('.ticker-text').textContent, 'Oi');
  send({ type: 'ticker', state: { on: false, segments: seg, bg: '#000000', size: 'medium', speed: 5 } });
  assert.ok(win.document.querySelector('.ticker').classList.contains('hidden'));
});
