# Portfólio — Luiz Felipe dos Santos

Frontend do portfólio pessoal de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript.

## Sobre o projeto

O portfólio existe para converter visita em contato: mostra o trabalho do autor com profundidade
suficiente para que quem visita entenda como ele resolve problemas, e não apenas quais tecnologias
já usou. O público são recrutadores avaliando o autor para uma vaga e clientes avaliando-o para um
projeto ou freelance; na v1, também o professor da Fatec, que avalia a entrega.

O design vem de um handoff de design, que define cinco telas; os caminhos são em inglês, iguais nos
três idiomas (D32):

| Rota            | Tela        | Propósito                                                                                                                                                              |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`             | Início      | Primeira impressão: quem é, status atual, projetos em destaque e faixa de stack                                                                                        |
| `/projects`     | Projetos    | Encontrar um projeto por busca, tipo, categoria ou tecnologia, com carregamento contínuo                                                                               |
| `/projects/:id` | Projeto     | Estudo de caso de um projeto: galeria, documentação e ficha técnica; o `README.md` em `/projects/:id` e cada outro documento em `/projects/:id/docs/<name>` (D33, D55) |
| `/about`        | Informações | Sobre mim, stack, complementos e trajetória                                                                                                                            |
| `/contact`      | Contato     | Formulário de mensagem (desligado na v1) e canais diretos                                                                                                              |

Hoje o código tem só `/` (Início com o hero mínimo) e a página de rota inexistente; as outras rotas
entram com as specs de cada tela. O site tem temas claro e escuro e interface em `pt-BR` (língua de
referência), `en` e `es`. Propósito, público e jornadas, objetivos, escopo e fora de escopo estão
detalhados em [`docs/product/overview.md`](docs/product/overview.md).

## Requisitos do projeto

Decisões do autor, que é ao mesmo tempo cliente, PO e dev do portfólio. Valem para toda feature e
toda tarefa:

- **R1 — Frontend-only com dados mock no início.** O backend ainda não existe. A aplicação funciona
  sozinha, com dados mock de projetos, trajetória e demais conteúdo exigido pelo handoff. Os dados
  virão do backend no futuro, então a infraestrutura de Redux Toolkit, RTK Query e
  `src/services/http/` fica no projeto.
- **R2 — Tradução obrigatória em `pt-BR`, `en` e `es`.** Toda feature e toda tarefa que cria ou
  altera texto de UI entrega o texto nos três idiomas; `pt-BR` é a referência. Chave de tradução
  sem uso é removida.
- **R3 — O handoff é a fonte de verdade do design.** Tokens, componentes, voz e copy,
  acessibilidade e responsividade seguem o handoff; as convenções do repositório prevalecem onde
  divergem (fonte self-hospedada em vez de Google Fonts, CSS Module em vez de classe global
  `.ds-*`, código sem comentários).

## Stack

- **React 19** com **TypeScript** em modo `strict`.
- **Vite** — dev server e build de produção.
- **react-router-dom** — roteamento client-side com data router e páginas `lazy`.
- **Redux Toolkit**, **react-redux** e **RTK Query** — estado global e, quando o backend existir,
  estado de servidor (R1).
- **i18next** e **react-i18next** — internacionalização.
- **CSS Modules** — estilo com escopo por arquivo, lendo os tokens de `src/styles/global.css`.
- **Vitest** e **Testing Library** — testes em ambiente `jsdom`, com cobertura por
  `@vitest/coverage-v8`.
- **oxlint**, **Prettier**, **Husky** e **lint-staged** — lint, formatação e hook de `pre-commit`.

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

O dev server sobe em `http://localhost:5173`. Como o backend ainda não existe (R1), `VITE_API_URL`
pode ficar vazia ou ausente no `.env`: sem ela, `src/services/http/apiUrl.ts` usa string vazia e as
requisições saem com caminho relativo. O valor do `.env.example` é só um modelo do formato. Só
variáveis com prefixo `VITE_` chegam ao código do cliente; ver
[`docs/setup/environments.md`](docs/setup/environments.md).

## Comandos

