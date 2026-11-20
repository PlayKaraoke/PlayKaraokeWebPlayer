/** Barra de avisos (js/ticker.js): trechos, negrito e renderizador. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function load() {
  const win = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true }).window;
  win.eval(readFileSync(path.join(ROOT, 'js/ticker.js'), 'utf8'));
  return win;
}
const win = load();
const flat = (segs) => segs.map(s => s.parts.map(p => p.bold ? `<${p.text}>` : p.text).join('')).join(' | ');
const b = (o) => win.buildTickerSegments({ labelOne: 'Próximo a cantar:', labelMany: 'Próximos a cantar:', upcomingOn: true, upcoming: [], upcomingColor: '#ffffff', text1On: false, text1: '', text1Color: '#ffff00', text2On: false, text2: '', text2Color: '#00ffff', ...o });

test('parseTickerBold', () => {
  const p = (s) => win.parseTickerBold(s).map(x => x.bold ? `<${x.text}>` : x.text).join('');
  assert.equal(p('Batata *R$ 39,90* hoje'), 'Batata <R$ 39,90> hoje');
  assert.equal(p('*a* e *b*'), '<a> e <b>');
  assert.equal(p('5 * 3 = 15'), '5 * 3 = 15');
  assert.equal(p('sem par *aqui'), 'sem par *aqui');
  assert.equal(p('**'), '**');
});

test('buildTickerSegments: singular/plural, rótulo em negrito, cores por item', () => {
  assert.equal(flat(b({ upcoming: [{ position: 13, name: 'Ana' }] })), '<Próximo a cantar:> 13 Ana');
  const segs = b({ upcoming: [{ position: 13, name: 'Ana' }, { position: 14, name: '*Bruno*' }], text1On: true, text1: 'Promoção: *Batata*' });
  assert.equal(flat(segs), '<Próximos a cantar:> 13 Ana · 14 *Bruno* | Promoção: <Batata>');
  assert.deepEqual(Array.from(segs, s => s.color), ['#ffffff', '#ffff00']); // Array.from: array do jsdom é de outro realm
});

test('buildTickerSegments: lista vazia, item desligado e texto só com espaços somem', () => {
  assert.equal(b({ upcoming: [], text1On: true, text1: '   ', text2: 'x' }).length, 0);
  assert.equal(flat(b({ upcomingOn: false, upcoming: [{ position: 1, name: 'Ana' }], text1On: true, text1: ' Oi ' })), 'Oi');
});

const st = (o) => ({ on: true, segments: [{ color: '#ffffff', parts: [{ text: 'Oi', bold: false }, { text: 'X', bold: true }] }], bg: '#000000', size: 'medium', speed: 5, ...o });

test('createTicker: renderiza <b> sem innerHTML e esconde quando desligado/vazio', () => {
  const w = load();
  const tk = w.createTicker(w.document.body); const bar = w.document.querySelector('.ticker');
  tk.update(st({ segments: [{ color: '#ffffff', parts: [{ text: '<img src=x>', bold: false }, { text: 'X', bold: true }] }] }));
  assert.ok(!bar.classList.contains('hidden'));
  assert.equal(bar.querySelector('img'), null, 'texto do usuário virou HTML');
  assert.ok(bar.textContent.includes('<img src=x>'));
  assert.equal(bar.querySelector('b').textContent, 'X');
  tk.update(st({ segments: [] })); assert.ok(bar.classList.contains('hidden'));
  tk.update(st({ on: false })); assert.ok(bar.classList.contains('hidden'));
});

test('createTicker: altura pelo tamanho e mesmo estado não reinicia', () => {
  const w = load();
  const tk = w.createTicker(w.document.body); const bar = w.document.querySelector('.ticker');
  tk.update(st({ size: 'large' })); assert.equal(bar.dataset.size, 'large');
  const node = bar.querySelector('.ticker-text').firstChild; tk.update(st({ size: 'large' }));
  assert.equal(bar.querySelector('.ticker-text').firstChild, node, 'remontou à toa');
});

test('a barra continua passando com "menos animação" do Windows (modo melhor desempenho)', () => {
  // Máquinas antigas costumam estar em "Ajustar para obter melhor desempenho", que liga
  // prefers-reduced-motion no Chrome; a barra é o letreiro que o operador ligou de propósito.
  const w = load(); w.createTicker(w.document.body);
  assert.ok(!w.document.getElementById('ticker-style').textContent.includes('prefers-reduced-motion'));
});
