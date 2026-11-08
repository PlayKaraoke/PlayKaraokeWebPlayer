/**
 * Singers — gerencia a "rodada de cantores": uma lista circular de
 * cantores, cada um com sua própria sub-fila de até 5 músicas.
 *
 * Regras (confirmadas com o usuário):
 *  - Cantor novo entra no FINAL da rodada atual.
 *  - Tocou a música #1 do cantor -> sai da lista dele (consumida).
 *  - Terminou o último cantor -> volta pro #1 automaticamente (loop).
 *  - Cantor sem música na vez dele -> fica "aguardando seleção" (não existe
 *    pausa nem pulo automático).
 *  - A música que está tocando é identificada pelo ID (não pela posição),
 *    então o operador pode mexer na fila do cantor durante a apresentação
 *    sem que a música errada seja consumida.
 *
 * Esse módulo só cuida dos DADOS e da lógica de rotação — quem toca a
 * música de verdade continua sendo o app.js (via engine/cdgPlayer), esse
 * módulo só decide QUEM/QUAL é a vez.
 */

const MAX_SONGS_PER_SINGER = 5;

/** Traduz uma chave se o sistema de idiomas estiver disponível — com
 * fallback pro texto em português, caso esse módulo seja carregado
 * antes do i18n.js por algum motivo (não deveria acontecer, mas é uma
 * rede de segurança barata). */
function st(key, fallback, vars) {
  if (window.i18n && typeof window.i18n.t === 'function') return window.i18n.t(key, vars);
  let str = fallback;
  if (vars) Object.keys(vars).forEach(k => { str = str.split(`{${k}}`).join(vars[k]); });
  return str;
}

