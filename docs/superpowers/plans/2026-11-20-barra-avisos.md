# Barra de avisos — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Letreiro fino no rodapé (palco do player e segunda tela) passando "Próximos a cantar" (1–5) e dois textos livres, com liga/desliga por item, pílula "Avisos" no topo e aba "Avisos" nas Configurações.

**Architecture:** Um arquivo novo `js/ticker.js`, carregado pelas duas páginas, com uma função pura que monta o texto e um renderizador que anima só `transform` via CSS. O `app.js` guarda as configurações em `localStorage`, monta o estado e o entrega ao renderizador local e, via `broadcastToSecondScreen`, à segunda tela. O estado só é reenviado quando muda (comparando o JSON).

**Tech Stack:** HTML/CSS/JS puro, sem build; testes `node --test` + jsdom (`npm test`).

**Spec:** `docs/superpowers/specs/2026-11-20-barra-avisos-design.md`

## Global Constraints

- Animação só de `transform` (`will-change: transform`, `contain: layout paint` na barra); **sem blur, backdrop-filter, sombra borrada ou filtros**.
- Barra desligada ou sem texto = `display:none` e nenhuma animação rodando.
- Texto remontado só quando algo muda; nunca por quadro ou timer. Nada de `requestAnimationFrame` em loop.
- Não mexer em `worker/` nem em `legacy/` (v2.6). A Task 0 guarda a v3.1.1 em `anterior/` antes de qualquer outra mudança.
- Não mudar o formato de chaves existentes do `localStorage` (a `/anterior` lê as mesmas).
- Textos da interface em `js/i18n.js`, nos blocos `en` e `pt`.
- Chave de armazenamento: `playkaraoke-ticker-settings-v1`.
- Versão: 3.2.0, em todos os `?v=` de `index.html` e `second-screen.html`, `#version-tag` e `.about-foot`.
- Texto do usuário vira nós de DOM (`textContent` + `<b>`), **nunca `innerHTML`**. Negrito: `*palavra*` só nos textos livres.
- Fonte da barra: Inter 500/700, que já é carregada. Nenhuma fonte nova.
- Separador entre itens: `   |   `. Entre nomes: ` · `. Formato de cada cantor: `<posição> <nome>`.

## Review Focus

1. Texto com `<`, `&` ou HTML aparece literal na barra (Task 1). Mudança na fila que não altera o texto (ex.: adicionar música a um cantor) **não** pode reiniciar a animação. Teste na Task 3.
2. Fila com menos cantores que a quantidade escolhida mostra só os que existem, e sem Modo Show o trecho some. Testes nas Tasks 1 e 3.
3. Tudo desligado ou textos vazios/só espaços = barra escondida mesmo com a pílula ligada. Testes nas Tasks 1 e 2.
4. Segunda tela aberta ou recarregada depois de ligar a barra recebe o estado atual. Teste na Task 4.
5. `localStorage` corrompido ou com campos faltando não quebra a abertura e cai nos padrões; quantidade fora de 1–5 é limitada. Teste na Task 3.

---

### Task 0: Guardar a v3.1.1 em `/anterior` (regra: versão estável anterior sempre no ar)

**Files:**
- Create: `anterior/index.html`, `anterior/second-screen.html`, `anterior/help.html`, `anterior/js/*` (cópia da v3.1.1 do commit `5ab2b46`)

Sem teste automatizado: é uma cópia. A verificação é abrir no navegador.

- [ ] **Step 1: Copiar sem duplicar os 10 MB de `assets/`** (mesmo esquema da `legacy/`, que aponta para `../assets/`)

```bash
mkdir -p anterior && cp index.html second-screen.html help.html anterior/ && cp -R js anterior/js
# assets/ continua só na raiz: reescrever as 23 referências (html, app.js, pads.js, ambient-playlist.js)
grep -rl 'assets/' anterior | xargs sed -i '' 's#\([^.]\)assets/#\1../assets/#g; s#^assets/#../assets/#'
grep -rn 'assets/' anterior | grep -v '\.\./assets/'
```
Expected: o último `grep` não imprime nada.

