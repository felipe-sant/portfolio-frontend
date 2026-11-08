# atualiza-readme-v1-2-0

> Status: `implementada`
> Encerrada em: `2026-11-08`
> Commits: `691316a..HEAD` · PR: `—` · Issue: `#147`

## O que foi pedido

Atualizar o README, que contradizia o produto da v1.2.0: só a rota `/`, dados mock e tema desatualizados, linha de `og:image` solta, stack e comandos incompletos e `VITE_SITE_URL` sem aviso.

## O que foi feito

O README passou a descrever as cinco telas com o prefixo de idioma, a página de erro e a não encontrada. R1 diz "sem backend na v1", o tema descreve `[data-theme="dark"]` e `data-motion`, e o conteúdo é dito traduzido para `en` e `es`, depois de conferido em `public/content/`. A linha de `og:image` entrou na tabela de comandos, que ganhou `build:fatec:form`, `test:e2e`, `check:chunk` e `changeset`. A stack ganhou Playwright com axe, `react-markdown`, `pdfjs-dist` e Changesets. O "Como rodar" avisa que `npm run build` exige `VITE_SITE_URL` (só a origem) e que `.specs/` existe no clone com só `_template/` e `_archive/` versionados. O README cita só "v1", sem o número da versão, por decisão do PO.

## Notas

A #148 reestrutura o README em seguida e move parte deste conteúdo para `docs/`.
