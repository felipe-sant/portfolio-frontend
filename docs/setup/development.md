# Desenvolvimento

Como preparar o ambiente, rodar o projeto, testá-lo e o que o CI e os hooks fazem. Ambientes, variáveis `VITE_*` e a publicação ficam em [`environments.md`](environments.md); o padrão de branches, commits e Pull Requests está em [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## Requisitos de ambiente

- **Node.js** `>= 24.15.0` (campo `engines` do `package.json`). O `.nvmrc` fixa a versão
  recomendada, `24.21.0`, a mesma usada no CI; com `nvm`, rode `nvm use` na raiz.
- **npm.** O repositório versiona o `package-lock.json`; não use `yarn` nem `pnpm`, que gerariam um
  lockfile divergente.

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

O `npm run build` exige `VITE_SITE_URL`, só a origem (`http(s)://host`, sem caminho nem barra
final); o `.env.example` já traz o valor local, então o `cp` acima basta, e quem builda sem `.env`
(como no CI) precisa defini-la. Detalhe em [`environments.md`](environments.md).

O dev server sobe em `http://localhost:5173`. Como o backend ainda não existe (R1), `VITE_API_URL`
pode ficar vazia ou ausente no `.env`: sem ela, `src/services/http/apiUrl.ts` usa string vazia e as
requisições saem com caminho relativo. O valor do `.env.example` é só um modelo do formato. Só
variáveis com prefixo `VITE_` chegam ao código do cliente; ver [`environments.md`](environments.md).

## Comandos

| Comando                      | O que faz                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Dev server do Vite (porta padrão 5173)                                                                                                    |
| `npm run build`              | `npm run typecheck`, build de produção, pré-renderização (HTML por rota e idioma e `404.html`) e arquivos para buscadores e IA em `dist/` |
| `npm run build:server`       | Build SSR das entradas de servidor em `dist-server/` (intermediário, não publicado)                                                       |
| `npm run prerender`          | Escreve em `dist/` os HTML pré-renderizados a partir do `dist-server/`                                                                    |
| `npm run build:seo`          | Escreve em `dist/` o `robots.txt`, o `sitemap.xml`, o `llms.txt` e os `llms-full*.txt` (já faz parte do `build`)                          |
| `npm run preview`            | Serve o `dist/` já gerado; depende de um `npm run build` anterior                                                                         |
| `npm run build:fatec:form`   | O mesmo build do Pages com o formulário de Contato ligado, em `dist-form/` (só para o E2E)                                                |
| `npm run build:fatec`        | `npm run build` com o base da Fatec (`/ra2581392423047/`), mais `.nojekyll` em `dist/`                                                    |
| `npm run publish:fatec:docs` | Troca o `docs/` de um clone da Fatec pelo artefato: `-- <artefato> <clone>` (usado pelo workflow)                                         |
| `npm run preview:fatec`      | Serve esse `dist/` como o Pages (HTML por rota, 404 pelo `404.html`) em `http://localhost:4173/ra2581392423047/`                          |
| `npm run typecheck`          | Checagem de tipos com `tsc -b` (`src/` e `vite.config.ts`)                                                                                |
| `npm test`                   | Vitest em watch mode                                                                                                                      |
| `npm test -- --run`          | Execução única da suíte (CI, terminal não interativo)                                                                                     |
| `npm run test:cov`           | Suíte inteira com relatório de cobertura em `coverage/` e threshold de 80%                                                                |
| `npm run test:e2e`           | E2E do Playwright (Chromium) com axe em `e2e/`, contra o build do Pages; rode `npm run build:fatec` antes, porque o comando não builda    |
| `npm run test:e2e:timings`   | O E2E com os reporters `json` e `list`, gravando `e2e-timings/report.json` (medição, ver [`e2e-performance.md`](e2e-performance.md))      |
| `npm run e2e:rank`           | Imprime os testes mais lentos do `e2e-timings/report.json`                                                                                |
| `npm run e2e:flaky`          | Lista os testes instáveis (`flaky`) de um relatório JSON do Playwright                                                                    |
| `npm run e2e:check-shards`   | Confere que a união das fatias (`--shard`) do E2E é a lista completa de testes                                                            |
| `npm run check:chunk`        | Depois do build, confere o orçamento gzip dos chunks do markdown e do `pdfjs-dist` e que a entrada não carrega o `react-markdown`         |
| `npm run check:contact-form` | Depois do build, falha se o HTML pré-renderizado (`dist/` por padrão) tiver o formulário de Contato, cujo envio é simulado                |
| `npm run lint`               | oxlint sobre o projeto, com a configuração de `.oxlintrc.json`                                                                            |
| `npm run lint:fix`           | O mesmo lint, aplicando as correções automáticas possíveis                                                                                |
| `npm run changeset`          | Cria o changeset do Pull Request em `.changeset/` (`-- --empty` para mudança que não altera a versão)                                     |
| `npm run format`             | `prettier --write` em `**/*.{ts,tsx,css,json,md,yml,html}`, conforme `.prettierrc`                                                        |

O `npm run build` também deixa na raiz de `dist/`, sob o `base`, os arquivos que buscadores e IAs procuram: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `llms-full.en.txt` e `llms-full.es.txt`, gerados por `scripts/generateSeoFiles.ts` a partir dos JSONs de `public/content/`, do CV e das rotas pré-renderizadas, com a origem de `VITE_SITE_URL`. Para conferir, rode `npm run build:fatec`, `npm run preview:fatec` e `curl -s http://localhost:4173/ra2581392423047/llms.txt` (o mesmo vale para os outros cinco). Detalhe em [`frontend.md`](../architecture/frontend.md#arquivos-para-buscadores-e-ia).

Comandos do conteúdo e dos arquivos gerados (detalhes do conteúdo em [Dados do conteúdo](../architecture/code-structure.md#dados-do-conteúdo)):

| Comando                                            | O que faz                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run content:id`                               | Imprime um UUID v7 novo; `npm run content:id -- 5` imprime cinco                                                                                                                                                                                                                        |
| `npm run content:check`                            | Valida `public/content/` e `public/images/` contra o contrato e aponta arquivo, campo e regra                                                                                                                                                                                           |
| `npm run content:template`                         | Regera `content/template/pt-BR/` a partir dos tipos (só quem muda o contrato precisa)                                                                                                                                                                                                   |
| `npm run content:placeholders -- profile`          | Gera a foto placeholder do perfil, sem sobrescrever arquivo existente (`--force` sobrescreve)                                                                                                                                                                                           |
| `npm run content:placeholders -- project <id> [n]` | Gera de 1 a 5 imagens placeholder do projeto, nos caminhos finais                                                                                                                                                                                                                       |
| `npm run cv:pdf`                                   | Regera `public/cv/cv-<idioma>.pdf` a partir dos `cv-<idioma>.md` (Chromium do Playwright, PDF marcado e com o idioma); rode à mão quando um `.md` mudar e commite os PDFs: o teste `scripts/test/resumePdfsUpToDate.test.ts` falha se eles divergirem do Markdown. O build não gera PDF |
| `npm run playwright:install`                       | Instala só o Chromium do Playwright (`npx playwright install chromium`, sem `--with-deps`), com até 3 tentativas de no máximo 4 min cada e esperas de 30 s e 90 s entre elas; é o passo "Install Chromium" do CI                                                                        |
| `npm run og:image`                                 | Regera `public/images/og-site.png` (1200×630, gato e nome) com o Chromium do Playwright; exige `npx playwright install chromium` e o PNG é versionado                                                                                                                                   |
| `npm run profile:photo -- <arquivo.jpg>`           | Gera `photo-large.webp` (362×362) e `photo-small.webp` (320×320) em `public/images/profile/` a partir de um JPEG fora do repositório, pelo canvas do Chromium do Playwright (sem EXIF nem XMP); exige `npx playwright install chromium`                                                 |
| `npm run readme:images`                            | Regera as capturas da Início do `README.md` (`docs/design/assets/readme/home-light.png` e `home-dark.png`, 1280×800, até 300 KB cada) com o Chromium do Playwright; exige `npm run build:fatec` e `npm run preview:fatec` no ar, e os PNG são versionados                               |

O `pdfjs-dist` (build `legacy`) é dependência de runtime, carregado por `import()` só quando o modal do currículo abre em celular ou sem visualizador de PDF: o módulo (até 170 KB gzip) e o worker (até 420 KB gzip, em `dist/assets/`, mesma origem) ficam fora do bundle de entrada, e `npm run check:chunk` confere o orçamento.

## Testes e cobertura

O teste fica em `test/` dentro do diretório do arquivo testado
(`src/pages/Home.page.tsx` → `src/pages/test/Home.page.test.tsx`), importando o arquivo testado
pelo alias `@/`. O ambiente é `jsdom`, o setup é `src/setupTests.ts` e todo teste começa em
`pt-BR`, sem escolha de idioma salva; testes de tela afirmam o texto em português.

```bash
npm test -- --run
npm run test:cov
```

`npm test -- --run` roda a suíte uma vez (`npm test` sozinho fica em watch mode). `npm run test:cov`
roda a suíte inteira com `@vitest/coverage-v8`, gera o relatório em `coverage/` (fora do controle
de versão) e falha se statements, branches, functions ou lines ficarem abaixo de 80%.

Os testes de ponta a ponta ficam em `e2e/` (Playwright, Chromium, com axe) e rodam contra o build do
Pages: `npm run build:fatec` e depois `npm run test:e2e`. A classificação dos specs, a medição e o
desenho das fatias do CI estão em [`e2e-performance.md`](e2e-performance.md).

A convenção completa de teste (onde fica, `setupTests`, `renderWithStore`, axe, `vmThreads`, regras do E2E) está em [`testing.md`](testing.md).

## CI e git hooks

`.github/workflows/ci.yml` (nome `CI`) roda em todo push para `main`, `staging` e `hotfix/**` e em
todo Pull Request para a `staging`, com o Node do `.nvmrc`. Os jobs são `Build` (`npm run build`),
`Lint` (`npm run lint`), `Test` e os três do E2E: `E2E scope` decide o escopo por diff, `E2E shard i/4`
roda uma fatia do E2E cada e `E2E` agrega o resultado e é o único check exigido. O `Test`
roda `npm run test:cov` em push e em PR que altera arquivo que afeta a suíte inteira
(`package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `src/setupTests.ts`,
`public/content/`, `public/images/`, `content/`), publicando `coverage/` como artifact; nos demais
PRs roda só os testes afetados pelo diff. O PR para a `main` reaproveita os checks do push no mesmo
SHA. O `.github/dependabot.yml` atualiza as dependências de `npm` e `github-actions` uma vez por
mês.

`.github/workflows/deploy.yml` publica na Vercel depois que o CI de um push termina verde: a
`staging` vai para o ambiente de testes (beta) e a `main` para produção. CI falhando, cancelado ou
vindo de PR não publica. O fluxo `PR -> staging -> main`, os domínios, as variáveis e os segredos
estão em [`environments.md`](environments.md).

`.github/workflows/fatec-pages.yml` builda a v1 para o GitHub Pages da Fatec: roda build, lint,
`test:cov` e `npm run build:fatec` e anexa o `dist/` como artefato `fatec-pages`. Com a entrada `tag`
no formato `v1.x.y` (disparada à mão em Actions, ou chamada pela release por `workflow_call`), o job
`publish` confere que a tag está na `main`, troca o `docs/` do repositório da Fatec pelo artefato e
faz commit em `main` com o secret `FATEC_PAGES_TOKEN`; qualquer outro valor é ensaio e não publica.
O base vem de `BASE_PATH`. Contrato com a release, credencial e plano B manual em
[`environments.md`](environments.md#fatec-github-pages).

O versionamento roda por `changeset-check.yml`, `version.yml` e `release.yml`, descritos em
[`environments.md`](environments.md#versionamento-changesets).

`npm install` configura o Husky pelo script `prepare`. O hook de `pre-commit` (`.husky/pre-commit`)
roda `npx lint-staged`, que, conforme `.lintstagedrc.json`, aplica `oxlint --fix` e
`prettier --write` nos `.ts`/`.tsx` staged e só `prettier --write` nos
`.css`/`.json`/`.md`/`.yml`/`.html`, bloqueando o commit se sobrar erro de lint não corrigível.

### Proteções de IA (hooks do Claude Code)

Além do Husky, `.claude/settings.json` liga hooks que valem só para sessões do Claude Code (não rodam
no CI nem no Git). `.claude/hooks/guardBash.ts` (`PreToolUse` em `Bash`) bloqueia `git commit` e
`git push` com a branch `staging` ou `main` ativa, `git push` com destino `staging` ou `main`,
`git push --force`/`-f` em qualquer branch (`--force-with-lease` é permitido) e `rm` recursivo.
`.claude/hooks/formatFile.ts` (`PostToolUse` em `Edit|Write|MultiEdit`) roda `prettier --write` e, em
`.ts`/`.tsx`, `oxlint` só no arquivo editado. Nenhum hook roda teste automatizado. Os scripts rodam
com `tsx` (`npx tsx --tsconfig tsconfig.node.json`) e a lógica fica em `scripts/claudeHooks/`, testada
em `scripts/test/`. Para contornar, o PO desativa o hook em `.claude/settings.local.json`; o agente não
altera `settings.json` para se liberar. Detalhe em [`.claude/README.md`](../../.claude/README.md).

## Referência de comandos (lista do agente)

Lista dos scripts `npm` com o comentário de cada um, como o agente de IA a consulta. A tabela acima é a versão para humanos; a descrição das convenções de teste está em [`testing.md`](testing.md).

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # typecheck + vite build (cliente) + build:server + prerender (HTML por rota e idioma + 404.html em dist/) + build:seo
npm run build:server # build SSR (dist-server/, intermediário e gitignored) das entradas de servidor
npm run prerender    # scripts/prerender.ts: lê dist-server/ e escreve os HTML pré-renderizados em dist/
npm run build:seo    # scripts/generateSeoFiles.ts: escreve em dist/ robots.txt, sitemap.xml, llms.txt e llms-full.txt, llms-full.en.txt, llms-full.es.txt (JSONs de public/ + rotas do dist-server/; conferir com curl em <base>robots.txt etc.)
npm run preview  # serve o conteúdo de dist/ já gerado — depende de um npm run build anterior
npm test         # Vitest em watch mode (o script é `vitest`, sem `run`)
npm test -- --run                            # execução one-shot (CI, agente, terminal não-interativo)
npm test -- --run src/pages/test/Home.page.test.tsx   # um arquivo específico
npm run typecheck # checagem de tipos (tsc -b) de src/ e vite.config.ts
npm run lint      # oxlint sobre o projeto (configuração em .oxlintrc.json)
npm run build:fatec   # build com BASE_PATH=/ra2581392423047/ + .nojekyll em dist/; falha sem o 404.html pré-renderizado (GitHub Pages da Fatec)
npm run build:fatec:form # build do Pages com a flag do formulário de Contato ligada, em dist-form/ (só para o E2E)
npm run publish:fatec:docs -- <artefato> <clone> # troca o docs/ do clone da Fatec pelo artefato (usado pelo job publish de fatec-pages.yml)
npm run preview:fatec # servidor Node que imita o Pages (arquivo, <caminho>.html, pasta com 301, 404.html) em http://localhost:4173/ra2581392423047/
npm run check:chunk # depois do build: o chunk MarkdownDocument-*.js (markdown + realce) tem de ficar em até 102400 bytes gzip, o chunk pdf-*.js do pdfjs em até 174080 e o worker pdf.worker.min-*.mjs em até 430080 (scripts/pdfChunk/), e nenhum chunk de entrada, Início ou Projetos pode conter o react-markdown (CI, job Build)
npm run check:contact-form [dir] # reprova o build (padrão dist/) cujo HTML pré-renderizado traz o formulário de Contato (id="contact-form" ou referência ao chunk ContactForm); roda no job Build do ci.yml, no fatec-pages.yml e no deploy.yml (sobre .vercel/output/static), nunca sobre dist-form/ (o envio é simulado até a #44)
npm run og:image  # regera public/images/og-site.png (Chromium do Playwright, versionado)
npm run readme:images # regera docs/design/assets/readme/home-{light,dark}.png do README (Chromium do Playwright, manual; exige npm run build:fatec e npm run preview:fatec no ar; PNG versionados, até 300 KB cada, guardados por scripts/test/readme.test.ts)
npm run cv:pdf    # regera public/cv/cv-<idioma>.pdf a partir dos cv-<idioma>.md (Chromium do Playwright, manual, fora do build; os PDFs são versionados e scripts/test/resumePdfsUpToDate.test.ts falha se divergirem do .md)
npm run lint:fix  # mesma coisa, aplicando as correções automáticas possíveis (oxlint --fix)
npm run changeset # cria o changeset do PR em .changeset/ (npm run changeset -- --empty gera o vazio, para mudança que não altera a versão)
npm run format    # prettier --write em **/*.{ts,tsx,css,json,md,yml,html}, conforme .prettierrc e .prettierignore
npm run test:cov  # vitest run --coverage — suíte inteira + relatório de cobertura
npm run test:e2e  # Playwright (Chromium) + axe em e2e/ contra o build do Pages; exige npm run build:fatec antes
```

## CI, build e hooks: detalhe

O CI (`.github/workflows/`) roda `npm run build`, `npm run lint`, a suíte de testes e o E2E em três jobs
(`E2E scope` decide o escopo por diff; `E2E shard i/4`, uma por fatia `--shard`, cada uma com o
próprio Chromium e os dois builds; `E2E`, o agregador e único check exigido pelo ruleset, que falha
se o escopo ou alguma fatia falhar, junta os blobs (HTML e JSON), avisa no `GITHUB_STEP_SUMMARY` dos testes `flaky` por `npm run e2e:flaky` (só avisa, não falha) e sobe `playwright-report` em falha;
`npm run e2e:check-shards` prova que a união das fatias é a lista completa), os mesmos comandos da verificação local, em PR para a `staging` e em push na `main`, na `staging` e em `hotfix/**` (o PR para a `main` reaproveita os checks do push no mesmo SHA, ver `docs/setup/environments.md`). O `deploy.yml` publica na
Vercel (`staging` = beta, `main` = produção) só depois do CI de push verde; detalhe em
`docs/setup/environments.md`.

`vite build` sozinho não checa tipos (usa esbuild, que só transpila); por isso o script `build`
roda `npm run typecheck` (`tsc -b`, que cobre `src/` via `tsconfig.app.json` e `vite.config.ts` via `tsconfig.node.json`) antes.

`npm install` configura automaticamente (script `prepare`, `"prepare": "husky"`) um hook de
`pre-commit` do Husky que roda `npx lint-staged` a cada commit — sem passo manual extra.
`lint-staged` (`.lintstagedrc.json`) aplica `oxlint --fix` e depois `prettier --write` nos
arquivos `.ts`/`.tsx` staged, e só `prettier --write` nos `.css`/`.json`/`.md`/`.yml`/`.html`
staged (mesmo escopo do script `format`, com `package-lock.json`, `dist/` e `coverage/` fora via
`.prettierignore`); corrige o que for
automático e bloqueia o commit se sobrar erro de lint não corrigível sozinho. O `.editorconfig` na
raiz (`root = true`) padroniza charset, final de linha, quebra de linha final, remoção de trailing
whitespace e indentação (`indent_size = 4` para todos os tipos, exceto `package.json` e `package-lock.json`, em `2`)
para editores compatíveis, coerente com o `.prettierrc`.