function createSingerManager({ onChange }) {
  let singers = []; // { id, name, songs: [], history: [] }
  let currentSingerId = null;
  let idCounter = 0;

  function notify() { if (onChange) onChange(); }

  function findSinger(id) {
    return singers.find(s => s.id === id) || null;
  }

  function nameExists(name, excludeId = null) {
    const norm = name.trim().toLowerCase();
    return singers.some(s => s.id !== excludeId && s.name.trim().toLowerCase() === norm);
  }

  function addSinger(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error(st('err_singer_name_empty', 'Nome do cantor não pode ser vazio.'));
    if (nameExists(trimmed)) throw new Error(st('err_singer_name_duplicate', 'Já existe um cantor com esse nome.'));
    const singer = { id: 'singer_' + (++idCounter), name: trimmed, songs: [], history: [] };
    singers.push(singer);
    if (currentSingerId === null) currentSingerId = singer.id;
    notify();
    return singer;
  }

  function renameSinger(id, newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed) throw new Error(st('err_singer_name_empty', 'Nome não pode ser vazio.'));
    if (nameExists(trimmed, id)) throw new Error(st('err_singer_name_duplicate', 'Já existe um cantor com esse nome.'));
    const singer = findSinger(id);
    if (singer) { singer.name = trimmed; notify(); }
  }

  function removeSinger(id) {
    const idx = singers.findIndex(s => s.id === id);
    if (idx === -1) return;
    singers.splice(idx, 1);
    if (currentSingerId === id) {
      // A vez passa pro PRÓXIMO da rodada (quem "escorregou" pra posição
      // do removido), não pro primeiro da lista.
      currentSingerId = singers.length > 0 ? singers[idx % singers.length].id : null;
    }
    notify();
  }

  function reorderSinger(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= singers.length) return;
    const [moved] = singers.splice(fromIndex, 1);
    let insertAt = toIndex;
    if (fromIndex < toIndex) insertAt -= 1;
    insertAt = Math.max(0, Math.min(singers.length, insertAt));
    singers.splice(insertAt, 0, moved);
    notify();
  }

  /** Põe o cantor na posição `toIndex` (0 = primeiro); os do caminho andam uma casa. */
  function moveSinger(id, toIndex) {
    const from = singers.findIndex(s => s.id === id);
    if (from === -1) return;
    const [moved] = singers.splice(from, 1);
    singers.splice(Math.max(0, Math.min(singers.length, toIndex)), 0, moved);
    notify();
  }

  /** Próximo a cantar: logo depois do cantor da vez. */
  function moveSingerNext(id) {
    if (id === currentSingerId) return;
    const rest = singers.filter(s => s.id !== id);
    moveSinger(id, rest.findIndex(s => s.id === currentSingerId) + 1);
  }

  /** Último da rodada: logo antes do cantor da vez (a rodada é circular).
   * Se o da vez é o primeiro da lista, "antes dele" é o fim da lista. */
  function moveSingerLast(id) {
    if (id === currentSingerId) return;
    const rest = singers.filter(s => s.id !== id);
    const cur = rest.findIndex(s => s.id === currentSingerId);
    moveSinger(id, cur > 0 ? cur : rest.length);
  }

  /** Adiciona uma música à fila de um cantor (existente ou por nome novo). */
  function addSongToSinger(singerIdOrNewName, isNewName, song) {
    let singer;
    if (isNewName) {
      singer = addSinger(singerIdOrNewName);
    } else {
      singer = findSinger(singerIdOrNewName);
      if (!singer) throw new Error(st('err_singer_not_found', 'Cantor não encontrado.'));
    }
    if (singer.songs.length >= MAX_SONGS_PER_SINGER) {
      throw new Error(st('err_singer_max_songs', `${singer.name} já tem o máximo de ${MAX_SONGS_PER_SINGER} músicas na fila.`, { name: singer.name, max: MAX_SONGS_PER_SINGER }));
    }
    singer.songs.push(song);
    notify();
    return singer;
  }

  function removeSongFromSinger(singerId, songIndex) {
    const singer = findSinger(singerId);
    if (singer) { singer.songs.splice(songIndex, 1); notify(); }
  }

  /** Troca a música numa posição da fila do cantor (índice -1 = entra na
   * frente; além do fim = adiciona). */
  function replaceSong(singerId, index, song) {
    const singer = findSinger(singerId);
    if (!singer) throw new Error(st('err_singer_not_found', 'Cantor não encontrado.'));
    if (index < 0) singer.songs.unshift(song);
    else if (index < singer.songs.length) singer.songs.splice(index, 1, song);
    else singer.songs.push(song);
    notify();
  }

  function reorderSongInSinger(singerId, fromIndex, toIndex) {
    const singer = findSinger(singerId);
    if (!singer) return;
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= singer.songs.length) return;
    const [moved] = singer.songs.splice(fromIndex, 1);
    let insertAt = toIndex;
    if (fromIndex < toIndex) insertAt -= 1;
    insertAt = Math.max(0, Math.min(singer.songs.length, insertAt));
    singer.songs.splice(insertAt, 0, moved);
    notify();
  }

  /** Próximo cantor da rodada a partir de um id, em ordem circular. */
  function getNextActiveSingerId(afterId) {
    if (singers.length === 0) return null;
    const idx = singers.findIndex(s => s.id === afterId);
    const nextIdx = (idx + 1) % singers.length;
    return singers[nextIdx].id;
  }

  function getCurrentSinger() {
    return findSinger(currentSingerId);
  }

  /**
   * Fecha a vez de um cantor: tira a música cantada da fila dele (pelo ID —
   * se o operador já tiver removido/reordenado, nada de errado é consumido),
   * registra no histórico e passa a vez pro próximo da rodada.
   * Se o cantor foi removido durante a apresentação, removeSinger() já
   * passou a vez — aqui não avança de novo (senão pularia alguém).
   * @param {string} singerId - cantor que estava cantando
   * @param {object} song - a música que tocou (mesmo objeto da fila)
   * @param {{semitone?: number}} [playedInfo]
   */
  function completeTurn(singerId, song, playedInfo) {
    const singer = findSinger(singerId);
    if (singer) {
      const idx = singer.songs.findIndex(s => s.id === song.id);
      if (idx !== -1) singer.songs.splice(idx, 1);
      singer.history.push({
        code: song.code, artist: song.artist, title: song.title,
        semitone: playedInfo && playedInfo.semitone || 0,
        timestamp: Date.now(),
      });
      if (currentSingerId === singerId) currentSingerId = getNextActiveSingerId(singerId);
    }
    notify();
  }

  /** Pula a vez do cantor atual (foi embora, não está na hora, etc.): a
   * vez passa pro próximo sem consumir música nem registrar histórico. O
   * cantor continua na rodada. */
  function skipTurn() {
    if (currentSingerId === null || singers.length < 2) return;
    currentSingerId = getNextActiveSingerId(currentSingerId);
    notify();
  }

  /** Lista os próximos N cantores a partir do atual (não inclui o atual). */
  function getUpcomingSingers(count) {
    const result = [];
    let id = currentSingerId;
    const seen = new Set();
    for (let i = 0; i < count; i++) {
      const nextId = getNextActiveSingerId(id);
      if (nextId === null || seen.has(nextId) || nextId === currentSingerId) break;
      seen.add(nextId);
      result.push(findSinger(nextId));
      id = nextId;
    }
    return result;
  }

  function serialize() {
    return { singers, currentSingerId, idCounter };
  }

  function restore(data) {
    if (!data) return;
    singers = data.singers || [];
    currentSingerId = data.currentSingerId || null;
    idCounter = data.idCounter || 0;
    notify();
  }

  function reset() {
    singers = [];
    currentSingerId = null;
    notify();
  }

  return {
    addSinger, renameSinger, removeSinger, reorderSinger,
    moveSinger, moveSingerNext, moveSingerLast,
    addSongToSinger, removeSongFromSinger, reorderSongInSinger, replaceSong,
    getCurrentSinger, completeTurn, skipTurn,
    getUpcomingSingers, getNextActiveSingerId,
    getAllSingers: () => singers,
    nameExists,
    serialize, restore, reset,
    MAX_SONGS_PER_SINGER,
  };
}

window.createSingerManager = createSingerManager;
