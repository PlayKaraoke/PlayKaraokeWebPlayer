/**
 * File Loader — recebe um File (do input ou drag&drop) e identifica o tipo:
 *  - .zip  -> extrai o .cdg e o arquivo de áudio (mp3/wav) de dentro
 *  - .mp4  -> vídeo com letras já embutidas, tocado direto
 *
 * Depende da global JSZip (carregada via CDN no index.html).
 */

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

/**
 * Prefixos de código das produtoras conhecidas. Depois do prefixo podem vir
 * letras de série (ex: Sunfly "SFMW", Sound Choice "SCG"), o número e um
 * número de faixa opcional. Exemplos: "SC8123-05", "SFMW830-12",
 * "EJBg-0020", "KVD-12345", "ZOOM 1234", "PLKM0012".
 *   SC = Sound Choice · PLK/PLKM = PlayKaraoke · EJBg/EJBv = Essential Jam Box
 *   KV/KVD = Karaoke Version · ZOOM = Zoom · RAF = RAF Electronics
 *   SF = Sunfly · STG = Stingray · SBI = SBI
 */
const KNOWN_CODE_RE = /^(?:SC|PLKM?|EJB[GV]|KVD?|ZOOM|RAF|SF|STG|SBI)[A-Z]{0,4}[-_ ]?\d{1,7}(?:[-_ ]\d{1,4})?[A-Z]?$/i;
// Formato genérico (produtoras não listadas): letras curtas + números,
// com número de faixa opcional (ex: "ABC-1234", "XY123-05").
const GENERIC_CODE_RE = /^[A-Za-z]{1,8}-?\d{2,8}(?:-\d{1,4})?$/;

/**
 * Interpreta o nome do arquivo seguindo a convenção comum de packs de
 * karaokê: "CÓDIGO - Artista - Música". Exemplos reais:
 *   "EJBg-0020 - Kansas - Play the Game Tonight (Acoustic)"
 *   "SC8123-05 - Adele - Hello"
 *   "SF001-01 - Hello"                   (código + título, sem artista)
 *   "Queen - Bohemian Rhapsody"          (sem código)
 *   "Some Random File Name"              (sem separador nenhum)
 *
 * Estratégia: separa por " - " (espaço-hífen-espaço, pra não confundir com
 * hífens que fazem parte do próprio código, tipo "EJBg-0020"). O primeiro
 * pedaço só é tratado como "código" se PARECER um código de verdade —
 * senão, um título comprido que por acaso tenha 2+ traços (ex: "Nome da
 * Música - Artista - Extra") acabaria sendo confundido com código.
 *
 * @param {string} filename
 * @returns {{code: string|null, artist: string|null, title: string}}
 */
function parseKaraokeFilename(filename) {
  const clean = filename.replace(/\.(zip|mp4)$/i, '').trim();
  const parts = clean.split(/\s+-\s+/).map(p => p.trim()).filter(Boolean);

  const isKnownCode = (s) => KNOWN_CODE_RE.test(s);
  const looksLikeCode = (s) => isKnownCode(s) || GENERIC_CODE_RE.test(s);

  if (parts.length >= 3 && looksLikeCode(parts[0])) {
    return {
      code: parts[0],
      artist: parts[1],
      title: parts.slice(2).join(' - '),
    };
  }
  // "CÓDIGO - Música" (sem artista): só com prefixo de produtora conhecida e
  // sem espaço no código, pra não confundir com "Artista 2000 - Música".
  if (parts.length === 2 && isKnownCode(parts[0]) && !/\s/.test(parts[0])) {
    return { code: parts[0], artist: null, title: parts[1] };
  }
  if (parts.length >= 2) {
    return {
      code: null,
      artist: parts[0],
      title: parts.slice(1).join(' - '),
    };
  }
  return {
    code: null,
    artist: null,
    title: clean || filename,
  };
}

async function loadKaraokeFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.mp4')) {
    return {
      type: 'video',
      title: cleanTitle(file.name),
      videoBlobUrl: URL.createObjectURL(file),
    };
  }

  if (name.endsWith('.zip')) {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const cdgEntries = [];
    const audioEntries = []; // { entry, ext }

    zip.forEach((relPath, entry) => {
      if (entry.dir || isJunkZipEntry(relPath)) return;
      const lower = relPath.toLowerCase();
      if (lower.endsWith('.cdg')) {
        cdgEntries.push(entry);
        return;
      }
      const ext = AUDIO_EXTENSIONS.find(e => lower.endsWith(e));
      if (ext) audioEntries.push({ entry, ext });
    });

    const cdgEntry = cdgEntries[0] || null;
    // Com mais de um áudio no zip, prefere o que tem o mesmo nome do .cdg.
    const cdgBase = cdgEntry ? baseNameNoExt(cdgEntry.name) : null;
    const audioChoice = audioEntries.find(a => baseNameNoExt(a.entry.name) === cdgBase) || audioEntries[0] || null;

    if (!cdgEntry || !audioChoice) {
      throw new Error(tr('err_zip_invalid', 'O ZIP precisa conter um arquivo .cdg e um arquivo de áudio (.mp3/.wav).'));
    }
    const audioEntry = audioChoice.entry;
    const audioExt = audioChoice.ext;

    const [cdgBuffer, audioBuffer] = await Promise.all([
      cdgEntry.async('arraybuffer'),
      audioEntry.async('arraybuffer'),
    ]);

    return {
      type: 'cdg',
      title: cleanTitle(file.name),
      cdgBuffer,
      audioBuffer,
      audioExt,
    };
  }

  throw new Error(tr('err_unsupported_format', 'Formato não suportado. Envie um .zip (MP3+G) ou .mp4.'));
}

/** Traduz via i18n quando disponível (fallback em português). */
function tr(key, fallback) {
  return typeof window !== 'undefined' && window.i18n && typeof window.i18n.t === 'function' ? window.i18n.t(key) : fallback;
}

/** Lixo que o macOS/Windows colocam dentro de zips: a pasta __MACOSX/ e
 * os arquivos "._nome" (metadados AppleDouble, que também terminam em
 * .cdg/.mp3 e eram escolhidos no lugar do arquivo de verdade). */
function isJunkZipEntry(relPath) {
  if (/(^|\/)__MACOSX\//i.test(relPath)) return true;
  const base = relPath.split('/').pop();
  return base.startsWith('._') || base === '.DS_Store' || base.toLowerCase() === 'thumbs.db';
}

function baseNameNoExt(relPath) {
  return relPath.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
}

function cleanTitle(filename) {
  return filename.replace(/\.(zip|mp4)$/i, '').replace(/[_-]+/g, ' ').trim();
}

// Também é carregado dentro da worker da Biblioteca (js/library-worker.js),
// que não tem `window`.
const fileLoaderGlobal = typeof window !== 'undefined' ? window : self;
fileLoaderGlobal.loadKaraokeFile = loadKaraokeFile;
fileLoaderGlobal.parseKaraokeFilename = parseKaraokeFilename;
