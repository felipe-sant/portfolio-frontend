# teste-acessibilidade-e2e-playwright

> Status: `implementada`
> Encerrada em: `2026-10-24`
> Commits: `origin/staging..feat/55-teste-acessibilidade-e2e-playwright` · PR: `https://github.com/felipe-sant/portfolio-frontend/pull/92` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/55`

## O que foi pedido

Uma suíte ponta a ponta com Playwright e axe, no CI, que cobre o que o `jsdom` não vê: contraste real, teclado, foco preso e foco sob o cabeçalho fixo.

## O que foi feito

- `e2e/` com `.spec.ts`, fora do Vitest e da cobertura, contra `npm run preview:fatec` (build do Pages) em quatro projetos Chromium: 390 e 1280px, claro e escuro via `colorScheme`.
- Axe com todas as regras (`color-contrast` ligada) em `/pt-BR` e numa rota inexistente; roteiros de pular para o conteúdo, menu mobile (foco preso, Esc, foco devolvido) e foco nunca sob o cabeçalho.
- Job `E2E` no `ci.yml`, com relatório do Playwright como artefato em falha. Convenção registrada no `CLAUDE.md` e na skill `vitest-specialist`.
- O axe não apontou violação no estado atual, então nenhuma tela foi alterada. O skip link fica fora da checagem de foco sob o cabeçalho, porque ele aparece sobre o cabeçalho de propósito.

## Notas

- O axe classifica texto com razão de contraste 1:1 e texto sobre pseudo-elemento como `incomplete`, não como violação: a prova de falha usou `#aaa` no `h1` (falha no tema claro). Itens `incomplete` de contraste (rodapé, cartões com pseudo-elemento) seguem para conferência manual na #41.
- Marcar o job `E2E` como check obrigatório em `staging` e `main` é decisão de configuração do repositório, feita pelo PO.
