import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, fakeFile, flush } from './helpers/app-harness.mjs';

// v3.1.1: correções da revisão (operador apressado com janela aberta,
// regra da mesa, cantor ausente, menores).

function song(win, name) {
  const [artist, title] = name.replace('.zip', '').split(' - ');
  return { id: 'track_' + name, file: fakeFile(win, name), code: null, artist, title, format: 'MP3+G', type: 'cdg', savedSemitones: 0 };
}
async function showWith3Singers() {
  const ctx = await createApp({ localStorage: { 'playkaraoke-hide-show-welcome': 'true' } });
  const { win, t } = ctx;
  for (const name of ['Ana', 'Bia', 'Caio']) {
    t.singerManager.addSinger(name);
    const id = t.singerManager.getAllSingers().find(s => s.name === name).id;
    t.singerManager.addSongToSinger(id, false, song(win, `${name} - Musica1.zip`));
    t.singerManager.addSongToSinger(id, false, song(win, `${name} - Musica2.zip`));
  }
  t.actuallyEnableSingerMode();
  await flush();
  return ctx;
}
const current = (t) => t.singerManager.getCurrentSinger().name;
const titles = (singer) => Array.from(singer.songs, s => s.title);
const byName = (sm, n) => sm.getAllSingers().find(s => s.name === n);
const upcoming = (sm, n) => Array.from(sm.getUpcomingSingers(n), s => s.name);

test('Próxima: se a música acaba com a confirmação aberta, o OK não encerra a vez do próximo', async () => {
  const { t, $ } = await showWith3Singers();
  await t.engine.play();
  $('next-btn').click();
  await flush();
  t.engine.finish(); // acabou sozinha com o modal aberto
  await flush();
  assert.equal(current(t), 'Bia');
  $('generic-confirm-ok-btn').click();
  await flush();
  assert.equal(current(t), 'Bia', 'pulou a Bia');
  assert.deepEqual(titles(byName(t.singerManager, 'Bia')), ['Musica1', 'Musica2'], 'consumiu a música da Bia');
});

test('Trocar música: se a música acaba com o modal aberto, a nova entra na frente sem apagar a próxima', async () => {
  const { win, t, $ } = await showWith3Singers();
  await t.engine.play();
  win.document.querySelector('.singer-swap-btn').click();
  t.engine.finish();
  await flush();
  const input = $('swap-song-file-input');
  Object.defineProperty(input, 'files', { value: [fakeFile(win, 'Ana - Nova.zip')], configurable: true });
  input.dispatchEvent(new win.Event('change'));
  await flush();
  assert.deepEqual(titles(byName(t.singerManager, 'Ana')), ['Nova', 'Musica2']);
});

test('Gerenciar Cantores aberto acompanha o fim da música e o X remove a música certa', async () => {
  const { win, t } = await showWith3Singers();
  const doc = win.document;
  doc.querySelector('#singer-list-full .row .nm').click(); // Gerenciar na Ana
  await t.engine.play();
  t.engine.finish();
  await flush();
  const rows = doc.querySelectorAll('#detail-queue-list .detail-song-row');
  assert.equal(rows.length, 1, 'detalhe ficou com a fila velha');
  rows[0].querySelector('.remove-song-btn').click();
  assert.deepEqual(titles(byName(t.singerManager, 'Ana')), []);
});

