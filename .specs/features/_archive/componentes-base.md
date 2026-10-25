# componentes-base

> Status: `implementada`
> Encerrada em: `2026-10-20`
> Commits: `1b4b368..315cf02` · PR: [#80](https://github.com/felipe-sant/portfolio-frontend/pull/80) · Issue: [#32](https://github.com/felipe-sant/portfolio-frontend/issues/32)

## O que foi pedido

As telas da v1 precisavam de componentes base reutilizáveis (botão, chip, campo, busca, skeleton, spinner) e dos ícones, feitos a partir do protótipo e das decisões de design.

## O que foi feito

Criou `Button`, `Chip`, `TextField`, `SearchInput`, `Skeleton`, `Spinner`, `VisuallyHidden` e `Icon` (19 ícones inline, sem `lucide-react`), cada um com CSS Module e teste com `expectNoAxeViolations`. Adicionou o token `--border-control` (D29) e a chave `searchInput.clear` em `common`. `TextField` ganhou asterisco de obrigatório, `reserveMessageSpace` e `focusOnError` (hook `useFocusOnError`); o primário do `Button` escurece no hover com `--brand-hover-brightness` e o `background-origin` corrige a linha de outra cor na borda (D56).

## Notas

O `test:cov` pode dar timeout em máquina sobrecarregada; com `--maxWorkers=2` passa inteiro. `IconButton` ficou com a #33, `ButtonLink` com uma issue futura e os ícones de pausa e play com a #34. Os `role="status"` são escritos `role={"status"}` por causa de `jsx-a11y/prefer-tag-over-role`.
