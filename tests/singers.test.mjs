import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, fakeFile, flush } from './helpers/app-harness.mjs';

function song(win, name) {
  const [artist, title] = name.replace('.zip', '').split(' - ');
  return { id: 'track_' + name, file: fakeFile(win, name), code: null, artist, title, format: 'MP3+G', type: 'cdg', savedSemitones: 0 };
}

/** Liga o Modo Show com 3 cantores (Ana, Bia, Caio), 2 músicas cada. */
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
const names = (t) => Array.from(t.singerManager.getAllSingers(), s => s.name);
const titles = (singer) => Array.from(singer.songs, s => s.title);
const current = (t) => t.singerManager.getCurrentSinger().name;

test('remover a música que está tocando (Gerenciar Cantores) não consome a próxima', async () => {
  const { t } = await showWith3Singers();
  await t.engine.play();
  const ana = t.singerManager.getAllSingers()[0];
  t.singerManager.removeSongFromSinger(ana.id, 0); // operador remove a que está tocando
  t.engine.finish();
  await flush();
  assert.deepEqual(titles(ana), ['Musica2'], 'Musica2 da Ana foi consumida sem ser cantada');
  assert.equal(t.showHistory.at(-1).musica, 'Musica1');
  assert.equal(current(t), 'Bia');
});

test('reordenar as músicas do cantor durante a apresentação registra a música certa', async () => {
  const { t } = await showWith3Singers();
  await t.engine.play();
  const ana = t.singerManager.getAllSingers()[0];
  t.singerManager.reorderSongInSinger(ana.id, 1, 0); // Musica2 sobe pro topo enquanto Musica1 toca
  t.engine.finish();
  await flush();
  assert.equal(t.showHistory.at(-1).musica, 'Musica1');
  assert.deepEqual(titles(ana), ['Musica2']);
});

test('remover o cantor da vez passa a vez pro PRÓXIMO, não pro primeiro', async () => {
  const { t } = await showWith3Singers();
  t.engine.finish(); await flush(); // Ana cantou -> vez da Bia
  assert.equal(current(t), 'Bia');
  const bia = t.singerManager.getAllSingers()[1];
  t.singerManager.removeSinger(bia.id);
  assert.equal(current(t), 'Caio');
  assert.deepEqual(names(t), ['Ana', 'Caio']);
});

test('remover o cantor da vez no meio da apresentação não pula ninguém', async () => {
  const { t } = await showWith3Singers();
  await t.engine.play();
  const ana = t.singerManager.getAllSingers()[0];
  t.singerManager.removeSinger(ana.id); // vez já passa pra Bia
  t.engine.finish(); // música da Ana termina
  await flush();
  assert.equal(current(t), 'Bia', 'avançou duas posições');
  assert.equal(t.showHistory.at(-1).cantor, 'Ana');
});

test('fim de música sem autoplay deixa a do próximo cantor carregada e pausada', async () => {
  const { t } = await showWith3Singers();
  await t.engine.play();
  t.engine.finish();
  await flush();
  assert.equal(t.playlist[0].title, 'Musica1');
  assert.equal(t.playlist[0].artist, 'Bia');
  assert.equal(t.engine.isPlaying(), false);
  assert.equal(t.mode, 'cdg');
});

test('botão Próxima no Modo Show encerra a apresentação (conta como cantada) e passa a vez', async () => {
  const { win, t, $ } = await showWith3Singers();
  await t.engine.play();
  const next = $('next-btn');
  assert.equal(next.disabled, false);
  next.click();
  await flush();
  $('generic-confirm-ok-btn').click();
  await flush();
  assert.equal(t.engine.isPlaying(), false);
  assert.equal(t.showHistory.at(-1).cantor, 'Ana');
  assert.equal(current(t), 'Bia');
  assert.equal(t.playlist[0].artist, 'Bia');
});

