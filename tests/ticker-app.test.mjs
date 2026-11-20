/** Barra de avisos dentro do app (pílula, aba Avisos, palco, fila, segunda tela). */
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, flush, closeAllApps } from './helpers/app-harness.mjs';

afterEach(closeAllApps);
const PT = { 'playkaraoke-language': 'pt' };
const bar = ($) => $('stage').querySelector('.ticker');
const text = ($) => $('stage').querySelector('.ticker-text').textContent;
function setVal(win, input, value, ev = 'change') { input.value = value; input.dispatchEvent(new win.Event(ev)); }
function check(win, input, on) { input.checked = on; input.dispatchEvent(new win.Event('change')); }

test('pílula liga a barra; sem nenhum item com texto ela fica escondida', async () => {
  const { win, $ } = await createApp({ localStorage: PT });
  $('quick-ticker-btn').click(); await flush();
  assert.ok($('quick-ticker-btn').classList.contains('on'));
  assert.ok(bar($).classList.contains('hidden')); // sem Modo Show e sem textos
  check(win, $('ticker-text1-toggle'), true);
  setVal(win, $('ticker-text1-input'), 'Promoção'); await flush();
  assert.equal(text($), 'Promoção');
  assert.ok(!bar($).classList.contains('hidden'));
  $('quick-ticker-btn').click(); await flush();
  assert.ok(bar($).classList.contains('hidden'), 'pílula desligada não esconde');
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
  const { $, win } = await showWith3Singers();
  $('quick-ticker-btn').click(); setVal(win, $('ticker-upcoming-count'), '1'); await flush();
  assert.equal(text($), 'Próximo a cantar: 2 Bia'); // atual é a Ana
  setVal(win, $('ticker-upcoming-count'), '5'); await flush();
  assert.equal(text($), 'Próximos a cantar: 2 Bia · 3 Caio'); // só existem 2 próximos
});

test('mudança na fila que não muda o texto não reinicia a animação', async () => {
  const { t, $, win } = await showWith3Singers();
  $('quick-ticker-btn').click(); await flush();
  const node = $('stage').querySelector('.ticker-text').firstChild;
  assert.ok(node && text($).includes('Bia'), 'barra sem os próximos');
  const bia = t.singerManager.getAllSingers().find(s => s.name === 'Bia');
  t.singerManager.addSongToSinger(bia.id, false, song(win, 'Bia - Musica3.zip')); await flush();
  assert.equal($('stage').querySelector('.ticker-text').firstChild, node);
});

test('renomear cantor atualiza a barra; trocar idioma troca o rótulo', async () => {
  const { t, $, win } = await showWith3Singers();
  $('quick-ticker-btn').click(); setVal(win, $('ticker-upcoming-count'), '1'); await flush();
  const bia = t.singerManager.getAllSingers().find(s => s.name === 'Bia');
  t.singerManager.renameSinger(bia.id, 'Beatriz'); await flush();
  assert.equal(text($), 'Próximo a cantar: 2 Beatriz');
  win.i18n.setLanguage('en'); await flush();
  assert.equal(text($), 'Next up: 2 Beatriz');
});

test('localStorage corrompido ou quantidade 9 cai nos padrões/limite', async () => {
  const a = await createApp({ localStorage: { ...PT, 'playkaraoke-ticker-settings-v1': '{lixo' } });
  assert.equal(a.$('ticker-upcoming-count').value, '3');
  const b = await createApp({ localStorage: { ...PT, 'playkaraoke-ticker-settings-v1': JSON.stringify({ upcomingCount: 9, bg: 'red', size: 'xl' }) } });
  assert.equal(b.$('ticker-upcoming-count').value, '5');
  assert.equal(b.$('ticker-bg-input').value, '#000000');
  assert.equal(b.$('ticker-size-select').value, 'medium');
});