- [ ] **Step 2: Marcar a versão** — em `anterior/index.html`, `#version-tag` passa a `PlayKaraoke Player v3.1.1 (anterior)`, para o operador ver em qual está.

- [ ] **Step 3: Conferir no navegador** (servir a raiz com `python3 -m http.server`; abrir `/anterior/`). Logo, aplausos, pads, música ambiente e segunda tela (`/anterior/second-screen.html`) carregam sem 404 no console. Tocar um .zip de teste.

- [ ] **Step 4: Commit**

```bash
git add anterior
git commit -m "anterior/: v3.1.1 guardada antes da barra de avisos"
```

Observação: `/anterior` e a raiz têm a mesma origem e dividem o `localStorage`. A v3.2.0 só **acrescenta** a chave `playkaraoke-ticker-settings-v1` e não muda as que existem, então voltar para `/anterior` no meio do show mantém fila e configurações.

---

### Task 1: `js/ticker.js` — montar os trechos e renderizar

**Files:**
- Create: `js/ticker.js`
- Test: `tests/ticker.test.mjs`

**Interfaces:**
- Produces:
  - `window.parseTickerBold(str) -> Array<{text:string, bold:bool}>`: `*palavra*` (par de asteriscos com conteúdo que não começa nem termina em espaço) vira `bold:true`; asterisco sem par fica literal; partes vazias são descartadas.
  - `window.buildTickerSegments(opts) -> Array<{color:string, parts:Array<{text,bold}>}>`, onde `opts = { upcomingOn, upcoming: Array<{position:number|null, name:string}>, upcomingColor, labelOne, labelMany, text1On, text1, text1Color, text2On, text2, text2Color }`. Um trecho por item ligado e não vazio, na ordem próximos → texto 1 → texto 2. No trecho dos próximos, `parts = [{text: label, bold:true}, {text: ' 13 Ana · 14 Bruno', bold:false}]` (nomes nunca passam por `parseTickerBold`). Nos textos livres, `parts = parseTickerBold(text.trim())`. Retorna `[]` quando não há nada.
  - `window.createTicker(hostEl) -> { update(state) }`, onde `state = { on: bool, segments: (retorno acima), bg: '#rrggbb', size: 'small'|'medium'|'large', speed: 1..10 }`. Cria em `hostEl` um `<div class="ticker hidden"><span class="ticker-text"></span></div>`.

- [ ] **Step 1: Escrever os testes que falham** (carregar com `win.eval(readFileSync('js/ticker.js'))` num `JSDOM` vazio)

