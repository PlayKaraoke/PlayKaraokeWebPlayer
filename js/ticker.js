/**
 * Barra de avisos (letreiro no rodapé), usada pelo player e pela segunda tela.
 * Leve de propósito (roda no notebook de referência, Intel HD 1ª geração):
 * só `transform` animado em CSS, nada de blur, nada de loop em JS; o DOM só
 * é remontado quando o estado muda de verdade.
 */
(function () {
  const SEP = '   |   ';
  const SIZE_K = { small: 0.03, medium: 0.045, large: 0.06 };

  /** `*palavra*` vira negrito; asterisco solto ou sem par fica como está. */
  function parseTickerBold(str) {
    const parts = [];
    const re = /\*(\S(?:[^*]*\S)?)\*/g;
    let last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) parts.push({ text: str.slice(last, m.index), bold: false });
      parts.push({ text: m[1], bold: true });
      last = re.lastIndex;
    }
    if (last < str.length) parts.push({ text: str.slice(last), bold: false });
    return parts;
  }

  function buildTickerSegments(o) {
    const segs = [];
    if (o.upcomingOn && o.upcoming && o.upcoming.length) {
      const names = o.upcoming.map(s => (s.position != null ? s.position + ' ' : '') + s.name).join(' · ');
      segs.push({ color: o.upcomingColor, parts: [
        { text: o.upcoming.length === 1 ? o.labelOne : o.labelMany, bold: true },
        { text: ' ' + names, bold: false },
      ] });
    }
    for (const [on, text, color] of [[o.text1On, o.text1, o.text1Color], [o.text2On, o.text2, o.text2Color]]) {
      const t = (text || '').trim();
      if (on && t) segs.push({ color, parts: parseTickerBold(t) });
    }
    return segs;
  }

  function injectStyle(doc) {
    if (doc.getElementById('ticker-style')) return;
    const style = doc.createElement('style');
    style.id = 'ticker-style';
    style.textContent = `
.ticker{position:absolute;left:0;right:0;bottom:0;z-index:6;overflow:hidden;pointer-events:none;background:var(--tk-bg);font:500 var(--tk-size)/1.6 'Inter',sans-serif;white-space:nowrap;contain:layout paint}
.ticker b{font-weight:700}
.ticker .tk-sep{opacity:.5;white-space:pre}
.ticker.hidden{display:none}
.ticker-text{display:inline-block;padding-left:100%;will-change:transform}
.ticker.run .ticker-text{animation:tk-scroll var(--tk-dur) linear infinite}
@keyframes tk-scroll{from{transform:translateX(0)}to{transform:translateX(-100%)}}
@media (prefers-reduced-motion:reduce){.ticker.run .ticker-text{animation:none;padding-left:16px}}`;
    doc.head.appendChild(style);
  }

  function createTicker(hostEl) {
    const doc = hostEl.ownerDocument;
    injectStyle(doc);
    const bar = doc.createElement('div');
    bar.className = 'ticker hidden';
    const textEl = doc.createElement('span');
    textEl.className = 'ticker-text';
    bar.appendChild(textEl);
    hostEl.appendChild(bar);

    let lastKey = null, state = null, resizeQueued = false;

    // Tamanho e duração medidos uma vez por mudança (ou por resize), nunca por quadro.
    function layout() {
      const fontPx = Math.max(12, hostEl.clientHeight * (SIZE_K[state.size] || SIZE_K.medium));
      bar.style.setProperty('--tk-size', fontPx + 'px');
      const hostW = hostEl.clientWidth;
      const speedPx = hostW * (Number(state.speed) || 5) * 0.02;
      // padding-left:100% + translateX(-100%): a distância é a largura toda do span.
      const dur = speedPx > 0 ? textEl.offsetWidth / speedPx : 0;
      bar.style.setProperty('--tk-dur', Math.max(5, dur) + 's');
    }

    const win = doc.defaultView;
    if (win) win.addEventListener('resize', () => {
      if (resizeQueued || !state || bar.classList.contains('hidden')) return;
      resizeQueued = true;
      win.requestAnimationFrame(() => { resizeQueued = false; layout(); });
    });

    function update(next) {
      const key = JSON.stringify(next);
      if (key === lastKey) return;
      lastKey = key;
      state = next;
      if (!next.on || !next.segments || !next.segments.length) {
        bar.classList.add('hidden');
        bar.classList.remove('run');
        return;
      }
      bar.dataset.size = next.size;
      bar.style.setProperty('--tk-bg', next.bg);
      textEl.textContent = '';
      next.segments.forEach((seg, i) => {
        if (i > 0) {
          const sep = doc.createElement('span');
          sep.className = 'tk-sep';
          sep.style.color = next.segments[i - 1].color;
          sep.textContent = SEP;
          textEl.appendChild(sep);
        }
        const span = doc.createElement('span');
        span.style.color = seg.color;
        for (const p of seg.parts) {
          if (p.bold) { const b = doc.createElement('b'); b.textContent = p.text; span.appendChild(b); }
          else span.appendChild(doc.createTextNode(p.text));
        }
        textEl.appendChild(span);
      });
      bar.classList.remove('hidden');
      bar.classList.remove('run');
      layout(); // lê offsetWidth: também força o reflow que reinicia a animação
      bar.classList.add('run');
    }

    return { update };
  }

  window.parseTickerBold = parseTickerBold;
  window.buildTickerSegments = buildTickerSegments;
  window.createTicker = createTicker;
})();
