/**
 * Tick Worker — gera um "pulso" (tick) em intervalo fixo, rodando numa
 * thread totalmente separada da thread principal da página.
 *
 * Por quê isso existe: o Chrome (e outros navegadores) desaceleram
 * temporizadores (setInterval/setTimeout/requestAnimationFrame) da aba
 * principal quando ela não está em primeiro plano — seja porque o
 * usuário trocou de aba, seja porque deu foco em outra janela (como a
 * "segunda tela" em modo tela cheia). Isso fazia a letra do CDG parecer
 * "travada", já que o cronômetro que orquestra tanto o desenho da letra
 * quanto o envio de tempo pra segunda tela ficava andando bem mais devagar.
 *
 * Web Workers rodam numa thread de execução verdadeiramente separada, e
 * essa política de desaceleração do navegador não se aplica a eles — o
 * timer aqui dentro continua rodando na taxa normal não importa se a
 * aba está em primeiro ou segundo plano.
 */

let intervalId = null;

self.onmessage = (e) => {
  const { command, intervalMs } = e.data;

  if (command === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage('tick');
    }, intervalMs || 16);
  } else if (command === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