```js
const flat = (segs) => segs.map(s => s.parts.map(p => p.bold ? `<${p.text}>` : p.text).join('')).join(' | ');
const b = (o) => win.buildTickerSegments({ labelOne: 'Próximo a cantar:', labelMany: 'Próximos a cantar:', upcomingOn: true, upcoming: [], upcomingColor: '#ffffff', text1On: false, text1: '', text1Color: '#ffff00', text2On: false, text2: '', text2Color: '#00ffff', ...o });

test('parseTickerBold', () => {
  const p = (s) => win.parseTickerBold(s).map(x => x.bold ? `<${x.text}>` : x.text).join('');
  assert.equal(p('Batata *R$ 39,90* hoje'), 'Batata <R$ 39,90> hoje');
  assert.equal(p('*a* e *b*'), '<a> e <b>');
  assert.equal(p('5 * 3 = 15'), '5 * 3 = 15');   // asterisco solto/espaçado não vira negrito
  assert.equal(p('sem par *aqui'), 'sem par *aqui');
  assert.equal(p('**'), '**');
});
test('buildTickerSegments: singular/plural, rótulo em negrito, cores por item', () => {
  assert.equal(flat(b({ upcoming: [{ position: 13, name: 'Ana' }] })), '<Próximo a cantar:> 13 Ana');
  const segs = b({ upcoming: [{ position: 13, name: 'Ana' }, { position: 14, name: '*Bruno*' }], text1On: true, text1: 'Promoção: *Batata*' });
  assert.equal(flat(segs), '<Próximos a cantar:> 13 Ana · 14 *Bruno* | Promoção: <Batata>');
  assert.deepEqual(segs.map(s => s.color), ['#ffffff', '#ffff00']);
});
test('buildTickerSegments: lista vazia, item desligado e texto só com espaços somem', () => {
  assert.deepEqual(b({ upcoming: [], text1On: true, text1: '   ', text2: 'x' }), []);
  assert.equal(flat(b({ upcomingOn: false, upcoming: [{ position: 1, name: 'Ana' }], text1On: true, text1: ' Oi ' })), 'Oi');
});
const st = (o) => ({ on: true, segments: [{ color: '#ffffff', parts: [{ text: 'Oi', bold: false }, { text: 'X', bold: true }] }], bg: '#000000', size: 'medium', speed: 5, ...o });
test('createTicker: renderiza <b> sem innerHTML e esconde quando desligado/vazio', () => {
  const tk = win.createTicker(win.document.body); const bar = win.document.querySelector('.ticker');
  tk.update(st({ segments: [{ color: '#ffffff', parts: [{ text: '<img src=x>', bold: false }, { text: 'X', bold: true }] }] }));
  assert.ok(!bar.classList.contains('hidden'));
  assert.equal(bar.querySelector('img'), null, 'texto do usuário virou HTML');
  assert.equal(bar.querySelector('b').textContent, 'X');
  tk.update(st({ segments: [] })); assert.ok(bar.classList.contains('hidden'));
  tk.update(st({ on: false })); assert.ok(bar.classList.contains('hidden'));
});
test('createTicker: altura pelo tamanho e mesmo estado não reinicia', () => {
  const tk = win.createTicker(win.document.body); const bar = win.document.querySelector('.ticker');
  tk.update(st({ size: 'large' })); assert.equal(bar.dataset.size, 'large');
  const node = bar.querySelector('.ticker-text').firstChild; tk.update(st({ size: 'large' }));
  assert.equal(bar.querySelector('.ticker-text').firstChild, node, 'remontou à toa');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/ticker.test.mjs`
Expected: FAIL (`win.parseTickerBold is not a function`)

- [ ] **Step 3: Implementar `js/ticker.js`**

`parseTickerBold`: uma regex global `/\*(\S(?:[^*]*\S)?)\*/g` percorrendo a string; o que fica entre os casamentos é texto normal.

`createTicker.update`: compara `JSON.stringify(state)` com o último e sai cedo se for igual. Esconde com `hidden` quando `!on || !segments.length`. Senão:
- põe `bar.dataset.size = size` e `--tk-bg = bg`;
- remonta o `.ticker-text` com nós: um `<span style="color:…">` por trecho, cada parte como `textNode` ou `<b>`; entre trechos, `<span class="tk-sep">   |   </span>` com a cor do trecho anterior;
- reinicia a animação (remove `run`, lê `offsetWidth`, devolve `run`), com `--tk-dur` em segundos = `(hostWidth + textWidth) / (hostWidth * speed * 0.02)`, medido uma vez por update (mínimo 5 s; em jsdom as larguras são 0).

Recalcula só a duração num listener `resize` agrupado por um único `requestAnimationFrame`.

Tamanho em fração da altura do host, calculado no update e no resize: `font-size = max(12, hostEl.clientHeight * k)`, com k = 0,03 (small), 0,045 (medium) e 0,06 (large). A altura da barra é `line-height:1.6` sobre isso.

