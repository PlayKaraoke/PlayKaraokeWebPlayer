import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, flush } from './helpers/app-harness.mjs';

// Tipos de rodízio: ordem de chegada (padrão), encaixe e por mesa.

async function app() {
  return createApp({ localStorage: { 'playkaraoke-hide-show-welcome': 'true' } });
}
const names = (sm) => Array.from(sm.getAllSingers(), s => s.name);
const byName = (sm, n) => sm.getAllSingers().find(s => s.name === n);
/** Cria os cantores; os de `sung` já cantaram uma vez (têm histórico). */
function seed(sm, list, sung = []) {
  for (const n of list) sm.addSinger(n);
  for (const n of sung) byName(sm, n).history.push({ title: 'x' });
}
function setCurrent(sm, n) {
  while (sm.getCurrentSinger().name !== n) sm.skipTurn();
}

test('iniciar o Modo Show pergunta o tipo de rodízio; o show começa ao escolher', async () => {
  const { win, t } = await app();
  const doc = win.document;
  doc.getElementById('show-mode-btn').click();
  assert.equal(t.singerModeEnabled, false);
  assert.equal(doc.getElementById('rotation-mode-backdrop').classList.contains('hidden'), false);
  doc.querySelector('#rotation-mode-backdrop .rot-mode[data-mode="fit"]').click();
  await flush();
  assert.equal(t.singerModeEnabled, true);
  assert.equal(t.singerManager.getRotationMode(), 'fit');
  assert.equal(doc.querySelector('#rotation-mode-seg button.on').dataset.mode, 'fit');
  // trocar nas Configurações
  doc.querySelector('#rotation-mode-seg button[data-mode="table"]').click();
  assert.equal(t.singerManager.getRotationMode(), 'table');
});

test('ordem de chegada: quem chega canta por último na rodada (logo antes do da vez)', async () => {
  const { t } = await app();
  const sm = t.singerManager;
  seed(sm, ['Ana', 'Bia', 'Caio', 'Duda', 'Edu']);
  setCurrent(sm, 'Caio');
  sm.addSinger('Novo');
  assert.deepEqual(names(sm), ['Ana', 'Bia', 'Novo', 'Caio', 'Duda', 'Edu']);
  assert.deepEqual(Array.from(sm.getUpcomingSingers(5), s => s.name), ['Duda', 'Edu', 'Ana', 'Bia', 'Novo']);
});

test('encaixe: entra 5 músicas depois da vez, mas nunca na frente de quem ainda não cantou', async () => {
  const twelve = ['S1', 'S2', 'S3', 'S4', 'Amanda', 'S6', 'S7', 'Bruno', 'S9', 'S10', 'S11', 'S12'];
  {
    const { t } = await app();
    const sm = t.singerManager;
    sm.setRotationMode('fit');
    seed(sm, twelve, twelve.filter(n => n !== 'Bruno'));
    setCurrent(sm, 'Amanda');
    sm.addSinger('Renato'); // Bruno (3º depois da Amanda) não segura: entra 5º
    assert.deepEqual(Array.from(sm.getUpcomingSingers(5), s => s.name), ['S6', 'S7', 'Bruno', 'S9', 'Renato']);
  }
  {
    const { t } = await app();
    const sm = t.singerManager;
    sm.setRotationMode('fit');
    const list = twelve.map(n => n === 'Bruno' ? 'S8' : n === 'S11' ? 'Bruno' : n);
    seed(sm, list, list.filter(n => n !== 'Bruno'));
    setCurrent(sm, 'Amanda');
    sm.addSinger('Renato'); // Bruno é o 6º depois da Amanda: Renato vem logo depois dele
    assert.deepEqual(Array.from(sm.getUpcomingSingers(7), s => s.name), ['S6', 'S7', 'S8', 'S9', 'S10', 'Bruno', 'Renato']);
  }
});

test('encaixe com o show sem ninguém ter cantado: vai pro fim da rodada', async () => {
  const { t } = await app();
  const sm = t.singerManager;
  sm.setRotationMode('fit');
  seed(sm, ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  sm.addSinger('Novo');
  assert.deepEqual(names(sm), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Novo']);
});

test('por mesa: no máximo 2 da mesma mesa por rodada; os outros cantam na rodada seguinte', async () => {
  const { t } = await app();
  const sm = t.singerManager;
  sm.setRotationMode('table');
  for (const n of ['A', 'B', 'C', 'D']) sm.addSinger(n, { table: 1 });
  sm.addSinger('E'); // sem mesa: sem limite
  assert.deepEqual(names(sm), ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(Array.from(sm.getUpcomingSingers(3), s => s.name), ['B', 'E', 'C'], 'prévia não segue a regra da mesa');
  const order = [];
  for (let i = 0; i < 9; i++) {
    const cur = sm.getCurrentSinger();
    order.push(cur.name);
    sm.completeTurn(cur.id, { id: 'x', title: 'x' });
  }
  assert.deepEqual(order, ['A', 'B', 'E', 'C', 'D', 'E', 'A', 'B', 'E']);
});

test('por mesa: tipo, mesa e voltas sobrevivem ao F5', async () => {
  const first = await app();
  const sm = first.t.singerManager;
  first.t.actuallyEnableSingerMode();
  sm.setRotationMode('table');
  sm.addSinger('A', { table: 3 });
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x', title: 'x' });
  const saved = JSON.parse(first.win.localStorage.getItem('playkaraoke-singers-v1'));
  assert.equal(saved.rotationMode, 'table');
  assert.equal(saved.singers[0].table, 3);
  assert.equal(saved.singers[0].turnRound, 0);
  const second = await createApp({ localStorage: { 'playkaraoke-singers-v1': JSON.stringify(saved) } });
  await second.t.ready;
  await flush();
  assert.equal(second.t.singerManager.getRotationMode(), 'table');
  assert.equal(second.t.singerManager.getAllSingers()[0].table, 3);
});

test('por mesa: criar cantor pergunta a mesa e mostra o selo; dá pra trocar no Gerenciar', async () => {
  const { win, t } = await app();
  const doc = win.document;
  t.actuallyEnableSingerMode();
  t.singerManager.setRotationMode('table');
  const answer = async (value) => {
    await flush();
    doc.getElementById('generic-prompt-input').value = value;
    doc.getElementById('generic-prompt-ok-btn').click();
  };
  doc.getElementById('add-singer-btn').click();
  await answer('Jorge');
  await answer('4');
  await flush();
  assert.equal(byName(t.singerManager, 'Jorge').table, 4);
  assert.equal(doc.querySelector('#singer-list-full .table-chip').textContent, 'T4');
  doc.querySelector('#singer-list-full .row .nm').click(); // abre o Gerenciar no Jorge
  const tableBtn = doc.getElementById('detail-table-btn');
  assert.equal(tableBtn.classList.contains('hidden'), false);
  assert.equal(tableBtn.textContent, 'Table 4');
  tableBtn.click();
  await answer('7');
  await flush();
  assert.equal(byName(t.singerManager, 'Jorge').table, 7);
  assert.equal(doc.getElementById('detail-table-btn').textContent, 'Table 7');
});
