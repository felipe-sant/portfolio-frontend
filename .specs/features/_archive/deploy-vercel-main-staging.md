# deploy-vercel-main-staging

> Status: `implementada`
> Encerrada em: `2026-10-13`
> Commits: `3b2c036..5419823` · PR: [#76](https://github.com/felipe-sant/portfolio-frontend/pull/76) e [#16](https://github.com/felipe-sant/portfolio-frontend/pull/16) · Issue: [#15](https://github.com/felipe-sant/portfolio-frontend/issues/15)

## O que foi pedido

A aplicação só tinha CI: não havia hospedagem nem pipeline de publicação, e o CI não rodava em push na `staging`. O PO decidiu usar a Vercel para o ambiente de testes e para produção pessoal.

## O que foi feito

Todo push na `staging` publica no ambiente de testes e todo push na `main` publica em produção, na Vercel, só depois de build, lint e testes passarem. O deploy fica em GitHub Actions (`vercel pull`, `build`, `deploy --prebuilt`) acionado por `workflow_run` depois do CI, em vez da integração Git nativa, para a falha do CI barrar a publicação. A `staging` sai com `X-Robots-Tag: noindex` acrescentado ao `vercel.json` em tempo de deploy, e as rotas internas recarregam por rewrite para `/index.html`. A decisão está em ADR e em `docs/setup/environments.md`. O PR #16 definiu `staging` como base do desenvolvimento e `main` como produção.

## Notas

Fora do escopo: domínio próprio, GitHub Pages da Fatec (#45, #63), canônica e `robots.txt` (#52, #51) e Changesets (#47). O `spec.md` ficou com Status `aprovada`, embora o trabalho tenha sido mergeado.