| Comando                 | O que faz                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Dev server do Vite (porta padrão 5173)                                                                           |
| `npm run build`         | `npm run typecheck`, build de produção e pré-renderização: HTML por rota e idioma e `404.html` em `dist/`        |
| `npm run build:server`  | Build SSR das entradas de servidor em `dist-server/` (intermediário, não publicado)                              |
| `npm run prerender`     | Escreve em `dist/` os HTML pré-renderizados a partir do `dist-server/`                                           |
| `npm run preview`       | Serve o `dist/` já gerado; depende de um `npm run build` anterior                                                |
| `npm run build:fatec`   | `npm run build` com o base da Fatec (`/ra2581392423047/`), mais `.nojekyll` em `dist/`                           |
| `npm run preview:fatec` | Serve esse `dist/` como o Pages (HTML por rota, 404 pelo `404.html`) em `http://localhost:4173/ra2581392423047/` |
| `npm run typecheck`     | Checagem de tipos com `tsc -b` (`src/` e `vite.config.ts`)                                                       |
| `npm test`              | Vitest em watch mode                                                                                             |
| `npm test -- --run`     | Execução única da suíte (CI, terminal não interativo)                                                            |
| `npm run test:cov`      | Suíte inteira com relatório de cobertura em `coverage/` e threshold de 80%                                       |
| `npm run lint`          | oxlint sobre o projeto, com a configuração de `.oxlintrc.json`                                                   |
| `npm run lint:fix`      | O mesmo lint, aplicando as correções automáticas possíveis                                                       |
| `npm run format`        | `prettier --write` em `**/*.{ts,tsx,css,json,md,yml,html}`, conforme `.prettierrc`                               |

