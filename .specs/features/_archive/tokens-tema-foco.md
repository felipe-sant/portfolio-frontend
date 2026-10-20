# tokens-tema-foco

> Status: `implementada`
> Encerrada em: `2026-10-13`
> Commits: `35ee561..2393049` · PR: [#77](https://github.com/felipe-sant/portfolio-frontend/pull/77) · Issue: [#31](https://github.com/felipe-sant/portfolio-frontend/issues/31)

## O que foi pedido

A base visual do protótipo não estava inteira no código: faltavam os tokens `--surface-chrome`, `--border-chrome` e `--code-*`, o tema escuro só existia por `prefers-color-scheme` sem escolha persistida nem `color-scheme`, e não havia foco visível global.

## O que foi feito

Levou a base visual do protótipo para `global.css`: os tokens que faltavam, `--focus-ring` (D27) e `--header-height`; tema claro e escuro por `data-theme` no `<html>`, com `color-scheme`; foco visível global; `scroll-padding-top`, sublinhado em link de texto corrido e medida de leitura. O hook `useTheme` é a única via de escrita da escolha (`saveTheme`, chave `portfolio-frontend:theme`), e um script inline no `index.html` aplica o tema antes da pintura. Sem componente nem layout.

## Notas

A tarefa T7 (conferir as páginas existentes e sincronizar a documentação) ficou desmarcada no `tasks.md`, e o `spec.md` ficou com Status `em-andamento`, embora o trabalho tenha sido mergeado. O alternador de tema na interface é da #33.
