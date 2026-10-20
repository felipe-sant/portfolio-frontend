# build-github-pages-fatec

> Status: `implementada`
> Encerrada em: `2026-10-20`
> Commits: `0fc4d56..6263c71` · PR: `—` · Issue: `#45`

## O que foi pedido

Preparar o build da v1 para o GitHub Pages da Fatec, que serve o site num subcaminho (`/ra2581392423047/`), com fallback de SPA, `.nojekyll` e um workflow de ensaio que gera o artefato sem publicar.

## O que foi feito

- `vite.config.ts` lê `BASE_PATH` (sem `VITE_`) por `scripts/resolveBase.ts`, que normaliza o valor e rejeita `//`, `..`, espaço, `?` e `#`. Sem a variável o `base` continua `/`.
- `npm run build:fatec` e `npm run preview:fatec` (`scripts/buildFatec.ts`, `scripts/previewFatec.ts`) usam a constante de `scripts/fatecBasePath.ts`; `prepareFatecArtifact` falha sem o base no `index.html`, copia-o para `404.html` e cria `.nojekyll`.
- Workflow `fatec-pages.yml` (`workflow_call` e `workflow_dispatch`, entrada `tag`): build, lint, `test:cov`, `build:fatec` e upload do artefato `fatec-pages` (com `include-hidden-files`). Só `tag` `v1.x.y` vira `is-release`; não há publicação (fica na #63).
- Alias `@scripts/*` em `tsconfig.node.json` e `resolve.alias`, porque o lint proíbe `../` nos testes de `scripts/test/`; `vite.config.ts` importa `resolveBase.ts` com extensão (`allowImportingTsExtensions`) para o loader nativo do Vite.
- Teste do `Router` fixa que o `basename` acompanha `BASE_URL`. Docs e `CLAUDE.md` atualizados.
- Verificado localmente: `dist` e CSS da Fatec sem caminho sem prefixo; preview serve rotas, fontes, `favicon.svg` e `content/` com 200.

## Notas

- Falta o disparo manual do `workflow_dispatch` no GitHub para conferir o artefato (`404.html`, `.nojekyll`).
- A suíte completa tem timeouts intermitentes sob carga, também na `staging`.