Comandos do conteúdo (detalhes em [Dados do conteúdo](#dados-do-conteúdo)):

| Comando                                            | O que faz                                                                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run content:id`                               | Imprime um UUID v7 novo; `npm run content:id -- 5` imprime cinco                                                                                      |
| `npm run content:check`                            | Valida `public/content/` e `public/images/` contra o contrato e aponta arquivo, campo e regra                                                         |
| `npm run content:template`                         | Regera `content/template/pt-BR/` a partir dos tipos (só quem muda o contrato precisa)                                                                 |
| `npm run content:placeholders -- profile`          | Gera a foto placeholder do perfil, sem sobrescrever arquivo existente (`--force` sobrescreve)                                                         |
| `npm run content:placeholders -- project <id> [n]` | Gera de 1 a 5 imagens placeholder do projeto, nos caminhos finais                                                                                     |
| `npm run og:image`                                 | Regera `public/images/og-site.png` (1200×630, gato e nome) com o Chromium do Playwright; exige `npx playwright install chromium` e o PNG é versionado |

## Estrutura de `src/` e convenções

| Pasta        | O que guarda                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------- |
| `pages/`     | Telas ligadas a uma rota (`<Nome>.page.tsx`); lógica de página em `pages/hooks/`              |
| `layouts/`   | `MainLayout`, com header, footer e o único `<Suspense>` em volta do `<Outlet />`              |
| `routers/`   | `paths.ts` (`ROUTES`), `routes.tsx` (o data router é criado em `prerender/mountClient.tsx`)   |
| `prerender/` | Registro das rotas pré-renderizáveis, carregamento de dados do servidor e montagem do cliente |
| `store/`     | Store do Redux Toolkit, `api.ts` do RTK Query e os endpoints em `store/api/`                  |
| `services/`  | Cliente HTTP (`http/`) e a camada de dados local da v1 (`content/`)                           |
| `i18n/`      | Configuração do i18next e a API de idioma (`getLanguage`, `setLanguage`)                      |
| `locales/`   | Traduções: `<idioma>/<namespace>.json`                                                        |
| `styles/`    | `global.css` (tokens e reset) e CSS Modules em `styles/pages/` e `styles/components/`         |
| `types/`     | Tipos compartilhados, um por arquivo (`<dominio>/<NomeDoTipo>.types.ts`), e `*.d.ts`          |
| `testUtils/` | Utilitários de teste, como `renderWithStore`, `stubContentFetch` e fixtures                   |

Pastas como `components/` e `hooks/` nascem no primeiro uso. Em resumo: identificadores em inglês,
import interno pelo alias `@/` (nunca `../`), import nomeado, export no final do arquivo com um
símbolo por arquivo (`export default`), texto de UI sempre por chave de tradução e código sem
comentários. As regras completas, com o que o oxlint verifica sozinho e o padrão de branches,
commits e PRs, estão em [`.claude/CLAUDE.md`](.claude/CLAUDE.md). A visão de arquitetura está em
[`docs/architecture/frontend.md`](docs/architecture/frontend.md).

## Dados do conteúdo

Na v1 não há backend (R1). Os dados vêm de arquivos locais que uma camada de dados responde como a
API responderia, com os mesmos parâmetros, respostas e erros de
[`docs/architecture/api-contract.md`](docs/architecture/api-contract.md):

| Onde                                          | O que guarda                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `public/content/<idioma>/`                    | `profile.json`, `timeline.json` e `projects.json` de `pt-BR`, `en` e `es`                |
| `public/content/<idioma>/projects/<id>/docs/` | Documentos traduzidos do projeto (`README.md`, `SETUP.md` ...)                           |
| `public/content/shared/projects/<id>/docs/`   | Documentos neutros do projeto (`LICENSE`), um arquivo só para os três idiomas            |
| `public/images/`                              | Imagens dos projetos (`projects/<id>/<n>-large.webp` e `-small.webp`) e a foto do perfil |
| `content/template/`                           | Modelo em branco do conteúdo, com README de uso (não é publicado)                        |
| `src/services/content/`                       | A camada local: leitura dos arquivos, busca, ordenação, trajetória e validação           |
| `src/store/api/`                              | Endpoints do RTK Query (`profile.api.ts`, `timeline.api.ts`, `projects.api.ts`)          |

Página e componente nunca leem esses arquivos: o acesso é pelos endpoints, com `lang` no argumento
(`projectsApi.useGetProjectsQuery({ lang, sort: "recent" })`). Os arquivos de `public/` são
pedidos com `import.meta.env.BASE_URL` (`src/utils/publicUrl.ts`), então funcionam na
raiz (`npm run dev`) e no prefixo do GitHub Pages.

O conteúdo é o real do portfólio, escrito em `pt-BR` (#58). `en` e `es` ainda repetem o `pt-BR`,
com só os títulos das seções do `README.md` de cada projeto no idioma, até a tradução (#59). Para
alterar ou acrescentar conteúdo, edite os arquivos de `public/content/pt-BR/` (o modelo de
`content/template/pt-BR/` e o `content/template/README.md` explicam o passo a passo), gere os ids
com `npm run content:id` e rode `npm run content:check`: o teste de conteúdo falha com o arquivo, o
campo e a regra de qualquer desvio do contrato, e o CI roda a suíte inteira quando `public/content/`,
`public/images/` ou `content/` mudam.

As imagens ficam em `public/images/` já em WebP, em duas variantes (`large` e `small`). Para trocar
uma imagem, coloque o arquivo por cima com o mesmo nome, em WebP, na mesma proporção (16:9 nas
imagens de projeto, 1:1 na foto) e confira se `width` e `height` do JSON são os do arquivo novo; o
`npm run content:check` acusa qualquer diferença.

**Trocar pela API (#43):** em cada arquivo de `src/store/api/`, o `queryFn` vira `query` com o mesmo
argumento e o mesmo tipo de resposta; depois remova `src/services/content/`, defina `VITE_API_URL`
e mantenha as páginas como estão.

## Internacionalização

Texto de UI não é escrito no código: o componente usa uma chave (`t("heading")` ou `<Trans>`) e o
valor de cada idioma fica em `src/locales/<idioma>/<namespace>.json`, com os mesmos namespaces e
chaves em `pt-BR`, `en` e `es`. A configuração fica em `src/i18n/`. As chaves são tipadas a partir
dos JSON de `pt-BR`: chave inexistente em `t()` ou faltando em `en`/`es` é erro de compilação.

Para adicionar uma chave, escreva-a primeiro em `src/locales/pt-BR/<namespace>.json` e depois em
`en` e `es`. Para adicionar um namespace, crie o JSON nos três idiomas, registre-o em
`src/i18n/resources.ts` e inclua o nome no `ns` de `src/i18n/i18n.ts`.

O idioma ativo é o do primeiro segmento do caminho: `/pt-BR`, `/en` ou `/es`. Prefixo
desconhecido ou ausente (`/fr`, `/pt`, `/projects`) cai na página não encontrada, em inglês, e `?lng=`
não tem efeito. A raiz `/` só redireciona, nesta ordem: escolha salva, idioma do navegador e, por
último, `/en` (fallback). A escolha é salva no `localStorage` sob
`LANGUAGE_STORAGE_KEY = "portfolio-frontend:language"` (`src/i18n/languageStorageKey.ts`) quando o
código chama `setLanguage`; o idioma do navegador nunca é gravado. `<html lang>` acompanha o idioma
ativo. Link interno usa `useLocalizedPath()`, que mantém o prefixo do idioma.

## Design system

Os tokens de cor, tipografia, espaçamento, forma e movimento estão em `src/styles/global.css`, com
os mesmos nomes dos `tokens/` do handoff; CSS Module usa essas custom properties em vez de valor
hardcoded. O resumo do design system, com as divergências adotadas pelo repositório, está em
[`docs/design/design-system.md`](docs/design/design-system.md).

As fontes do handoff (Bricolage Grotesque, IBM Plex Sans e IBM Plex Mono) são self-hospedadas:
`woff2` e licenças OFL em `public/fonts/`, `@font-face` em `src/styles/global.css` e `preload` no
`index.html`. O Google Fonts do handoff não é usado para não fazer requisição a terceiros com o IP
de quem visita (privacidade, LGPD/GDPR), não depender de CDN externa e servir as fontes da mesma
origem, com `preload`.

O tema escuro é aplicado hoje por `@media (prefers-color-scheme: dark)` em `global.css`. A troca
por `data-theme` com a escolha persistida, prevista no handoff, entra com a spec de tema.

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

## CI e git hooks

`.github/workflows/ci.yml` roda em todo push para `main` e `staging` e em todo Pull Request, com o
Node do `.nvmrc` e três jobs: `build` (`npm run build`), `lint` (`npm run lint`) e `test`. O `test`
roda `npm run test:cov` em push, em PR que mira `main` ou quando o diff altera arquivo que
afeta a suíte inteira (`package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`,
`src/setupTests.ts`, `public/content/`, `public/images/`, `content/`), publicando `coverage/` como
artifact; nos demais PRs roda só os testes
afetados pelo diff. O `.github/dependabot.yml` atualiza as dependências de `npm` e
`github-actions` uma vez por mês.

`.github/workflows/deploy.yml` publica na Vercel depois que o CI de um push termina verde: a
`staging` vai para o ambiente de testes (beta) e a `main` para produção. CI falhando, cancelado ou
vindo de PR não publica. O fluxo `PR -> staging -> main`, os domínios, as variáveis e os segredos
estão em [`docs/setup/environments.md`](docs/setup/environments.md).

`.github/workflows/fatec-pages.yml` é o ensaio da publicação da v1 no GitHub Pages da Fatec: roda
build, lint, `test:cov` e `npm run build:fatec` e publica o `dist/` como artefato `fatec-pages`, sem
publicar nada. Com a entrada `tag` no formato `v1.x.y`, usa o código dessa tag e expõe
`is-release`; qualquer outro valor é ensaio. O base vem de `BASE_PATH`; detalhes em
[`docs/setup/environments.md`](docs/setup/environments.md#fatec-github-pages).

`npm install` configura o Husky pelo script `prepare`. O hook de `pre-commit` (`.husky/pre-commit`)
roda `npx lint-staged`, que, conforme `.lintstagedrc.json`, aplica `oxlint --fix` e
`prettier --write` nos `.ts`/`.tsx` staged e só `prettier --write` nos
`.css`/`.json`/`.md`/`.yml`/`.html`, bloqueando o commit se sobrar erro de lint não corrigível.

## Documentação

| Onde                                 | O que é                                                                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/`](docs/README.md)            | Documentação versionada do frontend: produto, glossário, design system, arquitetura, ADRs, diagramas, ambientes e o molde de tela (`screens/_template.md`) |
| `.specs/`                            | Planejamento local por feature ou bug (`spec.md` e `tasks.md`), gitignored; só o resumo de `_archive/` é versionado                                        |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Padrão de branches, commits e Pull Requests                                                                                                                |

O índice completo de `docs/` está em [`docs/README.md`](docs/README.md). Pull Requests seguem
`.github/PULL_REQUEST_TEMPLATE.md`.

## Licença

Distribuído sob a licença MIT, com copyright de Luiz Felipe dos Santos. Ver [`LICENSE`](LICENSE).
