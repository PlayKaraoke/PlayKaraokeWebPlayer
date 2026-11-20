/**
 * Online Search — cliente da busca Online (vídeos de karaokê no YouTube),
 * feita através do Cloudflare Worker em worker/ (que guarda a chave da
 * YouTube Data API e faz cache de 24h das buscas).
 *
 * search(query) -> Promise<[{ videoId, title, channel, thumbnail }]>
 * Em caso de falha, rejeita com um Error cujo `.code` é um de:
 *   'not_configured' (endpoint ainda não definido abaixo) · 'offline'
 *   'quota' (cota diária do YouTube esgotada) · 'network' · 'server'
 */

// URL do Worker publicado (ver worker/README.md). Vazio = busca Online
// desativada, com aviso na interface.
const ONLINE_SEARCH_ENDPOINT = 'https://playkaraoke-search.playkaraoke.workers.dev';

function createOnlineSearch(options) {
  const endpoint = ((options && options.endpoint) || ONLINE_SEARCH_ENDPOINT || '').replace(/\/+$/, '');

  function fail(code) {
    const err = new Error(code);
    err.code = code;
    return err;
  }

  async function search(query) {
    const q = String(query || '').trim();
    if (!q) return [];
    if (!endpoint) throw fail('not_configured');
    if (navigator.onLine === false) throw fail('offline');

    let res;
    try {
      // Wi-Fi ruim de bar: sem limite, o "Buscando..." ficava minutos na tela.
      const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined;
      res = await fetch(`${endpoint}/search?q=${encodeURIComponent(q)}`, { signal });
    } catch (err) {
      throw fail(navigator.onLine === false ? 'offline' : 'network');
    }
    let body = null;
    try { body = await res.json(); } catch (err) { /* resposta inválida */ }
    if (res.status === 429 || (body && body.error === 'quota')) throw fail('quota');
    if (!res.ok || !body || !Array.isArray(body.results)) throw fail('server');
    return body.results;
  }

  return {
    isConfigured: () => !!endpoint,
    search,
  };
}

window.createOnlineSearch = createOnlineSearch;
