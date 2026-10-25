# rodape-pagina-nao-encontrada-erro-metadados

> Status: `implementada`
> Encerrada em: `2026-10-24`
> Commits: `origin/staging..feat/60-rodape-pagina-nao-encontrada-erro-metadados` · PR: ver PR da branch · Issue: https://github.com/felipe-sant/portfolio-frontend/issues/60

## O que foi pedido

Segunda parte do layout compartilhado: rodapé (padrão e de navegação em `/contact`), página não encontrada completa, página de erro sem mensagem técnica e metadados por página.

## O que foi feito

- `Footer` com duas variantes, lendo o perfil por `profileApi` sem skeleton nem erro; `CopyEmailButton` com `useCopyToClipboard`; `ButtonLink`; ícone `copy`; ano do rodapé por `getBuildYear` (`__BUILD_YEAR__` no `define` do Vite, liberado no `no-underscore-dangle` do oxlint).
- "Currículo em PDF" é botão `disabled` até a #54 (decisão Q1 do PO).
- Página de erro com moldura própria (`SkipLink`, `Header`, `main`, `Footer`), sem `useRouteError`; recarregar usa `reloadPage`, porque o jsdom não deixa stubar `window.location.reload`.
- Não encontrada e erro com `noindex`; namespace `mainLayout` removido.

## Notas

- `RF-LAY-27` e a nota de `mainLayout` em `docs/screens/layout.md` ficam desatualizados até o PO ou a #54 ajustarem.
- Validação visual manual (larguras, temas, teclado, leitor de tela) não foi feita pelo executor.
- Suíte intermitente sob carga (timeouts de `findBy` em Router, MainLayout, Header); passou limpa em execuções isoladas.
