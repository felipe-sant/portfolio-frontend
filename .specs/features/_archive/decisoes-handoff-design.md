# decisoes-handoff-design

> Status: `implementada`
> Encerrada em: `2026-10-11`
> Commits: `2746440..79df886` · PR: [#18](https://github.com/felipe-sant/portfolio-frontend/pull/18) e [#19](https://github.com/felipe-sant/portfolio-frontend/pull/19) · Issue: [#12](https://github.com/felipe-sant/portfolio-frontend/issues/12) e [#17](https://github.com/felipe-sant/portfolio-frontend/issues/17)

## O que foi pedido

O handoff de design deixava pontos em aberto e se contradizia entre o `README.md` e o `design-system.md`. As pendências estavam espalhadas, sem opção, decisão nem data, e cada issue de tela repetia a pergunta por conta própria. O PO resolveu a maior parte num protótipo navegável.

## O que foi feito

Criou `docs/design/decisions.md`, com uma linha por decisão (D01 a D25 no começo) e as pendências de implementação PI1 a PI5, cada uma com contexto, opções, decisão, data, fonte, onde aplicar e issues. Versionou o protótipo em `docs/design/prototype/`, que abre pelo dev server e usa as fontes self-hospedadas. Atualizou `design-system.md`, `docs/README.md`, `overview.md`, `architecture/frontend.md` e o `CLAUDE.md`. O PR #19 enxugou o `CLAUDE.md` e renomeou a R3 para a nova precedência de design.

## Notas

A tabela de decisões continuou crescendo depois (D56 em diante); esta spec cobre só a primeira leva.