CSS injetado uma vez num `<style id="ticker-style">`, porque as duas páginas usam:
```css
.ticker{position:absolute;left:0;right:0;bottom:0;z-index:6;overflow:hidden;pointer-events:none;background:var(--tk-bg);font:500 var(--tk-size)/1.6 'Inter',sans-serif;white-space:nowrap;contain:layout paint}
.ticker b{font-weight:700}
.ticker .tk-sep{opacity:.5;white-space:pre}
.ticker.hidden{display:none}
.ticker-text{display:inline-block;padding-left:100%;will-change:transform}
.ticker.run .ticker-text{animation:tk-scroll var(--tk-dur) linear infinite}
@keyframes tk-scroll{from{transform:translateX(0)}to{transform:translateX(-100%)}}
@media (prefers-reduced-motion:reduce){.ticker.run .ticker-text{animation:none;padding-left:16px}}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test tests/ticker.test.mjs`
Expected: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add js/ticker.js tests/ticker.test.mjs
git commit -m "feat: ticker.js com trechos coloridos, negrito e renderizador leve"
```

---

### Task 2: Pílula "Avisos", aba nas Configurações e barra no palco

**Files:**
- Modify: `index.html` (pílula depois de `#quick-ambient-btn`, ~linha 535; botão `data-sec="ticker"` em `#settings-nav` depois de `data-sec="pads"`; `<section class="s-sec" data-sec="ticker">` depois da seção `pads`; `<script src="js/ticker.js?v=3.2.0">` antes de `app.js`)
- Modify: `js/i18n.js` (blocos `en` e `pt`)
- Modify: `js/app.js` (elementos, persistência, `refreshTicker`)
- Modify: `tests/helpers/app-harness.mjs` (incluir `'js/ticker.js'` na lista de scripts avaliados antes do `app.js`)
- Test: `tests/ticker-app.test.mjs`

**Interfaces:**
- Consumes: `window.buildTickerSegments`, `window.createTicker` (Task 1)
- Produces (no `app.js`): `refreshTicker(): void`, que monta o estado e o aplica; `getTickerState(): {on,segments,bg,size,speed}`; e os IDs de DOM abaixo, usados nos testes e na Task 3.

IDs de DOM (todos dentro da seção `ticker`, seguindo o markup `.s-card/.s-row/.sw` das outras seções; os interruptores são `<input type="checkbox" class="hidden">` + indicador `.sw`, como `ambient-toggle` / `ambient-toggle-indicator`):
`quick-ticker-btn`, `ticker-toggle`, `ticker-upcoming-toggle`, `ticker-upcoming-count` (`<select>` 1–5), `ticker-text1-toggle`, `ticker-text1-input` (`maxlength="200"`), `ticker-text2-toggle`, `ticker-text2-input` (`maxlength="200"`), `ticker-upcoming-color`, `ticker-text1-color`, `ticker-text2-color` e `ticker-bg-input` (`type="color"`, um ao lado de cada item e um para a barra), `ticker-size-select` (`<select>` com `small`/`medium`/`large`), `ticker-speed-input` (range 1–10). Abaixo dos campos de texto, uma dica: `ticker_bold_hint`.

Padrões: barra desligada; próximos ligado, 3; textos desligados e vazios; cor dos próximos `#ffffff`, texto 1 `#ffd400`, texto 2 `#ffffff`; barra `#000000`; tamanho `medium`; velocidade 5.

Chaves i18n (en / pt): `pill_ticker` Notices / Avisos · `pill_ticker_title` Show/hide the notice bar / Mostrar/esconder a barra de avisos · `settings_sec_ticker` Notices / Avisos · `ticker_bar_title` Notice bar / Barra de avisos · `ticker_bar_desc` Scrolling text at the bottom of the karaoke screen, for the audience. / Texto passando no rodapé da tela de karaokê, para o público. · `ticker_upcoming` Next singers / Próximos a cantar · `ticker_upcoming_count` How many / Quantos · `ticker_text1` Text 1 / Texto 1 · `ticker_text2` Text 2 / Texto 2 · `ticker_item_color` Color / Cor · `ticker_bg_color` Bar color / Cor da barra · `ticker_size` Bar size / Tamanho da barra · `ticker_size_small` Small / Pequeno · `ticker_size_medium` Medium / Médio · `ticker_size_large` Large / Grande · `ticker_bold_hint` Use *word* for bold. / Use *palavra* para negrito. · `ticker_speed` Speed / Velocidade · `ticker_label_one` Next up: / Próximo a cantar: · `ticker_label_many` Next up: / Próximos a cantar:

