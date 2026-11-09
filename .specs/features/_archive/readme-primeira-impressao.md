# readme-primeira-impressao

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `1d7b9c0..HEAD` · PR: `—` · Issue: `#148`

## O que foi pedido

Dar ao README uma primeira impressão (link do site, capturas da Início nos temas claro e escuro, badges) e encurtá-lo, empurrando requisitos, comandos e tabelas longas para `docs/`.

## O que foi feito

O README caiu de 288 para 61 linhas: título, resumo de 3 linhas em inglês, quatro badges (CI nativo do GitHub; versão, licença e Node por shields.io), "Ver o site" (Vercel), o site e o repositório da Fatec, `<picture>` com `prefers-color-scheme`, Sobre o projeto, Stack em uma linha, Como rodar, "Por onde começar a ler `docs/`" e Licença. O conteúdo removido foi transplantado, sem reescrita de mérito, para `docs/setup/development.md` (ambiente, comandos, testes, CI e hooks) e `docs/architecture/code-structure.md` (estrutura de `src/`, dados do conteúdo, internacionalização); o motivo da fonte self-hospedada foi para `docs/design/design-system.md`, e as cinco rotas e R1 a R3 já estavam em `docs/product/overview.md`. `docs/README.md` indexa os dois arquivos novos.

As capturas (`docs/design/assets/readme/home-light.png` e `home-dark.png`, 1280x800, cerca de 70 KB cada) saem de `npm run readme:images` (`scripts/generateReadmeScreenshots.ts`, Chromium do Playwright sobre o `preview:fatec`), regeradas à mão. `scripts/test/readme.test.ts` guarda badges, link do site igual ao `homepage` do `package.json` (campo acrescentado nesta issue), versão do Node igual a `engines.node`, imagens, links e âncoras relativos do README, dos dois arquivos novos e de `docs/README.md`, o limite de 100 linhas e a ordem de "Por onde começar".

Ao mover o conteúdo, os fatos defasados pela #123 foram corrigidos em `development.md`: gatilhos do CI (push em `main`, `staging` e `hotfix/**`; PR só para a `staging`), jobs `E2E scope`, `E2E shard i/4` e `E2E`, e os scripts `test:e2e:timings`, `e2e:rank`, `e2e:flaky` e `e2e:check-shards`.

## Notas

Espaço reservado para a #149 ("Como este projeto é feito") e a #158 (aviso do formulário de Contato): entre o `<picture>` e "Sobre o projeto", por posição e folga de linhas (o teste aceita até 100; o README tem 61), sem seção vazia nem comentário. A #152 ainda precisa alinhar `CONTRIBUTING.md` e `CLAUDE.md` com `docs/setup/development.md`. O `docs/README.md` segue sem linha para `setup/e2e-performance.md` e para os ADRs 0002 a 0004 (lacuna anterior, fora do escopo). A verificação manual do PO (T6) depende de ver o README renderizado no GitHub, o que exige o PR.
