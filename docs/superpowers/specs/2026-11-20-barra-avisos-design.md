# Barra de avisos (letreiro no rodapé) — design curto

Data: 2026-11-20 · Versão alvo: v3.2.0

## Para quê
Uma barra fina no rodapé da tela de karaokê, com texto passando da direita para a esquerda, para o **público do bar** ler durante o show: quem canta a seguir e avisos da casa (promoção, Instagram).

## O que passa na barra
Três itens, cada um com liga/desliga próprio; os ligados passam em sequência, separados por `|`:

1. **Próximos a cantar** — posição na fila + nome, sem música. Quantidade escolhível de **1 a 5**. Singular com 1 ("Próximo a cantar: 13 Ana"), plural com mais ("Próximos a cantar: 13 Ana · 14 Bruno · 15 Carla"). Fila menor que o escolhido mostra os que houver; sem Modo Show/sem fila, o item some e os textos continuam.
2. **Texto 1** — livre. Ex.: "Promoção: Batata Frita por R$ 39,90".
3. **Texto 2** — livre. Ex.: "Acesse nosso instagram @karaoke_altashoras".

Exemplo: `Próximos a cantar: 13 Ana · 14 Bruno   |   Promoção: Batata Frita por R$ 39,90   |   Acesse nosso instagram @karaoke_altashoras`

- **Cor por item**: cada um dos três itens tem a sua cor de texto.
- **Negrito**: nos textos livres, `*palavra*` sai em negrito. Asterisco sem par fica como está. Nomes de cantores não são interpretados. O rótulo "Próximo(s) a cantar:" sai sempre em negrito (decisão do Claude).
- O separador `|` usa a cor do item anterior, mais apagada.

## Onde aparece e como se liga
- **Botão "Avisos"** na fileira de pílulas do topo (junto de Segunda tela, Autoplay, Aplausos, Ambiente): liga/desliga a barra inteira.
- **Aba "Avisos" nas Configurações**: liga/desliga e cor de cada item, quantidade de cantores (1–5), os dois campos de texto, **cor da barra**, **tamanho da barra (dropdown: Pequeno / Médio / Grande)** e velocidade.
- A barra aparece **só na segunda tela** (decisão do Jorge durante a execução, por desempenho: a tela do operador não desenha nem anima nada). O app só monta o estado e envia pelo BroadcastChannel que já existe.
- **Por cima do vídeo** (escolha do Jorge: barra pequena, testar na prática). Tapa um pouco do rodapé; o tamanho é ajustável na aba.

## Abordagens consideradas
- **A) Barra embaixo, vídeo encolhe** — não tapa a letra, mas cria faixa preta lateral. Não escolhida.
- **B) Barra sobreposta ao vídeo** — escolhida: mais simples, vídeo mantém o tamanho, barra pequena reduz o problema da letra.
- Animação via canvas/JS por quadro — descartada: CSS `transform` roda na GPU sem redesenhar e é o caminho leve.

## Restrições
- Precisa rodar liso no notebook de referência (i3 M 370, Intel HD 1ª geração): só `transform` animado; **sem blur, backdrop-filter ou sombra borrada**.
- Seguir os padrões existentes: pílula como as outras, seção nova em `#settings-nav`, configurações salvas em `localStorage` como `playkaraoke-countdown-settings-v1`, textos da interface em `i18n.js` (en e pt).
- Não mexer em `worker/`.
- A lista de próximos se atualiza sozinha quando a fila muda (reusar `singerManager.getUpcomingSingers(n)` e `getSingerPosition(id)`).

## Desempenho (pedido do Jorge: o mais econômico possível)
- Animação só de `transform` em uma camada (`will-change: transform`, `contain: layout paint` na barra).
- Barra desligada = elemento fora do DOM visível (`display:none`), animação parada.
- Fonte: Inter 500 (normal) e 700 (negrito), que já são carregadas. Nenhum download de fonte a mais.
- Texto do usuário montado com nós de DOM (`textContent` + `<b>`), nunca `innerHTML`.
- Texto remontado só quando algo muda (fila, campos, ligar/desligar), nunca por quadro ou timer.
- Segunda tela recebe uma mensagem por mudança, não fluxo contínuo.

## Fora de escopo
Mais de dois textos, agendamento de avisos, imagens/logos na barra, posição no topo.

## Fica para quem implementar
Valores padrão (cores, tamanho, velocidade), separador visual exato, e o manual/ajuda atualizados.
