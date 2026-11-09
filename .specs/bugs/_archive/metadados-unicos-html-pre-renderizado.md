# metadados-unicos-html-pre-renderizado

> Status: `resolvida`
> Encerrada em: `2026-11-09`
> Commits: `752144a..edda74b` · PR: `—` · Issue: `#142`

## O que foi pedido

Garantir que o HTML pré-renderizado de Início, Projetos e Informações não tenha `<title>` nem `<meta name="description">` duplicados (achado C-09).

## O que foi feito

A conferência não achou duplicação: o `PageMeta` não emite título nem descrição e o `composePage` remove os do `index.html`. Os 67 HTML de `dist/` (fora o `index.html` raiz) têm um só de cada. Nenhum código de produção mudou. Foi acrescentado um teste de regressão em `entry-server.test.tsx` e `entry-server.project.test.tsx`, que compõe o HTML final com o `index.html` real (helper `composeFinalHtml` em `src/testUtils/`) e conta as tags. A prova de discriminação foi feita por mutação desfeita: um `<title>` ou uma `<meta name="description">` extra no `PageMeta` derrubou 21 testes em cada caso.

## Notas

Se surgir duplicação no futuro, o responsável único é a página, não o `PageMeta`. O `dist/index.html` raiz ficou fora do teste, por decisão do PO.
