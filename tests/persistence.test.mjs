import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, flush } from './helpers/app-harness.mjs';

/** Biblioteca falsa com um único arquivo "no disco". */
function stubLibrary(win) {
  const realCreate = win.createLibrary;
  win.createLibrary = (cbs) => {
    const lib = realCreate(cbs);
    const item = { folderId: 'f1', folderName: 'HD', name: 'A - Um.zip', code: null, artist: 'A', title: 'Um', format: 'MP3+G', type: 'cdg' };
    return {
      ...lib,
      restoreSavedFolders: async () => {},
      findByFolderAndName: (folderId, name) => (folderId === 'f1' && name === item.name ? item : null),
      getFileForItem: async (it) => new win.File(['x'], it.name),
    };
  };
}

test('fila da Biblioteca sobrevive a um F5', async () => {
  const saved = JSON.stringify({ items: [{ code: null, artist: 'A', title: 'Um', format: 'MP3+G', type: 'cdg', librarySource: { folderId: 'f1', fileName: 'A - Um.zip' }, savedSemitones: 2 }] });
  const { t } = await createApp({ localStorage: { 'playkaraoke-playlist-v1': saved }, beforeApp: stubLibrary });
  await t.ready;
  await flush();
  assert.equal(t.playlist.length, 1, 'fila restaurada veio vazia');
  assert.equal(t.playlist[0].savedSemitones, 2);
});

test('pasta da Biblioteca pedindo permissão depois de reiniciar: as músicas ficam (pendentes) e não somem do salvo', async () => {
  const saved = JSON.stringify({ items: [{ code: null, artist: 'A', title: 'Um', format: 'MP3+G', type: 'cdg', librarySource: { folderId: 'f1', fileName: 'A - Um.zip' }, savedSemitones: 0 }] });
  const singers = JSON.stringify({ enabled: false, idCounter: 1, currentSingerId: 'singer_1', singers: [{ id: 'singer_1', name: 'Ana', history: [],
    songs: [{ code: null, artist: 'A', title: 'Um', format: 'MP3+G', type: 'cdg', savedSemitones: 0, librarySource: { folderId: 'f1', fileName: 'A - Um.zip' } }] }] });
  const { win, t } = await createApp({
    localStorage: { 'playkaraoke-playlist-v1': saved, 'playkaraoke-singers-v1': singers },
    beforeApp: (w) => {
      const realCreate = w.createLibrary;
      w.createLibrary = (cbs) => ({ ...realCreate(cbs), restoreSavedFolders: async () => {},
        getConnectedFolders: () => [{ id: 'f1', name: 'HD', needsPermission: true }],
        findByFolderAndName: () => null, // índice vazio enquanto não reconecta
        getFileForItem: async () => { throw new Error('sem permissão'); } });
    },
  });
  await t.ready;
  await flush();
  assert.equal(t.playlist.length, 1, 'música da fila foi descartada');
  assert.equal(t.playlist[0].file, null);
  assert.equal(JSON.parse(win.localStorage.getItem('playkaraoke-playlist-v1')).items.length, 1, 'fila salva perdeu a música');
  assert.equal(t.singerManager.getAllSingers()[0].songs.length, 1, 'música do cantor foi descartada');
  assert.equal(JSON.parse(win.localStorage.getItem('playkaraoke-singers-v1')).singers[0].songs.length, 1);
});
