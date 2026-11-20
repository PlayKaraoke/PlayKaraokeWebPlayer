/** Barra de avisos dentro do app (pílula, aba Avisos, fila, segunda tela).
 * A barra só é desenhada na segunda tela (pedido do Jorge, desempenho): aqui
 * os testes leem o estado enviado a ela. */
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, flush, closeAllApps } from './helpers/app-harness.mjs';

afterEach(closeAllApps);
const PT = { 'playkaraoke-language': 'pt' };
const sentTickers = (win) => win.__sentToSecondScreen().filter(m => m.type === 'ticker');
/** Texto que a segunda tela mostraria agora ('' = barra escondida). */
function shown(win) {
  const m = sentTickers(win).at(-1);
  if (!m || !m.state.on || !m.state.segments.length) return '';
  return m.state.segments.map(sg => sg.parts.map(p => p.text).join('')).join('   |   ');
}
async function openSecond({ win, $ }) { $('quick-second-screen-btn').click(); win.__fromSecondScreen({ type: 'ready' }); await flush(); }
function setVal(win, input, value, ev = 'change') { input.value = value; input.dispatchEvent(new win.Event(ev)); }
function check(win, input, on) { input.checked = on; input.dispatchEvent(new win.Event('change')); }

test('pílula liga a barra; sem nenhum item com texto ela fica escondida', async () => {
  const ctx = await createApp({ localStorage: PT }); const { win, $ } = ctx;
  await openSecond(ctx);
  $('quick-ticker-btn').click(); await flush();
  assert.ok($('quick-ticker-btn').classList.contains('on'));
  assert.equal(shown(win), ''); // sem Modo Show e sem textos
  check(win, $('ticker-text1-toggle'), true);
  setVal(win, $('ticker-text1-input'), 'Promoção'); await flush();
  assert.equal(shown(win), 'Promoção');
  $('quick-ticker-btn').click(); await flush();
  assert.equal(shown(win), '', 'pílula desligada não esconde');
  assert.equal($('stage').querySelector('.ticker'), null, 'barra desenhada na tela do operador');
});

test('configurações sobrevivem a reabrir o app', async () => {
  const a = await createApp({ localStorage: PT });
  a.$('quick-ticker-btn').click();
  setVal(a.win, a.$('ticker-upcoming-count'), '5');
  setVal(a.win, a.$('ticker-size-select'), 'large');
  setVal(a.win, a.$('ticker-text2-input'), 'Insta *@casa*');
  await flush();
  const saved = a.win.localStorage.getItem('playkaraoke-ticker-settings-v1');
  const b = await createApp({ localStorage: { ...PT, 'playkaraoke-ticker-settings-v1': saved } });
  assert.ok(b.$('quick-ticker-btn').classList.contains('on'));
  assert.equal(b.$('ticker-upcoming-count').value, '5');
  assert.equal(b.$('ticker-size-select').value, 'large');
  assert.equal(b.$('ticker-text2-input').value, 'Insta *@casa*');
});

// ---- Próximos a cantar (Task 3) ----
import { fakeFile } from './helpers/app-harness.mjs';
function song(win, name) {
  const [artist, title] = name.replace('.zip', '').split(' - ');
  return { id: 'track_' + name, file: fakeFile(win, name), code: null, artist, title, format: 'MP3+G', type: 'cdg', savedSemitones: 0 };
}
async function showWith3Singers(extraStorage = {}) {
  const ctx = await createApp({ localStorage: { ...PT, 'playkaraoke-hide-show-welcome': 'true', ...extraStorage } });
  const { win, t } = ctx;
  for (const name of ['Ana', 'Bia', 'Caio']) {
    t.singerManager.addSinger(name);
    const id = t.singerManager.getAllSingers().find(s => s.name === name).id;
    t.singerManager.addSongToSinger(id, false, song(win, `${name} - Musica1.zip`));
  }
  t.actuallyEnableSingerMode();
  await flush();
  return ctx;
}

test('mostra a quantidade escolhida, ou os que existem', async () => {
  const ctx = await showWith3Singers(); const { $, win } = ctx; await openSecond(ctx);
  $('quick-ticker-btn').click(); setVal(win, $('ticker-upcoming-count'), '1'); await flush();
  assert.equal(shown(win), 'Próximo a cantar: 2 Bia'); // atual é a Ana
  setVal(win, $('ticker-upcoming-count'), '5'); await flush();
  assert.equal(shown(win), 'Próximos a cantar: 2 Bia · 3 Caio'); // só existem 2 próximos
});

test('mudança na fila que não muda o texto não reenvia (não reinicia a animação)', async () => {
  const ctx = await showWith3Singers(); const { t, $, win } = ctx; await openSecond(ctx);
  $('quick-ticker-btn').click(); await flush();
  assert.ok(shown(win).includes('Bia'), 'barra sem os próximos');
  const n = sentTickers(win).length;
  const bia = t.singerManager.getAllSingers().find(s => s.name === 'Bia');
  t.singerManager.addSongToSinger(bia.id, false, song(win, 'Bia - Musica3.zip')); await flush();
  assert.equal(sentTickers(win).length, n);
});

test('renomear cantor atualiza a barra; trocar idioma troca o rótulo', async () => {
  const ctx = await showWith3Singers(); const { t, $, win } = ctx; await openSecond(ctx);
  $('quick-ticker-btn').click(); setVal(win, $('ticker-upcoming-count'), '1'); await flush();
  const bia = t.singerManager.getAllSingers().find(s => s.name === 'Bia');
  t.singerManager.renameSinger(bia.id, 'Beatriz'); await flush();
  assert.equal(shown(win), 'Próximo a cantar: 2 Beatriz');
  win.i18n.setLanguage('en'); await flush();
  assert.equal(shown(win), 'Next up: 2 Beatriz');
});

test('localStorage corrompido ou quantidade 9 cai nos padrões/limite', async () => {
  const a = await createApp({ localStorage: { ...PT, 'playkaraoke-ticker-settings-v1': '{lixo' } });
  assert.equal(a.$('ticker-upcoming-count').value, '3');
  const b = await createApp({ localStorage: { ...PT, 'playkaraoke-ticker-settings-v1': JSON.stringify({ upcomingCount: 9, bg: 'red', size: 'xl' }) } });
  assert.equal(b.$('ticker-upcoming-count').value, '5');
  assert.equal(b.$('ticker-bg-input').value, '#000000');
  assert.equal(b.$('ticker-size-select').value, 'medium');
});

// ---- Segunda tela (Task 4) ----
test('segunda tela recebe a barra ao mudar, sem repetir o mesmo estado, e de novo no ready', async () => {
  const ctx = await createApp({ localStorage: PT });
  const { win, $ } = ctx;
  await openSecond(ctx);
  const tickers = () => sentTickers(win);
  const before = tickers().length;
  check(win, $('ticker-text1-toggle'), true);
  setVal(win, $('ticker-text1-input'), 'Oi'); await flush();
  $('quick-ticker-btn').click(); await flush();
  const last = tickers().at(-1);
  assert.ok(last.state.on);
  assert.equal(last.state.segments[0].parts[0].text, 'Oi');
  const n = tickers().length;
  assert.ok(n > before);
  setVal(win, $('ticker-upcoming-count'), '4'); await flush(); // sem Modo Show: não muda o estado
  assert.equal(tickers().length, n, 'reenviou estado igual');
  win.__fromSecondScreen({ type: 'ready' }); await flush();
  assert.equal(tickers().length, n + 1, 'não reenviou no ready');
});