test('Próxima com duplo clique ou Ctrl+→ segurado não pula várias músicas', async () => {
  const { win, t, $ } = await createApp({ localStorage: { 'playkaraoke-shortcuts': 'true' } });
  await t.addFilesToQueue(['A - 1.zip', 'B - 2.zip', 'C - 3.zip', 'D - 4.zip'].map(n => fakeFile(win, n)));
  await flush();
  assert.equal(t.currentIndex, 0);
  $('next-btn').click();
  $('next-btn').click();
  await flush();
  assert.equal(t.currentIndex, 1, 'duplo clique pulou duas');
  $('shortcuts-toggle').checked = true;
  win.dispatchEvent(new win.KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', ctrlKey: true, repeat: true, bubbles: true }));
  await flush();
  assert.equal(t.currentIndex, 1, 'tecla segurada pulou');
});

test('Começar novo show pede confirmação antes de apagar a noite', async () => {
  const { win, t, $ } = await showWith3Singers();
  t.openShowReport();
  $('new-show-btn').click();
  await flush();
  assert.equal($('generic-confirm-backdrop').classList.contains('hidden'), false);
  $('generic-confirm-cancel-btn').click();
  await flush();
  assert.ok(win.localStorage.getItem('playkaraoke-singers-v1'), 'apagou sem confirmar');
});

test('CSV: texto começando com "-" ou espaço+"=" é neutralizado; o tom numérico continua número', async () => {
  const { t } = await showWith3Singers();
  t.showHistory.push({ horario: Date.now(), cantor: '-2+3+cmd', musica: ' =1+1', artista: 'X', codigo: '', tom: -2, duracao: 10 });
  const csv = t.buildShowCsv();
  assert.match(csv, /"'-2\+3\+cmd","' =1\+1"/);
  assert.match(csv, /,"-2","10"/);
});

test('mesa: pular a vez de um colega não trava os outros da mesa', async () => {
  const { t } = await createApp();
  const sm = t.singerManager;
  sm.setRotationMode('table');
  sm.addSinger('X');
  for (const n of ['A1', 'A2', 'A3']) sm.addSinger(n, { table: 1 });
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' }); // X canta -> A1
  assert.equal(current(t), 'A1');
  sm.skipTurn(); // A1 não está
  assert.equal(current(t), 'A2');
  assert.deepEqual(upcoming(sm, 1), ['A3'], 'A1 (que já passou) segurou a vaga da mesa');
});

test('mesa: Próximo a cantar vale mesmo com a mesa sem vaga na rodada', async () => {
  const { t } = await createApp();
  const sm = t.singerManager;
  sm.setRotationMode('table');
  for (const n of ['A1', 'A2']) sm.addSinger(n, { table: 1 });
  sm.addSinger('X'); sm.addSinger('Y'); sm.addSinger('A3', { table: 1 });
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' }); // A1
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' }); // A2 -> X
  assert.equal(current(t), 'X');
  sm.moveSingerNext(byName(sm, 'A3').id);
  assert.deepEqual(upcoming(sm, 1), ['A3']);
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' });
  assert.equal(current(t), 'A3');
});

test('mesa: remover o cantor da vez respeita a vaga da mesa', async () => {
  const { t } = await createApp();
  const sm = t.singerManager;
  sm.setRotationMode('table');
  for (const n of ['A1', 'A2']) sm.addSinger(n, { table: 1 });
  sm.addSinger('X'); sm.addSinger('A3', { table: 1 }); sm.addSinger('Y');
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' });
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' });
  assert.equal(current(t), 'X');
  sm.removeSinger(byName(sm, 'X').id);
  assert.equal(current(t), 'Y', 'a mesa 1 cantou 3 vezes na rodada');
});

test('ausente: a vez dele é pulada (e na prévia) até voltar; não segura o encaixe', async () => {
  const { t } = await createApp();
  const sm = t.singerManager;
  for (const n of ['Ana', 'Bia', 'Caio']) sm.addSinger(n);
  sm.setSingerAway(byName(sm, 'Bia').id, true);
  assert.deepEqual(upcoming(sm, 2), ['Caio']);
  sm.completeTurn(sm.getCurrentSinger().id, { id: 'x' });
  assert.equal(current(t), 'Caio');
  sm.setSingerAway(byName(sm, 'Bia').id, false);
  assert.deepEqual(upcoming(sm, 2), ['Ana', 'Bia']);
});

test('ausente pelo Gerenciar: sendo a vez dele (sem ter começado), a vez passa pro próximo; selo na lista', async () => {
  const { win, t } = await showWith3Singers();
  const doc = win.document;
  doc.querySelector('#singer-list-full .row .nm').click(); // Gerenciar na Ana (a da vez)
  const btn = doc.getElementById('detail-away-btn');
  assert.equal(btn.disabled, false);
  btn.click();
  await flush();
  assert.equal(current(t), 'Bia');
  assert.equal(t.playlist[0].artist, 'Bia');
  assert.ok(doc.querySelector('#singer-list-full .row.is-away .away-chip'));
  assert.ok(JSON.parse(win.localStorage.getItem('playkaraoke-singers-v1')).singers[0].away);
  // durante a apresentação de quem é a vez, não dá pra marcar ausente
  await t.engine.play();
  doc.querySelectorAll('#manage-singers-list .ms')[1].click(); // Bia, cantando
  assert.equal(doc.getElementById('detail-away-btn').disabled, true);
});
