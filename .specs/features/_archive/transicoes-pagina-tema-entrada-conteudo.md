# transicoes-pagina-tema-entrada-conteudo

> Status: `implementada`
> Encerrada em: `2026-10-20`
> Commits: `origin/staging..feat/84-transicoes-pagina-tema-entrada-conteudo` · PR: `—` · Issue: `https://github.com/felipe-sant/portfolio-frontend/issues/84`

## O que foi pedido

Acrescentar cinco movimentos curtos, todos desligáveis pelo botão de movimento e por `prefers-reduced-motion`: transição de página, crossfade de tema, feedback de pressão, entrada dos cards ao rolar e skeleton que se dissolve.

## O que foi feito

Tokens `--dur-page`, `--stagger` e `--press-scale` e o CSS global em `global.css`. `usePageTransition` liga `viewTransition` nos links de navegação (cabeçalho, logo, não encontrada e erro; o seletor de idioma fica sem). `startThemeTransition` liga `data-theme-transition` durante a troca de tema. Escala em `:active` em `Button`, `IconButton` e links do cabeçalho. `useReveal` e `SkeletonSwap` entregues como blocos reutilizáveis, com teste. Documentação e `D57` a `D60` registradas.

## Notas

Nenhuma tela usa `useReveal` e `SkeletonSwap` ainda: cada issue de tela os adota. A validação visual de CSS (transição, escala, crossfade) fica no navegador com o PO.