test('duração do show conta a partir do início do Modo Show, não do login', async () => {
  const loginTime = String(Date.now() - 3 * 3600 * 1000); // logou há 3h
  const { t, $ } = await createApp({ localStorage: { 'playkaraoke-session-start': loginTime, 'playkaraoke-hide-show-welcome': 'true' } });
  t.actuallyEnableSingerMode();
  t.openShowReport();
  assert.equal($('report-duration').textContent, '0min');
});

test('CSV do show tem BOM (acentos no Excel) e cabeçalho no idioma ativo', async () => {
  const { t } = await showWith3Singers();
  t.engine.finish(); await flush();
  const csv = t.buildShowCsv();
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  assert.match(csv, /^﻿"Date\/Time","Singer","Song"/);
  assert.match(csv, /"Ana","Musica1","Ana"/);
});

test('cantor da vez (música carregada, ainda não começou): trocar/remover/reordenar recarrega a música certa', async () => {
  const { win, t } = await showWith3Singers();
  t.engine.finish(); await flush();          // Ana cantou → Bia com a Musica1 carregada, pausada
  assert.equal(t.playlist[0].artist, 'Bia');
  assert.equal(t.playlist[0].title, 'Musica1');
  const bia = t.singerManager.getAllSingers()[1];
  t.singerManager.reorderSongInSinger(bia.id, 1, 0); // Bia quer cantar a Musica2 primeiro
  await flush();
  assert.equal(t.playlist[0].title, 'Musica2', 'continuou carregada a música antiga');
  assert.equal(t.engine.loadedBuffers.at(-1).name, 'Bia - Musica2.zip');
  t.singerManager.removeSongFromSinger(bia.id, 0);
  await flush();
  assert.equal(t.playlist[0].title, 'Musica1');
});

test('cantor da vez já cantando: mexer na fila dele não interrompe a apresentação', async () => {
  const { t } = await showWith3Singers();
  await t.engine.play();
  const ana = t.singerManager.getAllSingers()[0];
  const loadsBefore = t.engine.loadedBuffers.length;
  t.singerManager.reorderSongInSinger(ana.id, 1, 0);
  await flush();
  assert.equal(t.engine.isPlaying(), true);
  assert.equal(t.engine.loadedBuffers.length, loadsBefore);
});

test('botão "Trocar música" do cantor da vez: troca pela escolhida e recarrega', async () => {
  const { win, t, $ } = await showWith3Singers();
  const btn = () => $('singer-list-full').querySelector('.singer-swap-btn');
  assert.ok(btn(), 'botão deveria aparecer na linha do cantor da vez');
  assert.equal(btn().classList.contains('hidden'), false);
  btn().click();
  assert.equal($('swap-song-backdrop').classList.contains('hidden'), false);
  assert.match($('swap-song-title').textContent, /Ana/);
  // escolhe um arquivo do computador
  const input = $('swap-song-file-input');
  Object.defineProperty(input, 'files', { configurable: true, value: [fakeFile(win, 'Ana - Nova.zip')] });
  input.dispatchEvent(new win.Event('change'));
  await flush();
  const ana = t.singerManager.getAllSingers()[0];
  assert.deepEqual(titles(ana), ['Nova', 'Musica2']);
  assert.equal($('swap-song-backdrop').classList.contains('hidden'), true);
  assert.equal(t.playlist[0].title, 'Nova');
});

test('"Trocar música" no meio da apresentação (cantor desistiu): para, não conta como cantada, carrega a nova', async () => {
  const { win, t, $ } = await showWith3Singers();
  await t.engine.play();
  await flush();
  const btn = $('singer-list-full').querySelector('.singer-swap-btn');
  assert.equal(btn.classList.contains('hidden'), false, 'botão tem que continuar visível com a música tocando');
  btn.click();
  assert.match($('swap-song-current').textContent, /Musica1/);
  const input = $('swap-song-file-input');
  Object.defineProperty(input, 'files', { configurable: true, value: [fakeFile(win, 'Ana - Nova.zip')] });
  input.dispatchEvent(new win.Event('change'));
  await flush(); await flush();
  const ana = t.singerManager.getAllSingers()[0];
  assert.deepEqual(titles(ana), ['Nova', 'Musica2']);
  assert.equal(current(t), 'Ana', 'a vez continua com quem trocou');
  assert.equal(t.showHistory.length, 0, 'música abandonada não vai pro histórico');
  assert.equal(t.playlist[0].title, 'Nova');
  assert.equal(t.engine.loadedBuffers.at(-1).name, 'Ana - Nova.zip');
  assert.equal(t.engine.isPlaying(), false, 'nova fica carregada e pausada');
  assert.equal($('play-btn').disabled, false);
});

