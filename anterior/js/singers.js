/**
 * Singers — gerencia a "rodada de cantores": uma lista circular de
 * cantores, cada um com sua própria sub-fila de até 5 músicas.
 *
 * Regras (confirmadas com o usuário):
 *  - Tipo de rodízio (escolhido ao abrir o show, dá pra trocar nas Configurações):
 *    'arrival' (padrão) — ordem de chegada: cantor novo canta por último
 *       nesta rodada (logo antes do cantor da vez).
 *    'fit' — encaixe: cantor novo entra FIT_MIN_WAIT músicas depois da vez,
 *       mas nunca na frente de quem ainda não cantou nenhuma vez.
 *    'table' — por mesa: entra como em 'arrival', e cada mesa canta no
 *       máximo TABLE_MAX_PER_ROUND vezes por rodada (quem sobra na mesa
 *       canta na rodada seguinte, com prioridade pra quem cantou menos).
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
const ROTATION_MODES = ['arrival', 'fit', 'table'];
const FIT_MIN_WAIT = 5;          // modo encaixe: canta no mínimo 5 músicas depois da vez
const TABLE_MAX_PER_ROUND = 2;   // modo mesa: no máximo 2 cantores da mesma mesa por rodada

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
  let rotationMode = 'arrival';
  let round = 0; // modo mesa: conta as voltas na lista (vira ao passar do último pro primeiro)
  let forcedNextId = null; // "Próximo a cantar": vale uma vez, passa por cima da regra da mesa

  function notify() { if (onChange) onChange(); }

  function findSinger(id) {
    return singers.find(s => s.id === id) || null;
  }

  function nameExists(name, excludeId = null) {
    const norm = name.trim().toLowerCase();
    return singers.some(s => s.id !== excludeId && s.name.trim().toLowerCase() === norm);
  }

  function addSinger(name, { table = null } = {}) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error(st('err_singer_name_empty', 'Nome do cantor não pode ser vazio.'));
    if (nameExists(trimmed)) throw new Error(st('err_singer_name_duplicate', 'Já existe um cantor com esse nome.'));
    const singer = { id: 'singer_' + (++idCounter), name: trimmed, songs: [], history: [], table };
    if (currentSingerId === null) {
      singers.push(singer);
      currentSingerId = singer.id;
    } else {
      singers.splice(newSingerIndex(), 0, singer);
    }
    notify();
    return singer;
  }

  /** Onde um cantor novo entra na lista, conforme o tipo de rodízio. */
  function newSingerIndex() {
    const cur = singers.findIndex(s => s.id === currentSingerId);
    const endOfRound = cur > 0 ? cur : singers.length; // logo antes do da vez
    if (rotationMode !== 'fit') return endOfRound;
    // Quem vem depois do da vez, na ordem da rodada.
    const upcoming = singers.slice(cur + 1).concat(singers.slice(0, cur));
    let after = FIT_MIN_WAIT - 1; // quantos cantam antes dele
    upcoming.forEach((s, i) => { if (s.history.length === 0 && !s.away) after = Math.max(after, i + 1); });
    if (after >= upcoming.length) return endOfRound;
    const anchor = after === 0 ? singers[cur] : upcoming[after - 1];
    return singers.indexOf(anchor) + 1;
  }

  function setSingerTable(id, table) {
    const singer = findSinger(id);
    if (singer) { singer.table = table || null; notify(); }
  }

  /** Ausente: continua na lista, mas a vez dele é pulada até voltar
   * (e no modo mesa não segura vaga). */
  function setSingerAway(id, away) {
    const singer = findSinger(id);
    if (!singer) return;
    singer.away = !!away;
    if (away && forcedNextId === id) forcedNextId = null;
    notify();
  }

  function setRotationMode(mode) {
    if (!ROTATION_MODES.includes(mode)) return;
    if (mode !== rotationMode) singers.forEach(s => { delete s.turnRound; }); // a regra da mesa começa do zero
    rotationMode = mode;
    notify();
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
    if (forcedNextId === id) forcedNextId = null;
    if (currentSingerId === id) {
      // A vez passa pro PRÓXIMO da rodada, com a mesma regra do rodízio
      // (mesa e ausentes), calculado antes de tirar ele da lista.
      const sim = liveSim();
      const nextId = nextInRotation(id, sim, id);
      round = sim.round;
      forcedNextId = sim.forced;
      singers.splice(idx, 1);
      currentSingerId = nextId || (singers.length > 0 ? singers[idx % singers.length].id : null);
    } else {
      singers.splice(idx, 1);
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
    if (forcedNextId === id) forcedNextId = null; // mudou de lugar de novo: vale o novo lugar
    notify();
  }

  /** Próximo a cantar: logo depois do cantor da vez. */
  function moveSingerNext(id) {
    if (id === currentSingerId) return;
    const rest = singers.filter(s => s.id !== id);
    moveSinger(id, rest.findIndex(s => s.id === currentSingerId) + 1);
    forcedNextId = id; // canta mesmo que a mesa dele já tenha usado as vagas da rodada
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

  /**
   * Próximo cantor respeitando o tipo de rodízio. `sim` guarda a volta e
   * quem já cantou (dá pra simular a prévia sem mexer no estado real):
   * { round, sangIn(id) -> volta em que cantou, sung(id) -> quantas cantou }.
   * Retorna o id e atualiza sim.round se passou do último pro primeiro.
   */
  function nextInRotation(fromId, sim, excludeId = null) {
    if (singers.length === 0) return null;
    const ok = (s) => s.id !== excludeId && !s.away;
    if (sim.forced) {
      const f = findSinger(sim.forced);
      sim.forced = null; // vale uma vez só
      if (f && ok(f) && f.id !== fromId) return f.id;
    }
    let idx = singers.findIndex(s => s.id === fromId);
    for (let step = 0; step < singers.length * 2 + 1; step++) {
      const nextIdx = (idx + 1) % singers.length;
      if (nextIdx <= idx) sim.round++; // passou do último pro primeiro: nova volta
      idx = nextIdx;
      const c = singers[idx];
      if (!ok(c)) continue;
      if (rotationMode !== 'table' || !c.table) return c.id;
      const mates = singers.filter(s => s.table === c.table && ok(s));
      const used = mates.filter(s => sim.sangIn(s.id) === sim.round).length;
      if (used >= TABLE_MAX_PER_ROUND) continue;
      // Disputam as vagas que sobram só os colegas que ainda vêm nesta volta;
      // cantam primeiro os que cantaram menos (empate: ordem da lista).
      const waiting = mates.filter(s => sim.sangIn(s.id) !== sim.round && singers.indexOf(s) >= idx)
        .sort((a, b) => (sim.sung(a.id) - sim.sung(b.id)) || (singers.indexOf(a) - singers.indexOf(b)));
      if (waiting.indexOf(c) < TABLE_MAX_PER_ROUND - used) return c.id;
    }
    // Ninguém disponível (todos ausentes): o mesmo continua, se puder.
    const from = findSinger(fromId);
    return from && ok(from) ? from.id : null;
  }

  /** Estado real pro nextInRotation. */
  function liveSim() {
    return {
      round,
      forced: forcedNextId,
      sangIn: (id) => { const s = findSinger(id); return s ? s.turnRound : undefined; },
      sung: (id) => { const s = findSinger(id); return s ? s.history.length : 0; },
    };
  }

  /** Passa a vez pro próximo (com a regra do rodízio) e guarda a volta. */
  function advanceFrom(id) {
    const sim = liveSim();
    currentSingerId = nextInRotation(id, sim) || id;
    round = sim.round;
    forcedNextId = sim.forced;
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
      singer.turnRound = round;
      if (currentSingerId === singerId) advanceFrom(singerId);
    }
    notify();
  }

  /** Pula a vez do cantor atual (foi embora, não está na hora, etc.): a
   * vez passa pro próximo sem consumir música nem registrar histórico. O
   * cantor continua na rodada. */
  function skipTurn() {
    if (currentSingerId === null || singers.length < 2) return;
    advanceFrom(currentSingerId);
    notify();
  }

  /** Lista os próximos N cantores a partir do atual (não inclui o atual). */
  function getUpcomingSingers(count) {
    const result = [];
    let id = currentSingerId;
    const seen = new Set();
    // Simula a rodada: cada um que "canta" na prévia conta pra regra da mesa.
    const live = liveSim();
    const sangIn = new Map(), sung = new Map();
    const sim = {
      round: live.round,
      forced: live.forced,
      sangIn: (sid) => sangIn.has(sid) ? sangIn.get(sid) : live.sangIn(sid),
      sung: (sid) => live.sung(sid) + (sung.get(sid) || 0),
    };
    const sing = (sid) => { sangIn.set(sid, sim.round); sung.set(sid, (sung.get(sid) || 0) + 1); };
    if (id !== null) sing(id);
    for (let i = 0; i < count; i++) {
      const nextId = nextInRotation(id, sim);
      if (nextId !== null) sing(nextId);
      if (nextId === null || seen.has(nextId) || nextId === currentSingerId) break;
      seen.add(nextId);
      result.push(findSinger(nextId));
      id = nextId;
    }
    return result;
  }

  function serialize() {
    return { singers, currentSingerId, idCounter, rotationMode, round, forcedNextId };
  }

  function restore(data) {
    if (!data) return;
    singers = data.singers || [];
    currentSingerId = data.currentSingerId || null;
    idCounter = data.idCounter || 0;
    rotationMode = ROTATION_MODES.includes(data.rotationMode) ? data.rotationMode : 'arrival';
    round = data.round || 0;
    forcedNextId = data.forcedNextId || null;
    notify();
  }

  function reset() {
    singers = [];
    currentSingerId = null;
    rotationMode = 'arrival';
    round = 0;
    forcedNextId = null;
    notify();
  }

  return {
    addSinger, renameSinger, removeSinger, reorderSinger,
    moveSinger, moveSingerNext, moveSingerLast,
    addSongToSinger, removeSongFromSinger, reorderSongInSinger, replaceSong,
    getCurrentSinger, completeTurn, skipTurn,
    getUpcomingSingers, getNextActiveSingerId,
    setRotationMode, getRotationMode: () => rotationMode, setSingerTable, setSingerAway,
    getAllSingers: () => singers,
    nameExists,
    serialize, restore, reset,
    MAX_SONGS_PER_SINGER,
  };
}

window.createSingerManager = createSingerManager;
