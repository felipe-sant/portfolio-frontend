# cabecalho-rolagem-horizontal-640-695

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `branch fix/107-cabecalho-rolagem-horizontal` · PR: `—` · Issue: `#107`

## O que foi pedido

Entre 640px e cerca de 695px de largura o cabeçalho completo era mais largo que a janela e a página ganhava rolagem horizontal em todas as telas (WCAG 1.4.10 e 1.4.4).

## O que foi feito

O limite em que o cabeçalho troca do botão "Menu" para a navegação completa subiu de 640px para 720px, no CSS de `header.module.css` e em `DESKTOP_QUERY` de `useMobileMenu`, que precisam concordar (RF-LAY-05, RF-LAY-08). O PO pediu 700px subindo se `en` ou `es` ainda estourassem; a medição mostrou 712px de conteúdo em `es` a 700px, então o valor final é 720px (folga de 8px). Registrado como `D67` em `docs/design/decisions.md` e em `docs/screens/layout.md`. Os E2E cobrem a faixa de 640px a 720px, a varredura de 320px a 1280px nos três idiomas e o fechamento do painel ao alargar a janela; o teste do modal de Informações passou a conferir a rolagem também em 640px. O nome do site em `nowrap` ficou fora.

## Notas

Os demais pontos de 640px (grade, modal etc.) não mudaram. Specs E2E de outras telas que usam `DESKTOP_MIN_WIDTH = 640` só rodam em 390px e 1280px, então não foram alterados.