- [ ] **Step 1: Escrever os testes que falham** (`createApp` de `tests/helpers/app-harness.mjs`)

```js
test('pílula liga a barra; sem nenhum item com texto ela fica escondida', async () => {
  const { $ } = await createApp();
  $('quick-ticker-btn').click(); await flush();
  assert.ok($('quick-ticker-btn').classList.contains('on'));
  assert.ok($('stage').querySelector('.ticker').classList.contains('hidden')); // sem Modo Show e sem textos
  $('ticker-text1-toggle').click(); $('ticker-text1-input').value = 'Promoção';
  $('ticker-text1-input').dispatchEvent(new (win.Event)('input')); await flush();
  assert.equal($('stage').querySelector('.ticker-text').textContent, 'Promoção');
  assert.ok(!$('stage').querySelector('.ticker').classList.contains('hidden'));
});
test('configurações sobrevivem a reabrir o app', async () => {
  const a = await createApp();
  a.$('quick-ticker-btn').click(); a.$('ticker-upcoming-count').value = '5';
  a.$('ticker-upcoming-count').dispatchEvent(new a.win.Event('change')); await flush();
  const saved = a.win.localStorage.getItem('playkaraoke-ticker-settings-v1');
  const b = await createApp({ localStorage: { 'playkaraoke-ticker-settings-v1': saved } });
  assert.ok(b.$('quick-ticker-btn').classList.contains('on'));
  assert.equal(b.$('ticker-upcoming-count').value, '5');
});
```
(Ajustar a forma de clicar nos interruptores ao que as outras seções usam: clique no indicador `.sw` ou `checked` + evento `change`.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/ticker-app.test.mjs`
Expected: FAIL (`quick-ticker-btn` null)

- [ ] **Step 3: Implementar markup, i18n e ligação no `app.js`**

A pílula segue o padrão de `quickAmbientBtn` (`app.js` ~1941–1952): alterna `ticker-toggle` e dispara `change`; a classe `on` acompanha. Ao lado de `persistCountdownSettings`/`restoreCountdownSettings` (~3534) entram `persistTickerSettings()` e `restoreTickerSettings()`, com o mesmo formato try/catch. `createTicker(el('stage'))` é criado uma vez. Todo `change`/`input` dos campos chama `persistTickerSettings(); refreshTicker();`. Nesta task, `refreshTicker` já usa os textos; a parte dos cantores entra na Task 3 (por enquanto, `upcoming: []`).

- [ ] **Step 4: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS em tudo, inclusive os testes antigos (o harness carrega `ticker.js`)

- [ ] **Step 5: Commit**

```bash
git add index.html js/i18n.js js/app.js tests/helpers/app-harness.mjs tests/ticker-app.test.mjs
git commit -m "feat: pílula e aba Avisos com barra no palco"
```

---

### Task 3: Próximos a cantar acompanham a fila

**Files:**
- Modify: `js/app.js` (`refreshTicker`; `onChange` do `singerManager` ~2715; ao ligar/desligar o Modo Show; `window.i18n.onLanguageChange` ~4516)
- Test: `tests/ticker-app.test.mjs`

**Interfaces:**
- Consumes: `singerManager.getUpcomingSingers(n)` (não inclui o cantor atual), `getSingerPosition(id)`, `singerModeEnabled`, `refreshTicker`/`getTickerState` (Task 2)

- [ ] **Step 1: Escrever os testes que falham** (reusar o `showWith3Singers` de `tests/v311.test.mjs`, copiado para o arquivo, com Ana, Bia e Caio)

```js
test('mostra a quantidade escolhida, ou os que existem', async () => {
  const { t, $, win } = await showWith3Singers();
  $('quick-ticker-btn').click(); setCount(win, $, '1'); await flush();
  assert.equal(text($), 'Próximo a cantar: 2 Bia');           // pt; atual é a Ana
  setCount(win, $, '5'); await flush();
  assert.equal(text($), 'Próximos a cantar: 2 Bia · 3 Caio'); // só existem 2 próximos
});
test('mudança na fila que não muda o texto não reinicia a animação', async () => {
  const { t, $, win } = await showWith3Singers();
  $('quick-ticker-btn').click(); await flush();
  const node = $('stage').querySelector('.ticker-text').firstChild;
  const bia = t.singerManager.getAllSingers().find(s => s.name === 'Bia');
  t.singerManager.addSongToSinger(bia.id, false, song(win, 'Bia - Musica3.zip')); await flush();
  assert.equal($('stage').querySelector('.ticker-text').firstChild, node);
});
test('renomear cantor atualiza a barra; sair do Modo Show tira o trecho', async () => { /* renomeia Bia→Beatriz, confere o texto; desliga o Modo Show pelo fluxo do app, confere a barra escondida (sem textos) */ });
test('localStorage corrompido ou quantidade 9 cai nos padrões/limite', async () => {
  const a = await createApp({ localStorage: { 'playkaraoke-ticker-settings-v1': '{lixo' } });
  assert.equal(a.$('ticker-upcoming-count').value, '3');
  const b = await createApp({ localStorage: { 'playkaraoke-ticker-settings-v1': JSON.stringify({ upcomingCount: 9 }) } });
  assert.equal(b.$('ticker-upcoming-count').value, '5');
});
```
(`text($)` = `$('stage').querySelector('.ticker-text').textContent`; `setCount` define o valor do select e dispara `change`. O idioma padrão nos testes deve ser pt; se for en, defina `localStorage` de idioma como os outros testes fazem.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test tests/ticker-app.test.mjs`
Expected: FAIL nos testes novos

- [ ] **Step 3: Implementar**

Em `refreshTicker`, `upcoming = singerModeEnabled ? singerManager.getUpcomingSingers(count).map(s => ({ position: getSingerPosition(s.id), name: s.name })) : []`, com labels de `window.i18n.t('ticker_label_one'|'ticker_label_many')`. Chamar `refreshTicker()` no fim do `onChange` do `singerManager`, ao ligar e desligar o Modo Show, e no `onLanguageChange`. Restaurar com clamp de 1 a 5 e os padrões em qualquer campo inválido. Não reiniciar a animação à toa já é garantido pela comparação de estado do `createTicker` (Task 1).

- [ ] **Step 4: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS em tudo

- [ ] **Step 5: Commit**

```bash
git add js/app.js tests/ticker-app.test.mjs
git commit -m "feat: barra de avisos mostra os próximos cantores (1 a 5)"
```

---

### Task 4: Barra na segunda tela

**Files:**
- Modify: `second-screen.html` (`<script src="js/ticker.js?v=3.2.0">` antes de `second-screen.js`)
- Modify: `js/second-screen.js` (novo `case 'ticker'` no switch, ~linha 247)
- Modify: `js/app.js` (`refreshTicker` também chama `broadcastToSecondScreen({ type: 'ticker', state })` quando o estado muda; `sendCurrentStateToSecondScreen` ~2146 envia o estado atual)
- Modify: `tests/second-screen.test.mjs` (o `setup()` avalia `js/ticker.js` antes de `second-screen.js`)
- Test: `tests/second-screen.test.mjs`, `tests/ticker-app.test.mjs`

**Interfaces:**
- Consumes: `getTickerState()` (Task 2), `window.createTicker` (Task 1)
- Produces: a mensagem `{ type: 'ticker', state: {on,segments,bg,size,speed} }`

- [ ] **Step 1: Escrever os testes que falham**

```js
// second-screen.test.mjs
test('mensagem ticker mostra e esconde a barra', () => {
  const { win, send } = setup();
  send({ type: 'ticker', state: { on: true, segments: [{ color: '#ffffff', parts: [{ text: 'Oi', bold: false }] }], bg: '#000000', size: 'medium', speed: 5 } });
  assert.equal(win.document.querySelector('.ticker-text').textContent, 'Oi');
  send({ type: 'ticker', state: { on: false, segments: [{ color: '#ffffff', parts: [{ text: 'Oi', bold: false }] }], bg: '#000000', size: 'medium', speed: 5 } });
  assert.ok(win.document.querySelector('.ticker').classList.contains('hidden'));
});
// ticker-app.test.mjs: com a segunda tela aberta (seguir o que os testes existentes fazem para abrir/simular a janela e capturar postMessage),
// ligar a barra envia { type: 'ticker' }; uma mensagem 'ready' depois faz reenviar o estado atual; o mesmo estado não é reenviado duas vezes.
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL nos testes novos

- [ ] **Step 3: Implementar**

Na segunda tela, `createTicker(document.body)` é criado uma vez e o `case 'ticker'` chama `ticker.update(msg.state)`. No `app.js`, o broadcast fica dentro de `refreshTicker`, só quando o JSON do estado mudou. `sendCurrentStateToSecondScreen` envia sempre, sem a comparação.

- [ ] **Step 4: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS em tudo

- [ ] **Step 5: Commit**

```bash
git add second-screen.html js/second-screen.js js/app.js tests/second-screen.test.mjs tests/ticker-app.test.mjs
git commit -m "feat: barra de avisos na segunda tela"
```

---

### Task 5: Pílulas do topo viram ícones (mais espaço para a busca)

**Files:**
- Modify: `index.html` (CSS `.pill`/`.pills`, ~linhas 154–166; markup das 5 pílulas, ~linha 531)
- Modify: `tests/ticker-app.test.mjs` (ou o `ui.test.mjs` existente, se já houver teste de pílulas lá)

**Interfaces:**
- Consumes: os IDs de pílula existentes (`quick-second-screen-btn`, `quick-autoplay-btn`, `quick-applause-btn`, `quick-ambient-btn`) e `quick-ticker-btn` (Task 2). IDs, a classe `on` e o JS **não mudam**.

Decisões:
- **Ordem no topo:** logo → busca → pílulas na ordem **Segunda tela, Avisos, Autoplay, Ambiente, Aplausos** → `#show-mode-btn` → `#settings-btn`. Hoje a engrenagem vem antes do Modo Show: trocar os dois de lugar no markup.
- Cada pílula vira um botão redondo de 32×32 com um SVG inline de 18 px (`fill="none" stroke="currentColor"`). O `<span>` de texto e o `.dot` saem.
- Ícones (SVG, nunca emoji) no estilo de `PlayKaraoke Studio/propostas-ui-ux/plk2027-barra-superior/icones-escolhidos/` (viewBox 24, `stroke-width="1.65"`, pontas e junções arredondadas, formas geométricas simples). Aplausos = `plateia.svg` dessa pasta, copiado inline. Os outros são desenhados no mesmo estilo: Segunda tela = monitor com pé; Avisos = megafone (não o `aviso.svg`, que é triângulo de alerta e lembra erro); Autoplay = play com seta circular; Ambiente = nota musical.
- Ligado: o `.pill.on` de hoje (fundo `var(--grad)`, ícone branco). Desligado: ícone `var(--text-3)`.
- Nome ao passar o mouse: dica própria em CSS, sem JS, aparecendo depois de 300 ms abaixo do botão. Lê o texto de `aria-label` (`.pill::after{content:attr(aria-label)}`, com `transition-delay:.3s`, só `opacity`). O `aria-label` vem do i18n: trocar `data-i18n-title` por um atributo equivalente que preencha `aria-label` (adicionar suporte a `data-i18n-aria` no `applyTranslations` de `js/i18n.js`, se não existir) e tirar o `title`, para não aparecerem duas dicas. As chaves usadas são as de hoje (`pill_second_screen`, `pill_autoplay`, `pill_applause`, `pill_ambient`, `pill_ticker`).
- A sombra do `.pill.on` fica como está (é estática, não anima).

- [ ] **Step 1: Escrever o teste que falha**

```js
test('pílulas são só ícone, com nome acessível traduzido', async () => {
  const { $ } = await createApp();
  for (const id of ['quick-second-screen-btn', 'quick-autoplay-btn', 'quick-applause-btn', 'quick-ambient-btn', 'quick-ticker-btn']) {
    const b = $(id);
    assert.ok(b.querySelector('svg'), id + ' sem ícone');
    assert.equal(b.textContent.trim(), '', id + ' ainda tem texto visível');
    assert.ok(b.getAttribute('aria-label'), id + ' sem aria-label');
    assert.equal(b.getAttribute('title'), null, id + ' com title (dica dupla)');
  }
  const order = Array.from($('quick-ticker-btn').closest('header').querySelectorAll('.pill, #show-mode-btn, #settings-btn'), e => e.id);
  assert.deepEqual(order, ['quick-second-screen-btn', 'quick-ticker-btn', 'quick-autoplay-btn', 'quick-ambient-btn', 'quick-applause-btn', 'show-mode-btn', 'settings-btn']);
  assert.equal($('quick-ticker-btn').getAttribute('aria-label'), 'Avisos'); // idioma pt nos testes; ajustar se o padrão for en
});
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `node --test tests/ticker-app.test.mjs` · Expected: FAIL

- [ ] **Step 3: Implementar** markup, CSS e o `data-i18n-aria`

- [ ] **Step 4: Rodar a suíte** — Run: `npm test` · Expected: PASS em tudo. Se algum teste antigo procurava o texto da pílula, trocar para `aria-label`.

- [ ] **Step 5: Commit**

```bash
git add index.html js/i18n.js tests/
git commit -m "feat: pílulas do topo como ícones com dica ao passar o mouse"
```

---

### Task 6: Versão 3.2.0, manual e conferência no navegador

**Files:**
- Modify: `index.html`, `second-screen.html` (todos os `?v=3.1.1` → `?v=3.2.0`; `#version-tag`; `.about-foot`)
- Modify: `docs/USER_MANUAL.md`, `help.html` (seção curta "Barra de avisos": pílula, aba, itens, quantidade 1–5, cores, `*negrito*`; e atualizar as menções às pílulas, que agora são ícones)

- [ ] **Step 1: Trocar a versão**

Run: `grep -rn "3\.1\.1" index.html second-screen.html js/`
Expected: nenhuma ocorrência depois da troca

- [ ] **Step 2: Escrever a seção do manual e da ajuda** (pt, no tom das seções vizinhas)

- [ ] **Step 3: Rodar a suíte**

Run: `npm test`
Expected: PASS em tudo

- [ ] **Step 4: Conferir no navegador** (Playwright, servindo a pasta com `npx http-server` ou `python3 -m http.server`)

Abrir `index.html`, ligar Avisos, preencher os textos e iniciar um Modo Show com 3 cantores. Conferir que o texto passa no rodapé do palco, que as pílulas são ícones com a dica aparecendo ao passar o mouse, que a cor e o tamanho mudam ao vivo, e que a segunda tela mostra a mesma barra. Tirar screenshot para o Jorge.

- [ ] **Step 5: Commit**

```bash
git add index.html second-screen.html docs/USER_MANUAL.md help.html
git commit -m "v3.2.0: barra de avisos no rodapé"
```
