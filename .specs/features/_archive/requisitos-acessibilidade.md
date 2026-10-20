# requisitos-acessibilidade

> Status: `implementada`
> Encerrada em: `2026-10-11`
> Commits: `997947c..b1e64ea` · PR: [#22](https://github.com/felipe-sant/portfolio-frontend/pull/22) · Issue: [#9](https://github.com/felipe-sant/portfolio-frontend/issues/9)

## O que foi pedido

A acessibilidade estava espalhada em três lugares e não formava um requisito: o `design-system.md` listava o que o handoff resolveu sem meta de conformidade nem método, e as decisões soltas (D01, D07, D12, D23, D25, PI1 a PI3) não estavam amarradas numa regra única. Os marcos M1, M3 e M5 esperavam o documento.

## O que foi feito

Criou `docs/product/accessibility.md`, com a meta (WCAG 2.2 AA), o método de verificação, o estado atual, as regras por tema e a checklist por tela com IDs `A11Y-...`. A seção de HTML semântico e nomes acessíveis é a dona das regras de landmarks, headings, nomes e texto alternativo. As respostas do PO viraram `D27` (cor do contorno de foco por `--focus-ring`) e `D28` (botão de pausa na faixa de stack), entre outras.