test('"Trocar música" no meio, depois de reordenar a fila: a nova entra na frente e a abandonada sai', async () => {
  const { win, t, $ } = await showWith3Singers();
  await t.engine.play();
  const ana = t.singerManager.getAllSingers()[0];
  t.singerManager.reorderSongInSinger(ana.id, 1, 0); // Musica2 sobe enquanto Musica1 toca
  await flush();
  $('singer-list-full').querySelector('.singer-swap-btn').click();
  const input = $('swap-song-file-input');
  Object.defineProperty(input, 'files', { configurable: true, value: [fakeFile(win, 'Ana - Nova.zip')] });
  input.dispatchEvent(new win.Event('change'));
  await flush(); await flush();
  assert.deepEqual(titles(ana), ['Nova', 'Musica2']);
  assert.equal(t.playlist[0].title, 'Nova');
});

test('cantor da vez sem música (foi embora): Próxima fica ativo e pula a vez sem registrar nada', async () => {
  const { t, $ } = await showWith3Singers();
  const ana = t.singerManager.getAllSingers()[0];
  t.singerManager.removeSongFromSinger(ana.id, 0);
  t.singerManager.removeSongFromSinger(ana.id, 0);
  await flush();
  assert.equal(t.mode, null);
  const next = $('next-btn');
  assert.equal(next.disabled, false, 'Próxima tem que permitir pular quem está sem música');
  next.click();
  await flush();
  $('generic-confirm-ok-btn').click();
  await flush(); await flush();
  assert.equal(current(t), 'Bia');
  assert.equal(t.showHistory.length, 0);
  assert.deepEqual(names(t), ['Ana', 'Bia', 'Caio'], 'Ana continua no rodízio');
  assert.equal(t.playlist[0].artist, 'Bia', 'música da Bia fica carregada');
  assert.equal(t.engine.isPlaying(), false);
});

test('cantor da vez com música carregada mas sem começar: Próxima pula a vez e a música dele fica na fila', async () => {
  const { t, $ } = await showWith3Singers();
  $('next-btn').click();
  await flush();
  $('generic-confirm-ok-btn').click();
  await flush(); await flush();
  assert.equal(current(t), 'Bia');
  assert.deepEqual(titles(t.singerManager.getAllSingers()[0]), ['Musica1', 'Musica2']);
  assert.equal(t.showHistory.length, 0);
  assert.equal(t.playlist[0].artist, 'Bia');
});

// ---- Mudar a posição sem as setas (show com 30 cantores) ----

/** Show com Ana, Bia, Caio, Duda, Edu; a vez já passou pra Caio. */
async function showWith5SingersCaioCurrent() {
  const ctx = await showWith3Singers();
  ctx.t.singerManager.addSinger('Duda');
  ctx.t.singerManager.addSinger('Edu');
  ctx.t.singerManager.skipTurn();
  ctx.t.singerManager.skipTurn();
  await flush();
  return ctx;
}
const idOf = (t, name) => t.singerManager.getAllSingers().find(s => s.name === name).id;

test('digitar a posição no número do cantor (lista do Modo Show) move e os do caminho descem', async () => {
  const { win, t } = await showWith5SingersCaioCurrent();
  const badge = win.document.querySelector(`#singer-list-full .row[data-singer-id="${idOf(t, 'Edu')}"] .pos`);
  badge.click();
  const input = badge.querySelector('input');
  assert.equal(input.value, '5');
  input.value = '2';
  input.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.deepEqual(names(t), ['Ana', 'Edu', 'Bia', 'Caio', 'Duda']);
  assert.equal(current(t), 'Caio');
});

