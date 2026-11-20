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
