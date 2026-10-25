# adr-pre-renderizacao-spike

> Status: `implementada`
> Encerrada em: `2026-10-24`
> Commits: `10f8211..6c99f34` (spike, sem PR) e ADR no PR · PR: [#88](https://github.com/felipe-sant/portfolio-frontend/pull/88) · Issue: [#64](https://github.com/felipe-sant/portfolio-frontend/issues/64)

## O que foi pedido

Descobrir, antes da #49, se a pré-renderização por script próprio (opção 1) serve com o `base` do Pages, o idioma no caminho, as páginas `lazy` e a hidratação, e registrar a decisão em ADR.

## O que foi feito

Um spike descartável na branch `spike/64-prerender` (commit `6c99f34`, nunca mergeado) provou a opção 1: HTML com `<h1>` legível sem JavaScript nos três idiomas e no `404.html`, hidratação sem erro e teste no GitHub Pages real (branch `gh-pages-spike`, feito pelo PO). O ADR `docs/adr/0004-prerendering.md` registra a escolha, a tabela do roteiro, os limites (guarda no `i18n.ts`, consultas do RTK Query no servidor, `progressiveChunkSize`, `404.html` servido em qualquer URL) e o plano da #49. A URL de documento com extensão funciona no Pages com `<nome>.md.html`, então o D55 não muda.

## Notas

O console do navegador no Pages real foi conferido à mão pelo PO, sem relato de erro. O PO desliga o Pages e remove a branch `gh-pages-spike`.
