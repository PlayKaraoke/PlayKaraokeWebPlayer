/**
 * Pitch Shifter Processor — roda na thread de áudio dedicada (AudioWorklet),
 * separada da thread principal que desenha a tela. Implementação própria,
 * sem depender de biblioteca de terceiros.
 *
 * Técnica: "delay-line com dois grãos cruzados" (também conhecida como
 * "Jungle pitch shift"). É uma técnica clássica e bem documentada:
 *
 *   - Mantemos um buffer circular ("delay buffer") com o áudio recente.
 *   - Lemos esse buffer em DOIS pontos diferentes ("grãos"), cada um se
 *     afastando do ponto de escrita numa velocidade proporcional ao
 *     quanto queremos mudar o tom. Ler mais rápido que escreve = tom mais
 *     agudo; mais devagar = tom mais grave.
 *   - Cada grão eventualmente precisa "pular" de volta (senão ele leria
 *     áudio que ainda não foi escrito, ou ficaria pra trás demais). Esse
 *     pulo causaria um "clique" audível — por isso usamos DOIS grãos
 *     defasados: enquanto um pula, o outro está no meio do seu ciclo (sem
 *     pular), e uma janela triangular de volume cruza suavemente entre os
 *     dois, escondendo o pulo.
 *
 * Matemática (verificada analiticamente, não só "por ouvido"):
 *   Se a "distância" de leitura d(t) diminui à taxa (pitchRatio - 1) por
 *   amostra, a posição de leitura resultante avança à taxa exata de
 *   pitchRatio amostras por amostra — ou seja, o áudio é lido pitchRatio
 *   vezes mais rápido (ou mais devagar), mudando o tom, sem que a duração
 *   total da reprodução mude (porque isso é um efeito em tempo real sobre
 *   um fluxo contínuo, não uma alteração da velocidade de leitura do
 *   arquivo original).
 */

class PitchShifterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'pitchRatio',
        defaultValue: 1,
        minValue: 0.4,
        maxValue: 2.5,
        automationRate: 'k-rate',
      },
    ];
  }

  constructor() {
    super();
    this.grainSize = 2048;       // ~46ms a 44.1kHz — tamanho de cada "grão"
    this.bufferSize = this.grainSize * 2;
    this.delayBuffers = [
      new Float32Array(this.bufferSize),
      new Float32Array(this.bufferSize),
    ];
    this.writeIndex = 0;
    this.d1 = 0;
    this.d2 = this.grainSize / 2; // segundo grão defasado meio ciclo do primeiro
  }

  _window(d) {
    // Janela triangular: 0 nas bordas (onde o grão "pula"), 1 no meio.
    const x = d / this.grainSize;
    return 1 - Math.abs(x - 0.5) * 2;
  }

  _readInterpolated(buf, writeIndex, delayAmount) {
    const bufferSize = this.bufferSize;
    let readPos = writeIndex - delayAmount;
    while (readPos < 0) readPos += bufferSize;
    while (readPos >= bufferSize) readPos -= bufferSize;
    const i0 = Math.floor(readPos);
    const i1 = (i0 + 1) % bufferSize;
    const frac = readPos - i0;
    return buf[i0] * (1 - frac) + buf[i1] * frac;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true; // sem áudio chegando ainda; mantém o processor vivo
    }

    const pitchRatio = parameters.pitchRatio[0];
    const numChannels = Math.min(output.length, 2);
    // Rede de segurança pra áudio mono (o node já força entrada estéreo via
    // channelCountMode 'explicit', mas se chegar 1 canal, duplica pros dois
    // lados em vez de deixar o direito mudo).
    const inputs2 = [input[0], input[1] || input[0]];
    const blockSize = input[0].length;
    const passthrough = Math.abs(pitchRatio - 1) < 0.001;

    let wi = this.writeIndex;
    let d1 = this.d1;
    let d2 = this.d2;

    for (let i = 0; i < blockSize; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        this.delayBuffers[ch][wi] = inputs2[ch][i];
      }

      if (passthrough) {
        for (let ch = 0; ch < numChannels; ch++) {
          output[ch][i] = inputs2[ch][i];
        }
      } else {
        d1 -= (pitchRatio - 1);
        d2 -= (pitchRatio - 1);
        if (d1 < 0) d1 += this.grainSize;
        else if (d1 >= this.grainSize) d1 -= this.grainSize;
        if (d2 < 0) d2 += this.grainSize;
        else if (d2 >= this.grainSize) d2 -= this.grainSize;

        const w1 = this._window(d1);
        const w2 = this._window(d2);
        const wsum = w1 + w2;

        for (let ch = 0; ch < numChannels; ch++) {
          const buf = this.delayBuffers[ch];
          const read1 = this._readInterpolated(buf, wi, d1);
          const read2 = this._readInterpolated(buf, wi, d2);
          output[ch][i] = wsum > 0.0001 ? (read1 * w1 + read2 * w2) / wsum : 0;
        }
      }

      wi = (wi + 1) % this.bufferSize;
    }

    this.writeIndex = wi;
    this.d1 = d1;
    this.d2 = d2;

    return true; // mantém o processor vivo pro próximo bloco de áudio
  }
}

registerProcessor('pitch-shifter-processor', PitchShifterProcessor);