test('número da posição: Esc cancela, 0 cancela, acima do total vai pro último; o da vez não edita', async () => {
  const { win, t } = await showWith5SingersCaioCurrent();
  const badgeOf = (name) => win.document.querySelector(`#singer-list-full .row[data-singer-id="${idOf(t, name)}"] .pos`);
  const type = (name, value, key = 'Enter') => {
    badgeOf(name).click();
    const input = badgeOf(name).querySelector('input');
    input.value = value;
    input.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true }));
  };
  type('Ana', '4', 'Escape');
  type('Ana', '0');
  assert.deepEqual(names(t), ['Ana', 'Bia', 'Caio', 'Duda', 'Edu']);
  type('Ana', '50');
  assert.deepEqual(names(t), ['Bia', 'Caio', 'Duda', 'Edu', 'Ana']);
  badgeOf('Caio').click();
  assert.equal(badgeOf('Caio').querySelector('input'), null, 'cantor da vez não deveria ser editável na lista');
});

test('Próximo a cantar / Pro final da fila: logo depois / logo antes do cantor da vez', async () => {
  const { t } = await showWith5SingersCaioCurrent();
  t.singerManager.moveSingerNext(idOf(t, 'Ana'));
  assert.deepEqual(names(t), ['Bia', 'Caio', 'Ana', 'Duda', 'Edu']);
  t.singerManager.moveSingerLast(idOf(t, 'Duda'));
  assert.deepEqual(names(t), ['Bia', 'Duda', 'Caio', 'Ana', 'Edu']);
  assert.deepEqual(Array.from(t.singerManager.getUpcomingSingers(4), s => s.name), ['Ana', 'Edu', 'Bia', 'Duda']);
  t.singerManager.moveSingerNext(idOf(t, 'Caio')); // o da vez: nada muda
  assert.deepEqual(names(t), ['Bia', 'Duda', 'Caio', 'Ana', 'Edu']);
});

test('Pro final da fila com o da vez em 1º (show nem começou): vai pro fim da lista', async () => {
  const { t } = await showWith3Singers();
  t.singerManager.moveSingerLast(idOf(t, 'Bia'));
  assert.deepEqual(names(t), ['Ana', 'Caio', 'Bia']);
  t.singerManager.moveSingerNext(idOf(t, 'Bia'));
  assert.deepEqual(names(t), ['Ana', 'Bia', 'Caio']);
});

test('Gerenciar Cantores: botões movem o cantor e ficam desativados no cantor da vez', async () => {
  const { win, t } = await showWith5SingersCaioCurrent();
  const doc = win.document;
  doc.querySelector(`#singer-list-full .row[data-singer-id="${idOf(t, 'Edu')}"] .nm`).click(); // abre o Gerenciar no Edu
  doc.getElementById('detail-sing-next-btn').click();
  assert.deepEqual(names(t), ['Ana', 'Bia', 'Caio', 'Edu', 'Duda']);
  assert.equal(doc.querySelectorAll('#manage-singers-list .ms .nm > span:first-child')[3].textContent, 'Edu', 'lista do Gerenciar não atualizou');
  doc.getElementById('detail-sing-last-btn').click();
  assert.deepEqual(names(t), ['Ana', 'Bia', 'Edu', 'Caio', 'Duda']);
  doc.querySelectorAll('#manage-singers-list .ms')[3].click(); // Caio, o da vez
  assert.equal(doc.getElementById('detail-sing-next-btn').disabled, true);
  assert.equal(doc.getElementById('detail-sing-last-btn').disabled, true);
  // número editável também no Gerenciar (inclusive o da vez)
  const pos = doc.querySelectorAll('#manage-singers-list .ms .p')[3];
  pos.click();
  const input = pos.querySelector('input');
  input.value = '1';
  input.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.deepEqual(names(t), ['Caio', 'Ana', 'Bia', 'Edu', 'Duda']);
  assert.equal(doc.querySelectorAll('#manage-singers-list .ms .p')[0].nextSibling.querySelector('.nm > span').textContent, 'Caio');
});
