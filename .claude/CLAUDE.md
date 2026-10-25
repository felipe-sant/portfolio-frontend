# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

Projeto frontend em React 19 e TypeScript (`strict`), com Vite (dev server e build), Redux
Toolkit com RTK Query (estado global), i18next com react-i18next (internacionalização), CSS
Modules (estilo) e Vitest com Testing Library (teste). As seções abaixo são as convenções do
projeto: onde cada coisa fica, como é escrita e como é testada.

O conteúdo de documentação (`README.md`, specs, mensagens de commit, descrição de PR) está em
**português**. Mantenha esse padrão. **Identificadores no código são em inglês** — ver "Estilo de
código".

Texto de UI não é escrito no código: é referenciado por chave de tradução (`t("heading")`,
`<Trans>`), e o valor de cada idioma fica em `src/locales/<idioma>/` (i18next + react-i18next,
ver "Onde fica cada coisa"). Os idiomas suportados são `pt-BR`, `en` e `es`. **`pt-BR` é a língua de
referência**: texto novo nasce primeiro em `src/locales/pt-BR/`, os JSON de `pt-BR` são a fonte
do tipo das chaves e os testes de tela afirmam o texto em português. **O idioma de uma página é
decidido pelo caminho da URL** (`/pt-BR`, `/en`, `/es`); `en` é o `fallbackLng` do i18next, o destino
da raiz `/` sem escolha salva nem idioma de navegador suportado e o idioma da página não encontrada
sem prefixo válido. As duas coisas são independentes.

## Produto

Este repositório é o frontend do **portfólio pessoal de Luiz Felipe dos Santos**, desenvolvedor
full stack. O usuário é ao mesmo tempo cliente, PO e dev: ele decide escopo e prioridade e aprova
as specs. Esta seção é um resumo; o detalhe vive em `docs/` e no handoff de design.

**Handoff de design:** `/home/felipe/faculdade/design_handoff_portfolio` é a base do design
(R3). Reaproveite `tokens/` (nomes e valores dos tokens) e use `components/` como ponto de
partida dos componentes. Não copie o HTML das telas (`*.dc.html`), `support.js`, `image-slot.js`
nem os sketches de `assets/` (não são imagens de produção). Onde o handoff diverge das convenções
deste repositório, as convenções prevalecem: fonte self-hospedada em vez de Google Fonts, CSS
Module em vez de classe global `.ds-*` e código sem comentários. `docs/design/prototype/` é a
referência visual validada pelo PO (abre por `npm run dev` em
`/docs/design/prototype/prototipo-indice.dc.html`).

**Rotas:** cinco telas, das quais hoje existem no código a Início e Projetos (`/projects`, sem o `/projects/:id`; os links de Informações e Contato do cabeçalho levam à não encontrada até lá; as demais vêm nas specs de tela),
com caminhos em inglês (D32), como os identificadores, sempre sob o prefixo do idioma
(`/<idioma>`, onde `<idioma>` é `pt-BR`, `en` ou `es`, sem barra final); a raiz `/` só
redireciona e `/projects` sem prefixo cai em não encontrada. O `:id` é um UUID v7, não slug. Os
caminhos abaixo omitem o prefixo:

- `/` (Início): primeira impressão, com quem é, o que faz agora, projetos em destaque e stack.
- `/projects` (Projetos): encontrar um projeto por busca, tipo, categoria ou tecnologia.
- `/projects/:id` (Projeto): estudo de caso, com galeria, documentação e ficha técnica; o
  `README.md` abre em `/projects/:id` e cada outro documento do projeto (lista livre, D55) em
  `/projects/:id/docs/<name>`, pelo nome do arquivo.
- `/about` (Informações): sobre mim, stack, complementos e trajetória.
- `/contact` (Contato): formulário de mensagem e canais diretos (formulário desligado na v1,
  D05).

A interface tem tema claro e escuro.

**Voz e copy:** texto em `pt-BR` como referência, na primeira pessoa do singular, direto, sem
emoji e sem superlativo. Títulos são substantivos curtos sem ponto final, botões usam verbo no
infinitivo + objeto ("Ver projetos", "Enviar mensagem") e o separador de metadados é `·`.

**Requisitos obrigatórios de toda spec:**

- **R1 — Frontend-only com dados mock.** O backend ainda não existe: a aplicação funciona sozinha
  com dados mock até ele existir. Redux Toolkit, RTK Query e `src/services/http/` ficam no projeto
  para a troca do mock pela API.
- **R2 — Tradução em `pt-BR`, `en` e `es`.** Toda feature ou tarefa que cria ou altera texto de UI
  entrega o texto nos três idiomas, com `pt-BR` como referência. Chave de tradução sem uso é
  removida.
- **R3 — O design segue as decisões, o protótipo e o handoff.** Tokens, componentes, voz e copy,
  acessibilidade e responsividade seguem, nesta ordem de precedência: convenções do repositório >
  `docs/design/decisions.md` > protótipo > handoff.

**Versões:** a v1 é a entrega da faculdade (Fatec), publicada no GitHub Pages de um repositório da
organização da Fatec, com dados reais em JSON servidos pela camada local (R1) e sem backend, com prazo em 22/11/2026; V2+
são de uso pessoal (Vercel, depois AWS com backend). Ordem, dependências e critério da v1 em
`docs/product/roadmap.md`.

**Decisões de design:** as pendências e contradições do handoff estão decididas em
`docs/design/decisions.md`, com IDs (`D01`–`D56`, `PI1`–`PI5`) que specs e issues citam.

**Onde ler mais:** `docs/product/overview.md` (visão, público, jornadas, objetivos, escopo,
requisitos e decisões), `docs/product/glossary.md` (glossário), `docs/product/roadmap.md` (versões,
marcos e definição da v1), `docs/product/accessibility.md` (meta, verificação e checklist de
acessibilidade por tela), `docs/product/non-functional-requirements.md` (requisitos transversais,
metas de desempenho e legibilidade por IA), `docs/design/design-system.md` (design system),
`docs/screens/` (requisitos de cada tela e do layout compartilhado), `docs/diagrams/` (fluxo de
navegação e entidades), `docs/architecture/frontend.md` (arquitetura),
`docs/architecture/data-model.md` (modelo de dados: entidades, campos, enums e tradução do
conteúdo) e `docs/architecture/api-contract.md` (contrato esperado da API e a camada local da v1,
que o simula).

## Comandos

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # typecheck + vite build (cliente) + build:server + prerender: HTML por rota e idioma + 404.html em dist/
npm run build:server # build SSR (dist-server/, intermediário e gitignored) das entradas de servidor
npm run prerender    # scripts/prerender.ts: lê dist-server/ e escreve os HTML pré-renderizados em dist/
npm run preview  # serve o conteúdo de dist/ já gerado — depende de um npm run build anterior
npm test         # Vitest em watch mode (o script é `vitest`, sem `run`)
npm test -- --run                            # execução one-shot (CI, agente, terminal não-interativo)
npm test -- --run src/pages/test/Home.page.test.tsx   # um arquivo específico
npm run typecheck # checagem de tipos (tsc -b) de src/ e vite.config.ts
npm run lint      # oxlint sobre o projeto (configuração em .oxlintrc.json)
npm run build:fatec   # build com BASE_PATH=/ra2581392423047/ + .nojekyll em dist/; falha sem o 404.html pré-renderizado (GitHub Pages da Fatec)
npm run preview:fatec # servidor Node que imita o Pages (arquivo, <caminho>.html, pasta com 301, 404.html) em http://localhost:4173/ra2581392423047/
npm run og:image  # regera public/images/og-site.png (Chromium do Playwright, versionado)
npm run lint:fix  # mesma coisa, aplicando as correções automáticas possíveis (oxlint --fix)
npm run format    # prettier --write em **/*.{ts,tsx,css,json,md,yml,html}, conforme .prettierrc e .prettierignore
npm run test:cov  # vitest run --coverage — suíte inteira + relatório de cobertura
npm run test:e2e  # Playwright (Chromium) + axe em e2e/ contra o build do Pages; exige npm run build:fatec antes
```

O teste fica em **`test/` dentro do diretório do arquivo testado**:
`src/pages/Home.page.tsx` -> `src/pages/test/Home.page.test.tsx`, nunca em `__tests__/` nem com
sufixo `.spec.tsx`. O arquivo testado é importado pelo alias `@/` (`import HomePage from
"@/pages/Home.page"`), nunca por `../`; `vi.mock`, `vi.doMock` e `import()` dinâmico também usam
alias. Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service
(`src/services/http/test/get.test.ts`). O ambiente é `jsdom` e o setup é
`src/setupTests.ts`, registrado em `test.setupFiles` do `vite.config.ts` — é ele que importa
`@testing-library/jest-dom/vitest` (registrando matchers como `toBeInTheDocument()`) e que roda
`afterEach(cleanup)`, porque sem `globals: true` o Testing Library não liga o cleanup sozinho.
O mesmo setup roda um `beforeEach` que remove `LANGUAGE_STORAGE_KEY` do `localStorage` e aguarda
`i18n.changeLanguage("pt-BR")` direto na instância: todo teste começa sem escolha salva e na
língua de referência, independente do navegador do `jsdom` (que reporta `en-US`). O literal é
`"pt-BR"`, não `FALLBACK_LANGUAGE`, e o reset não grava nada. Teste de rota abre o caminho com
prefixo (`createMemoryRouter(routes, { initialEntries: ["/pt-BR"] })`), porque `/` só redireciona e o
`jsdom` reporta `en-US`. O `beforeEach` também chama `clearContentCache()` (cache de leitura de `src/services/content/`), e `failFetchAfter`/`holdFetchAfter` o limpam ao criar o stub: stub novo significa memória vazia. Teste de
tela afirma o texto em português, nunca a chave (o i18next devolve a própria chave quando falta
tradução), não mocka `react-i18next` e troca de idioma com `setLanguage` dentro do `it`. Para
simular uma nova carga de página (idioma inicial lido do caminho), prepare a URL, rode
`vi.resetModules()` e faça `await import("@/i18n/i18n")`, como em
`src/i18n/test/i18n.test.ts`; restaure URL e stubs no fim, e não combine isso com `routes` já
importado (a instância nova vira a global do `react-i18next`).
Teste de componente ou hook que lê a store usa `renderWithStore(ui, { preloadedState })` de
`src/testUtils/renderWithStore.tsx`, que cria `createStore(preloadedState)` por chamada (estado e
cache do RTK Query isolados) e devolve o `render` junto da `store`. O teste de store injeta o
próprio endpoint com `api.injectEndpoints`, stuba o `fetch` com `vi.stubGlobal` e define
`VITE_API_URL` absoluta com `vi.stubEnv` (o `Request` do Node não aceita URL relativa), com
`vi.resetModules()` e import dinâmico para a constante ser relida; o endpoint injetado persiste
enquanto o módulo vive, então o nome é único por arquivo (ver `src/store/test/api.test.ts` e
`src/testUtils/test/renderWithStore.test.tsx`).
Todo teste de página, layout e componente tem ao menos um `it` que chama
`expectNoAxeViolations(container)` de `src/testUtils/expectNoAxeViolations.ts`, com o `container`
devolvido pelo `render` (ou por `renderWithStore`): roda o `axe-core` no contêiner e rejeita com
`id` e alvo de cada violação. É função comum, sem `expect.extend` (`vitest-axe` e `jest-axe` não
entram). A regra `color-contrast` fica desligada porque o `jsdom` não calcula cor; o contraste é
verificado no navegador real (#55). O `axe.run` é lento no `jsdom` e estoura o timeout padrão de 5s com a suíte em paralelo: o `it`
que chama o helper recebe `15000` como terceiro argumento. Teste de rota (`App.test.tsx`, `routes.test.tsx`) não chama.
Cada formato de teste tem seu jeito: página renderizada direto, árvore de rotas em
`createMemoryRouter` (para verificar a rota `*`, por exemplo), layout com `<Outlet />` preenchido
por rota-filha, módulo com `fetch` stubado via `vi.stubGlobal`, componente com interação
(`user-event`), hook com `renderHook` e função pura. A skill `vitest-specialist` traz um trecho de
cada formato.

Ficam sem teste `src/entry-client.tsx`, que só procura o `#root` do `index.html` e chama
`mountClient` (testado), e a pasta `src/types/`, que só declara tipo e não tem runtime.

O `render` de `src/entry-server.tsx` usa `react-dom/static`, que precisa de `ReadableStream`: no
`jsdom` o teste faz `vi.stubGlobal("ReadableStream", ReadableStream)` com o de `node:stream/web`. Como o
`react-dom/server` deixa os contextos do React sujos no processo em que roda, teste que hidrata o HTML
gerado não chama `render` no mesmo arquivo: pega o resultado em `inject("prerenderFixtures")`, produzido
por `src/testUtils/prerenderGlobalSetup.ts` (`test.globalSetup`, processo principal do Vitest). Teste que
precisa de `window` e `document` indefinidos usa `// @vitest-environment node` (o `setupTests` tolera).

`npm run test:cov` roda a suíte inteira com `@vitest/coverage-v8` (bloco `test.coverage` em
`vite.config.ts`), gerando relatório nos formatos `text`, `json`, `json-summary` e `html` em
`coverage/` (gitignored) e aplicando um threshold mínimo de 80% em statements, branches, functions
e lines — abaixo disso o comando termina com erro. `exclude` cobre os arquivos sem runtime
relevante já citados acima, mais `vite.config.ts`, `src/setupTests.ts`, `src/testUtils/prerenderGlobalSetup.ts`,
`scripts/prerender.ts` e o glob `src/types/**`.

O bloco `test` usa `pool: "vmThreads"`: o `jsdom` é criado uma vez por worker e cada arquivo roda
num contexto de VM isolado. Não troque por `isolate: false`, que compartilha o estado entre
arquivos e faz o resultado depender da ordem de execução. Como o worker é reaproveitado, teste que
stuba com `vi.stubGlobal`/`vi.stubEnv` restaura no `afterEach` com
`vi.unstubAllGlobals()`/`vi.unstubAllEnvs()`.

A suíte ponta a ponta fica em `e2e/` (`playwright.config.ts` na raiz, `tsconfig.e2e.json`), com
sufixo `.spec.ts`, fora do Vitest (`e2e/**` em `test.exclude`) e da cobertura. Roda só em Chromium
contra `npm run preview:fatec` (`base` `/ra2581392423047/`), que serve o `dist/` já pronto: rode
`npm run build:fatec` antes, porque `test:e2e` não builda. Os quatro projetos (`mobile-light`,
`mobile-dark`, `desktop-light`, `desktop-dark`: 390 e 1280px, `colorScheme` claro e escuro,
`reducedMotion`) rodam cada teste. Seletor é `getByRole` com nome em português, rota abre sem barra
inicial (relativa ao `baseURL`). Toda tela nova acrescenta o caminho em `e2e/support/routesUnderTest.ts`
(o axe, com `color-contrast` ligada, roda em todas) e, se tiver teclado próprio, um roteiro em
`e2e/<tema>.spec.ts`. Violação do axe se corrige na marcação ou no CSS, nunca desligando regra. Os projetos rodam com `reducedMotion: "reduce"`: roteiro que precisa de movimento pleno usa `test.use({ reducedMotion: "no-preference" })`. Elemento com `useReveal` leva `suppressHydrationWarning` (o `data-reveal` do HTML do servidor difere do primeiro render no navegador).

**Toda tela nova entrega os E2E dos próprios fluxos**: clique e navegação, estados de carregamento e erro (forçados por `page.route`) e HTML sem JavaScript (`javaScriptEnabled: false`), com o ID do requisito no título (`"RF-LAY-18: o botão alterna o tema"`) e a prova de que o teste falha quando o comportamento quebra (mutação desfeita). A base são `e2e/theme`, `motion`, `language`, `navigation`, `footer`, `home-flows`, `not-found` e `no-javascript`; o apoio fica em `e2e/support/` (`readContent`, `readProfile`, `readFeaturedProjects`, `readAppVersion`, `readStackOffset`, `openPreferences`, `uiTexts`). O E2E não importa `src/`: o texto de cada idioma de que ele precisa vive em `uiTexts`.

O CI (`.github/workflows/`) roda `npm run build`, `npm run lint`, a suíte de testes e o job `e2e`
(`E2E`: instala o Chromium, `npm run build:fatec`, `npm run test:e2e`, relatório como artefato em
falha), os mesmos comandos da verificação local, em PR e em push na `main` e na `staging`. O `deploy.yml` publica na
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

## Onde fica cada coisa

- **`App.tsx`** recebe `store` e `router` por props, renderiza o `RouterProvider` dentro do `<Provider store={store}>` do react-redux e importa, por efeito colateral, `@/i18n/i18n` (que
  inicializa a instância do i18next) e o `global.css`; `@/i18n/i18n` está no `allow` de
  `import/no-unassigned-import` no `.oxlintrc.json`. Metadados (`<title>`, `<meta>`) são
  declarados por cada página com as tags nativas do React 19, escritas dentro do JSX da própria
  página, que sobem sozinhas para o `<head>`, sem biblioteca nem wrapper, e com valor vindo de chave:
  `<title>{t("meta.title")}</title>` e
  `<meta name="description" content={t("meta.description")} />`.
- **`src/i18n/`** — configuração de idioma (i18next e react-i18next), um símbolo público por
  arquivo com `export default`. `i18n.ts` cria a instância com `createInstance()` (import nomeado
  de `i18next`; `i18next.use(...)` no export default cai em `import/no-named-as-default-member`),
  registra `initReactI18next` — que torna a instância global, sem provider nem wrapper de render —
  e inicia de forma síncrona (`initAsync: false`) com `resources` (`resources.ts`),
  `defaultNS: "common"`, `supportedLngs: SUPPORTED_LANGUAGES` (`supportedLanguages.ts`),
  `fallbackLng: FALLBACK_LANGUAGE` (`fallbackLanguage.ts`, valor `en`) e
  `lng: getLanguageFromPath(removeBasePath(window.location.pathname))` (indefinido, sem prefixo
  válido, vale o `fallbackLng`). Não há detector do i18next, nem `?lng=`: o caminho é a única fonte
  do idioma e o `loader` de cada rota-pai o troca na navegação. Não existe constante de "idioma
  padrão" nem de língua de referência: `pt-BR` é referência pelo tipo de `resources.ts`, não pelo
  runtime.
    - **Funções de caminho** (puras, sobre o `pathname` relativo ao `basename`):
      `getLanguageFromPath` (primeiro segmento exatamente igual a um idioma suportado, senão
      `undefined`), `stripLanguagePrefix`, `addLanguagePrefix` (`/` vira `/en`),
      `getEquivalentPath(pathname, language)` (URL equivalente em outro idioma; query e hash o
      chamador anexa) e `getPreferredLanguage()` (escolha salva → `navigator` → `en`, **só usada
      na raiz `/`**, o único leitor de `navigator`). `resolveSupportedLanguage.ts`: código exato,
      ou `es-*` → `es`, `en-*` → `en`, `pt`/`pt-*` → `pt-BR`, ou `undefined`.
    - **`saveLanguage` é o único código que escreve em `LANGUAGE_STORAGE_KEY`**
      (`languageStorageKey.ts`, único lugar onde o valor da chave aparece), interno à pasta e
      chamado só por `setLanguage`. Visitar `/en` por link não grava escolha.
    - **API de idioma:** `getLanguage(): SupportedLanguage` (idioma ativo, função comum, usável fora
      de React) e `setLanguage(language): Promise<void>` (troca e salva a escolha). Componente e
      página usam só essas duas, nunca `saveLanguage` nem `localStorage` direto.
    - Um listener de `languageChanged`, registrado antes do `init()`, mantém
      `document.documentElement.lang` sincronizado com o idioma ativo. O `lang="pt-BR"` do
      `index.html` descreve o conteúdo estático daquele arquivo e é corrigido assim que o JS roda.
    - `SupportedLanguage` vem de `src/types/language/SupportedLanguage.types.ts`, derivado de `SUPPORTED_LANGUAGES`.
      `src/types/i18next.d.ts` augmenta `CustomTypeOptions` com `defaultNS: "common"` e os recursos
      de `pt-BR`: chave inexistente em `t()` é erro de compilação, e `en`/`es` são tipados como
      `typeof` de `pt-BR` em `resources.ts`, então namespace ou chave faltando também não compila.
- **`src/locales/`** — tradução é dado, separado da configuração em `src/i18n/`:
  `src/locales/<idioma>/<namespace>.json`, JSON com 4 espaços, os mesmos namespaces e chaves nos
  três idiomas. Um namespace por dono do texto, com o nome do CSS Module correspondente (ex.:
  `home`, `notFound`, `error`); `common` guarda texto compartilhado (`backHome`, `loading`)
  e texto fixo de componente de `src/components/` (inclusive o do rodapé, `footer.*`). Chave em inglês, lowerCamelCase, hierárquica por
  papel (`meta.title`, `meta.description`, `heading`, `filters.category.academic`). Página com
  namespace próprio chama `useTranslation("home")`; quem também usa chave de `common` carrega os
  dois, `useTranslation(["notFound", "common"])`, e chama `t("common:backHome")`, senão a chave não
  tipa. Texto com marcação no meio usa `<Trans>` com `t={t}`, `i18nKey` e
  `components={{ strong: <strong /> }}`, com o `<strong>` escrito no próprio valor do JSON.
  Namespace novo entra nos três idiomas, em `src/i18n/resources.ts` e no `ns` de
  `src/i18n/i18n.ts`.
- **`src/routers/`** — ponto único de registro de rotas. `routes.tsx` tem `routes`
  (`RouteObject[]`, export default): as páginas ficam em `pageRoutes`, definidas uma vez (Início
  como `index`, `*` de não encontrada, caminhos relativos), e uma função local gera **três
  rotas-pai idênticas** (`pt-BR`, `en`, `es`) com `MainLayout`, `errorElement`,
  `loader: createLanguageLoader(idioma)` (chama `i18n.changeLanguage`, não `setLanguage`) e as
  mesmas `pageRoutes`. Depois delas, a rota `/` (`redirectRootLoader`: escolha salva → navegador →
  `en`, preservando query e hash) e a rota `*` sem prefixo, que renderiza a não encontrada em
  inglês. Os paths vêm de `ROUTES` em `paths.ts` (`root` é a raiz que redireciona, `home` a
  Início do idioma). O data router é criado em `src/prerender/mountClient.tsx` com
  `createBrowserRouter(routes, { basename: publicUrl("/"), hydrationData })`, chamado por
  `src/entry-client.tsx` (a entrada do `index.html`).
  Toda página nova entra em `pageRoutes`. O teste renderiza `routes` com
  `createMemoryRouter(routes, { initialEntries })` e `RouterProvider`.
  As rotas-filhas de `MainLayout` são `lazy` e o único `<Suspense>` fica em volta do `<Outlet />`
  de `src/layouts/Main.layout.tsx`: página nova não precisa (nem deve) ter o próprio `<Suspense>`.
  Navegação interna usa `<Link to="...">`/`useNavigate` do `react-router-dom`, nunca
  `<a href="...">` (âncora crua força reload completo e descarta o estado), e o caminho é montado
  por `buildPath(path, language, params?)` ou, em componente, por `useLocalizedPath()` de
  `src/hooks/`, a partir de `ROUTES`: nunca se escreve caminho com prefixo à mão nem se usa
  `ROUTES.home` cru em `<Link>`. O `index.html` tem um script inline que faz na raiz o mesmo
  redirecionamento (a chave e o mapa de idiomas estão duplicados nele; `rootRedirect.test.ts`
  compara com `getPreferredLanguage`).
- **Pré-renderização** (ADR 0004, `docs/architecture/frontend.md#pré-renderização`) — `npm run build`
  gera em `dist/` um HTML por rota pública e idioma, mais o `404.html`. `src/entry-server.tsx`
  (`render(target)`, só `react-dom/static` com `progressiveChunkSize: Infinity`, uma URL por vez),
  `src/prerender/` (`prerenderRoutes.ts`, o registro das rotas pré-renderizáveis com padrão, escopo dos
  parâmetros e consultas RTK Query; `loadPrerenderData.ts`; `mountClient.tsx`) e `scripts/prerender.ts`
  com `scripts/prerender/` (`listTargets`, `getTargetFile`, `composePage`, `installPublicFetch`, que lê
  `public/` no Node sem tocar em `src/services/`). O servidor nunca importa `App.tsx`. Arquivos: `<idioma>.html`
  para a Início, `<idioma>/<rota>.html` para as demais e `<nome>.md.html` para documento (nunca pasta com
  `index.html`, que o Pages redireciona); `/` continua o `index.html`. O `404.html` é a não encontrada em
  inglês: o cliente só chama `hydrateRoot` quando o caminho é o `prerenderedPath`, senão remove o
  `title` e a `meta description` do HTML e usa `createRoot` (`shouldHydrate`, `removePrerenderedHead`).
  **Toda tela nova entrega a própria pré-renderização**: acrescenta a entrada ao registro (rota e
  consultas) e um teste de `<h1>` e conteúdo principal nos três idiomas (`src/test/entry-server.test.tsx`
  já percorre o registro existente); rota no registro sem tela em `routes` é ignorada no build. Em
  `src/i18n/i18n.ts`, `typeof window` e `typeof document` guardam o import no Node. O `vercel.json` usa
  `cleanUrls` e `trailingSlash: false`, sem reescrita genérica para o `index.html` (URL desconhecida
  responde 404 com o `404.html`); o `noindex` da `staging` é acrescentado pelo `deploy.yml`.
- **`src/store/`** — estado global: **Redux Toolkit + react-redux** para estado de cliente e
  **RTK Query** (`@reduxjs/toolkit/query/react`, sem dependência extra) para estado de servidor.
  Um símbolo público por arquivo, `export default` no final:
    - `api.ts`: `createApi` com `reducerPath: "api"`, `baseQuery` com
      `fetchBaseQuery({ baseUrl: API_URL, prepareHeaders })` (`API_URL` de `@/services/http/apiUrl`,
      `Accept-Language` com `getLanguage()`), `tagTypes` e `endpoints: () => ({})`; endpoint nunca
      é declarado em `api.ts`, sempre injetado por domínio. Não importa a store. O RTK Query não usa o
      `http` como `baseQuery` (o `fetchBaseQuery` já entrega o contrato que ele espera); os dois
      clientes compartilham `apiUrl.ts` e o idioma.
    - `api/<dominio>.api.ts`: endpoints de um domínio via `api.injectEndpoints`, com tipos de
      request/response locais e sem `export`; exporta só a API injetada, e os hooks gerados são
      consumidos por ela (`<dominio>Api.useGetXQuery`). `tagTypes` é preenchido em `api.ts` quando o
      projeto precisar de invalidação.
    - `rootReducer.ts` (`combineReducers` com `[api.reducerPath]: api.reducer`, onde slices entram),
      `createStore.ts` (`createStore(preloadedState?)`, `configureStore` com `api.middleware`
      concatenado, store nova a cada chamada) (a store da aplicação é criada em `mountClient`, com o `preloadedState` do HTML quando há).
    - `useAppDispatch.ts` e `useAppSelector.ts`: `useDispatch.withTypes<AppDispatch>()` e
      `useSelector.withTypes<RootState>()`; código de aplicação usa só esses, com seletor estreito
      (`useAppSelector((state) => state.x.y)`), nunca o estado inteiro.
    - `slices/<nome>.slice.ts`: `createSlice`, export default do próprio slice, `<Nome>State` local.
    - Tipos em `src/types/store/RootState.types.ts` (`ReturnType<typeof rootReducer>`),
      `AppStore.types.ts` (`ReturnType<typeof createStore>`) e `AppDispatch.types.ts`
      (`AppStore["dispatch"]`), um por arquivo, importados com `import type`.
    - O `<Provider store={store}>` fica em `App.tsx`, em volta do `RouterProvider`. Estado que só uma
      página usa continua `useState` no hook da página; estado compartilhado vai para um slice;
      dado do servidor vai para um endpoint do RTK Query. Idioma continua em `src/i18n/`.
    - Refetch on focus/reconnect (`setupListeners`) segue desligado, o padrão do RTK Query.
    - **Projetos** usa `getProjectsPages` (`build.infiniteQuery`, `queryFn` sobre `listProjects`, `limit` 9, argumento `ProjectsQueryArgs` sem `offset` nem `limit` como chave de cache) e `getProjectFilterOptions` (`{ lang }`, `queryFn` sobre `listProjectFilterOptions`: `technologies` e `years` como `{ value, count }`, a união da stack do perfil com as tecnologias dos projetos e o intervalo de anos dos projetos, sem busca nem filtros; a tela abre só `getProjectsPages` e `getProjectFilterOptions`, e a entrada `projects` do registro de pré-renderização dispara as mesmas duas; o `ItemList` do JSON-LD vem do primeiro lote da lista mostrada (`pages[0].items`, 9 itens, sem `numberOfItems`), não de uma consulta de índice). `ProjectPage` traz `availableTypes`; `tech` combina por E (texto normalizado), `year` por OU e campos diferentes por E (`listProjects`). `buildProjectsQueryArgs(language, filters)` (`src/utils/`) omite todo valor padrão, de modo que o estado padrão é `{ lang }`; o hook da tela e a entrada `projects` do registro de pré-renderização o usam, e é isso que faz a hidratação achar o cache. A query da tela (`q`, `type`, `category`, `tech`, `year`, `sort`; `tech` e `year` repetidos, até 10, normalizados e ordenados por `normalizeTechnologyFilter` e `normalizeYearFilter`) vive na URL (`parseProjectsSearchParams`/`buildProjectsSearch`, sempre `replace` com `preventScrollReset`), e a quantidade de páginas mostradas vive em `location.state.pages` (`useProjectsPages`), que também restaura a volta do detalhe.
    - Endpoints de conteúdo (`profile.api.ts`, `timeline.api.ts`, `projects.api.ts`) usam `queryFn`
      que chama `src/services/content/`, com `lang` no argumento (cache por idioma) e erro no
      formato do contrato (`toQueryError`); a #43 troca cada `queryFn` por `query`.
- **`src/pages/`** — convenção de nome `Nome.page.tsx`, componente `function NomePage()` com
  `export default`. Lógica de estado/efeito específica de uma página (`useState`, `useEffect`,
  chamada a service) não fica no componente: vive em `src/pages/hooks/use<Nome>.ts`, exportando
  `use<Nome>()`. O `.page.tsx` correspondente só chama esse hook e renderiza o retorno, sem
  `useState`/`useEffect` nem chamada a service dentro do componente:

    ```tsx
    function useProductList() {
        const [products, setProducts] = useState<Product[]>([])
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            get<Product[]>("/products").then(setProducts).finally(() => setIsLoading(false))
        }, [])

        return { products, isLoading }
    }

    function ProductListPage() {
        const { t } = useTranslation()
        const { products, isLoading } = useProductList()

        return isLoading ? <p>{t("loading")}</p> : <ProductTable products={products} />
    }
    ```

    Isso é distinto de `src/hooks/`, que é reservado a hooks reutilizáveis entre páginas e
    componentes, não específicos de uma única página (por exemplo, um `useDebounce` ou `useMediaQuery`).
    Se `src/pages/hooks/` ou `src/hooks/` não existir, crie a pasta no primeiro uso.

- **`src/components/`** — componentes base reutilizáveis (`Button`, `Chip`, `TextField`, `SearchInput`,
  `Skeleton`, `Spinner`, `VisuallyHidden`, `Icon`, `IconButton`, `CatLogo`, `ThemeToggle`,
  `MotionToggle`, `SettingsMenu`, `Flag`, `LanguageSelector`, `Header`, `SkipLink`, `Footer`, `CopyEmailButton`, `ButtonLink`, `AvailabilityBadge`, `LoadError`, `StatusCard`, `StackMarquee`, `FeaturedProject`, `Reveal`, `ProjectCard`, `ProjectCardSkeleton`, `FilterGroup`, `Modal`, `ProjectsFiltersModal`). O desenho de cada ícone fica num mapa local de
  `Icon.tsx`, com os nomes em `src/enum/iconNames.enum.ts`. Texto fixo de componente vive em `common`
  (`searchInput.clear`); o resto chega por prop. O `jsx-a11y/prefer-tag-over-role` acusa `role="status"`
  literal: passe `role={"status"}`. Controle de formulário tem borda `--border-control`, nunca
  `--border-subtle`. `LoadError` aceita `description` opcional e `SearchInput` aceita `id` (o hook de Projetos foca o campo por ele). `ProjectCard` recebe `index` (carga e prioridade da imagem) e `revealIndex` (atraso do `useReveal`, recomeça a cada lote de 9) e a página o envolve num `<li>` pelo `ProjectListItem`, local ao arquivo. `FilterGroup` (`role="group"`, `aria-pressed`) é sem estado e o hook decide a regra do clique. `Modal` (portal no `body`, só monta aberto, `role="dialog"`, foco no `h2`, foco preso, `#root` `inert`, trava de rolagem por `data-scroll-locked` no `body`, tela cheia abaixo de 640px) usa `useModalBehavior` (`src/hooks/`) e é genérico; `ProjectsFiltersModal` mantém o rascunho de ordenação, tecnologia e ano e aplica ao fechar por ×, Esc, fundo ou "Aplicar" (`onApply` só se mudou; "Limpar" volta a ordenação a `defaultProjectSort`). A primeira seção é "Ordenar" (`fieldset` de `radio` com o mesmo `name`, sempre presente); Tecnologia e Ano só aparecem com opções, e a opção com `count` 0 fora do rascunho é `disabled` nativo com nome terminando em `filters.modal.noProjects` (a vinda da URL fica marcada e habilitada). O botão "Filtros" nunca fica `aria-disabled`, e o contador "Filtros (N)" conta só tecnologia e ano. `applyModalFilters` de `useProjectsFilters` escreve os três de uma vez. `Button` repassa `aria-disabled`. O ícone `filter` são três traços decrescentes. `TextField` aceita `reserveMessageSpace` (campo com aviso possível) e
  `focusOnError` (hook `useFocusOnError` de `src/hooks/`, só no primeiro campo inválido do envio).
- **SEO por tela** — toda tela pública nova declara `<PageMeta title description path />`
  (`src/components/`: canônica autorreferente, quatro `hreflang` com `x-default` em `en`, Open
  Graph e `twitter:card`; `params` e `image` opcionais) e `<JsonLd data={...} />` com o objeto de
  um construtor em `src/utils/` (`buildHomeJsonLd`, `buildProjectsJsonLd`; o `@id` da `Person` é
  `<URL canônica de />#person`), além do `<title>` e da `description` próprios. A URL absoluta vem
  de `buildAbsoluteUrl(path, language, params?)` (`getSiteUrl()` + `publicUrl` + `buildPath`);
  `getSiteUrl` é a única leitura de `VITE_SITE_URL` (só a origem, obrigatória no `npm run build`,
  validada por `scripts/resolveSiteUrl.ts`; localhost no dev e nos testes). `serializeJsonLd`
  escapa `<`. A imagem padrão `public/images/og-site.png` vem de `npm run og:image` e é
  versionada. Não encontrada e erro não usam o mecanismo.
- **Layout compartilhado** — `src/layouts/Main.layout.tsx` monta `SkipLink`, `Header`, o único
  `<main id="main-content">` (as páginas não renderizam `main`; a de erro, fora do layout, monta a
  própria moldura com `SkipLink`, `Header`, `main` e `Footer`, sem ler o erro lançado), o `Footer` e
  `<ScrollRestoration />`. O estado do menu mobile vem de `useMobileMenu`
  (`src/hooks/`), que o layout repassa ao `Header` e usa para aplicar `inert` em skip link, `main` e
  rodapé; `useRouteFocus` foca o `h1` na troca de rota (não na primeira carga nem na troca só de
  idioma). O item ativo vem de `getActiveNavItem` (`src/utils/`) sobre o caminho sem prefixo. Texto
  do cabeçalho e do rodapé vive em `common`. `Footer` (`variant` `default` ou `navigation`, esta só em
  `/contact`) lê o perfil por `profileApi`, nunca mostra skeleton nem erro e usa `CopyEmailButton`
  (hook `useCopyToClipboard`) e `ButtonLink` (`Link` com a aparência do `Button`); o ano do rodapé vem
  de `getBuildYear` (`src/utils/`), única leitura da constante `__BUILD_YEAR__` do `define` do
  `vite.config.ts`. A versão do rodapé (`v<versão>`) vem de `getAppVersion` (`src/utils/`), única leitura de `__APP_VERSION__`, que o `define` preenche com o `version` do `package.json`: quem sobe a versão no release atualiza o rodapé sozinho. Página não encontrada e de erro declaram `<meta name="robots" content={"noindex"} />`. `useDropdown` (`src/hooks/`) é o disclosure de `LanguageSelector` e `SettingsMenu` (abrir, fechar com Esc, clique ou foco fora, saída animada antes de desmontar, painel `inert` fechado), com a animação em `dropdownPanel.module.css`; `useNavIndicator` posiciona o indicador da navegação desktop. Teste de layout usa `createMemoryRouter` com os loaders de idioma.
- **`src/styles/`** — `global.css` guarda as CSS custom properties (cor, tipografia, espaçamento e
  afins) e o reset. CSS Module usa essas custom properties em vez de valor hardcoded; confira os
  nomes em `src/styles/global.css` antes de usar, e token global novo entra lá. Os nomes dos
  tokens seguem os de `tokens/` do handoff de design (ex.: `--danger-surface`/`--danger-ink`,
  nunca um prefixo próprio como `error`). Estilos de página ficam em
  `src/styles/pages/<nome>.module.css` e de componente em
  `src/styles/components/<nome>.module.css` (CSS Modules), importados como `import css from "..."`.
  A tipagem dos módulos vem de `src/types/declarations.d.ts` (`{ [key: string]: string }`): toda
  classe usada como `css.<algo>` precisa existir no módulo importado, porque uma classe inexistente
  vira `undefined` em runtime, sem erro de compilação.
- **Tema (claro/escuro)** — `[data-theme="dark"]` em `global.css` (o claro é `:root`), com
  `color-scheme`. `useTheme()` de `src/hooks/useTheme.ts` (`{ theme, setTheme, toggleTheme }`) é
  chamado em `App.tsx` e é a única via de escrita da escolha (`saveTheme`, chave
  `portfolio-frontend:theme` em `themeStorageKey.ts`); leitura, sistema e aplicação ficam em
  `src/utils/` (`readStoredTheme`, `getSystemTheme`, `applyTheme`). Um segundo script inline do
  `index.html` aplica `data-theme` e `theme-color` antes da pintura (chave e cores duplicadas;
  `themeScript.test.ts` compara com os utilitários). `?tema=` não existe. Foco é global
  (`:focus-visible` com `--focus-ring`; faixa escura usa `data-surface="band"`), e `a` em
  `global.css` é sublinhado: componente que se apresenta como botão zera no próprio módulo.
- **Movimento** — `useMotion()` de `src/hooks/useMotion.ts` (`{ motion, setMotion, toggleMotion }`,
  `full` ou `reduced`) espelha o tema: chamado em `App.tsx`, única via de escrita da escolha
  (`saveMotion`, chave `portfolio-frontend:motion` em `motionStorageKey.ts`), leitura, sistema e
  aplicação em `src/utils/` (`readStoredMotion`, `getSystemMotion`, `applyMotion`). A escolha vale
  mais que `prefers-reduced-motion`; sem ela, o sistema decide. `global.css` zera os `--dur-*`,
  animações e transições com `[data-motion="reduced"]` (e pela media query só enquanto não há
  `data-motion`); um terceiro script inline do `index.html` aplica `data-motion` antes da pintura
  (chave duplicada; `motionScript.test.ts` compara com os utilitários). Animação nova usa
  `--dur-*` e `--ease`, nunca duração fixa, para o botão e o sistema a desligarem. Movimentos
  extras (D57 a D60): `usePageTransition()` (`src/hooks/`, `true` só com movimento pleno) alimenta a
  prop `viewTransition` dos `Link` de navegação (o `LanguageSelector` fica sem); `startThemeTransition`
  (`src/utils/`, chamada por `useTheme.setTheme`) liga `data-theme-transition` no `<html>` durante a
  troca; `useReveal()` (`src/hooks/`, devolve `ref` e `revealProps`) e o componente `SkeletonSwap`
  são usados pela Início (destaques, cabeçalho da seção e botões finais pelo componente `Reveal`, e skeletons dos blocos), com `useReveal` escondendo só o que está abaixo da primeira tela depois da hidratação (o HTML pré-renderizado sai visível); Projetos usa `useReveal` nos cards (`ProjectCard`, por `revealIndex`) e `SkeletonSwap` na grade; `useDragScroll` (arrastar com o mouse região rolável), `useMediaQuery` (consulta de mídia por `useSyncExternalStore`), `useDebounce` e `useHasHydrated` (`false` só durante a hidratação, por `useSyncExternalStore`) completam `src/hooks/`; tokens `--dur-page`,
  `--stagger` e `--press-scale` são neutralizados nos dois blocos de movimento reduzido.
- **Alias de import `@/`** — `@/*` resolve para `src/*`. Configurado em dois lugares que precisam
  continuar concordando: `paths` no `tsconfig.app.json` (para o `tsc` e o editor) e `resolve.alias` no
  `vite.config.ts` (para o dev server e o build). Mexer em um sem o outro deixa o `tsc -b`
  verde e quebra o build, ou vice-versa. O Vitest herda o alias do mesmo `vite.config.ts`.
- **`public/`** — assets estáticos que o Vite copia como estão para a raiz de `dist/` no build, sem
  passar pelo bundler, e são referenciados por caminho absoluto (`/favicon.svg`). Arquivo estático
  novo (imagem, fonte, dado mock) entra aqui. Fonte é self-hospedada: `woff2` e licença em
  `public/fonts/`, `@font-face` em `src/styles/global.css` e `preload` no `index.html`, nunca
  CDN ou serviço de fonte de terceiros (Google Fonts e afins).

**`src/services/http/`** é o cliente HTTP (fetch cru, usado fora do RTK Query), um símbolo
por arquivo com `export default`: `apiUrl.ts` (a constante da URL da API, a **única** leitura de
`import.meta.env.VITE_API_URL` no código, vazia quando a variável não existe, para a URL poder ser
relativa e funcionar com proxy do Vite), `get.ts` e `post.ts` (`get<T>(path, options?)` e
`post<T>(path, body, options?)`, que chamam `fetch` com `apiUrl + path`, enviam `Accept-Language`
com `getLanguage()` a cada chamada e aceitam `options.signal` (`AbortSignal`); uma requisição
cancelada rejeita com o `AbortError` do `fetch`, sem embrulho) e `parseResponse.ts` (resposta
não-ok vira `Error` literal em português com o status e, quando há, o corpo). O chamador passa só
o caminho relativo. Timeout próprio não existe: quem quiser usa `AbortSignal.timeout(ms)`.

**`src/services/content/`** é a camada de dados local da v1 (R1), usada só pelos `queryFn` de
`src/store/api/` (e removida na #43): `readJson`/`readText` leem `public/` por `fetch`, os `load*` carregam os
registros de um idioma, e funções puras montam o que a API calcularia (busca, ordenação, paginação,
trajetória). `readText` guarda a promessa por caminho em `contentCache` (`projects.json` e `profile.json` são lidos uma vez por carga; falha não fica guardada; `clearContentCache()` esvazia; `readJson` analisa o texto a cada chamada, cada consumidor com objeto próprio). Página e componente nunca importam essa pasta nem JSON de `public/`. **Migração para o backend (#43):** busca, filtros por tipo, categoria, tecnologia e ano, ordenação, paginação, opções e contagens simulados aqui saem do frontend quando a #43 trocar cada `queryFn` por `query`; o servidor passa a receber `q`, `type`, `category`, `tech`, `year`, `sort`, `offset` e `limit`, e o cache de leitura sai com a camada. O conteúdo fica
em `public/content/<idioma>/` e `public/images/`, o modelo em branco em `content/template/` e a
validação do conteúdo em `src/services/content/validation/`, executada por
`src/services/content/test/content.test.ts` (`npm run content:check`). `scripts/` guarda os
comandos `content:*` (rodam com `tsx` e `tsconfig.node.json`); ID novo vem de `npm run content:id`.
`validateTranslation` reprova campo traduzível (`TRANSLATABLE_PATHS`) de `en`/`es` igual ao `pt-BR`
e documento `.md` traduzido igual: valor igual por natureza (nome próprio, sigla, termo
idêntico nos idiomas) entra por caminho em `translationExceptions.ts`, nunca frase.

**`src/enum/`** guarda as listas fixas de valores (`PROJECT_TYPES`, `PROJECT_CATEGORIES` etc.), um
símbolo por arquivo com `export default`, nomeado `<nome>.enum.ts`; os tipos de `src/types/` derivam
delas. **`src/utils/`** guarda funções puras reutilizáveis sem relação com React, como `publicUrl.ts`,
a **única** leitura de `import.meta.env.BASE_URL`. Se a pasta não existir, crie no primeiro uso.

A convenção de variáveis de ambiente é a do Vite: só variáveis com prefixo `VITE_`
são expostas ao código do cliente, e a leitura é `import.meta.env.VITE_ALGO`, nunca
`process.env.REACT_APP_ALGO`. A convenção é
materializada em `.env.example` (na raiz, com `VITE_API_URL` como exemplo) e na augmentação de
`ImportMetaEnv`/`ImportMeta` em `src/vite-env.d.ts`.

`BASE_PATH` (sem prefixo `VITE_`) é lida só em `vite.config.ts`, por `scripts/resolveBase.ts`, e define o `base`
do Vite (`/` por padrão); o código do cliente só vê `import.meta.env.BASE_URL`. `scripts/` tem o alias
`@scripts/*` (em `tsconfig.node.json` e `resolve.alias`) para os testes de `scripts/test/`.

A configuração de build fica em `vite.config.ts` na raiz (plugin React + bloco `test` do Vitest),
e a entrada da aplicação é o `index.html` da raiz, que carrega `/src/entry-client.tsx` como módulo.

## Estilo de código

**Todo identificador é em inglês.** Nome de componente, função, método, variável, propriedade,
atributo, interface/tipo, hook, arquivo e classe de CSS Module — tudo em inglês, sem mistura
(`name`/`active`, nunca `nome`/`ativo`; `isLoading`, nunca `estaCarregando`).

**Chave de tradução também é identificador**, em inglês. O texto que o usuário lê (conteúdo de
JSX, `label`, `placeholder`, `alt`, `aria-label`, `<title>`/`<meta>` de página) não fica no código:
vem de chave, por `t()` ou `<Trans>`, com o valor de cada idioma em `src/locales/` — escrito
primeiro em `pt-BR` e presente em `pt-BR`, `en` e `es`. A regra separa a linguagem do código da
linguagem do produto — `<SaveButton label={t("profile.saveChanges")} />` está correto:
`SaveButton`, `label` e a chave `profile.saveChanges` em inglês, o texto visível em cada idioma no
JSON correspondente.

Duas exceções ao "texto vem de chave". Mensagem de `Error` lançada no código do cliente
(`src/services/http/parseResponse.ts`, `src/entry-client.tsx`) é literal em português, como diagnóstico.
Mensagem de erro de API vem traduzida pelo backend: `get`/`post` de `src/services/http/` e o
`prepareHeaders` do RTK Query enviam o idioma ativo (`getLanguage()`) no header `Accept-Language`
de toda requisição. A descrição de `describe`/`it` nos testes é escrita em português.

**Export no final e um símbolo exportado por arquivo.** Cinco regras:

1. **Export sempre no final do arquivo**, nunca inline (`export function`, `export const`,
   `export default function`, `export type`, `export interface`).
2. **Um arquivo, um símbolo exportado**, seja valor (função, componente, hook, constante) ou tipo,
   sempre com `export default`. Arquivo que precisa exportar dois símbolos vira dois arquivos.
3. **Tipo exportado vive em `src/types/`, em arquivo próprio, nomeado pelo tipo**:
   `src/types/<dominio>/<NomeDoTipo>.types.ts` (PascalCase, igual ao tipo), com `export default`
   do tipo no final, importado com `import type <NomeDoTipo> from "@/types/<dominio>/<NomeDoTipo>.types"`.
   O domínio é a área do código dona do tipo, em lowerCamelCase (`language`, `store`), e a pasta
   nasce no primeiro tipo que precisar dela.
4. **Tipo não exportado fica no arquivo que o usa**, declarado sem `export`: `<Nome>Props` de um
   componente, `<Nome>State` e o retorno de um hook de página, tipos de request/response de um
   endpoint. Se outro arquivo precisar importar o tipo, ele deixa de ser local e vai para
   `src/types/` (regra 3). Não há exceção para "tipo que acompanha o valor".
5. **Fora da regra:** declaração de ambiente (`*.d.ts`: `declarations.d.ts`, `i18next.d.ts`,
   `vite-env.d.ts`), que não exporta símbolo próprio, mas augmenta/declara módulos e globais.

**Não escreva comentários no código.** Um bom código se explica sozinho: se um trecho só fica
compreensível com um comentário, o problema é o trecho — renomeie a variável/função, extraia uma
função com nome descritivo ou simplifique a lógica, em vez de comentar. Isso vale para `//`, `/* */`
e `{/* */}` em JSX.

O contexto que não cabe no código vai para onde ele é procurado de verdade: `README.md` (como usar),
a descrição do PR (por que mudou), o `spec.md` da feature em `.specs/` (decisões de projeto) e a
mensagem de commit (o que mudou naquele passo). Ao remover um comentário que carregava informação
útil, mova essa informação para um desses lugares — não a descarte.

Exceções, quando realmente necessárias: diretivas exigidas por ferramenta (`@ts-expect-error`,
`eslint-disable`, pragmas de build) e o cabeçalho de licença de terceiros. Nenhuma delas é
comentário explicativo.

### O que o oxlint verifica automaticamente

`npm run lint` (oxlint, configurado em `.oxlintrc.json`) cobre uma parte das convenções
acima mecanicamente; o restante continua sendo revisão manual do agente `reviewer`.

Verificado automaticamente pelo oxlint:

- `any` explícito → regra `typescript/no-explicit-any`.
- Array de dependências de hook incompleto → regra `react/exhaustive-deps` (equivalente ao
  `react-hooks/exhaustive-deps` do ecossistema ESLint clássico). A regra de que hooks
  só podem ser chamados incondicionalmente (rules-of-hooks) também é verificada, pela regra
  `react/hooks`.
- Import de namespace em vez de nomeado → regra `import/no-namespace`.
- Acessibilidade básica (`alt` em imagem, rótulo associado a campo de formulário, elemento
  clicável com suporte a teclado) → regras do plugin `jsx-a11y` (`jsx-a11y/alt-text`,
  `jsx-a11y/label-has-associated-control`, `jsx-a11y/click-events-have-key-events`, entre outras
  do conjunto padrão do plugin), ativas sempre que o plugin `jsx-a11y` está habilitado,
  independente da categoria de severidade configurada.
- Import interno usar o alias `@/` em vez de `../` → regra `import/no-relative-parent-imports`.
- Texto de UI literal em vez de chave de tradução → regra `react/jsx-no-literals`, ligada como
  `error` com `noStrings: true`, `ignoreProps: true` e `restrictedAttributes` com `title`, `alt`,
  `placeholder`, `aria-label`, `aria-description`, `label` e `content`. Acusa texto solto como
  filho (`<p>Olá</p>`), string ou template literal em expressão como filho (`<p>{"Olá"}</p>`) e
  string literal nos atributos listados (`alt="Foto"`, `content="Texto"`). `ignoreProps: true`
  deixa passar prop que não é texto de UI (`type="button"`, `name="description"`,
  `i18nKey="..."`, template literal de `className`). Um bloco `overrides` desliga a regra em
  `**/*.test.ts` e `**/*.test.tsx`, onde texto literal é a asserção.

Continua sendo revisão manual do `reviewer` (o oxlint não cobre):

- Separação de responsabilidades entre componente/hook/service ("Lógica fora do JSX") — convenção
  arquitetural, não regra de lint mecânica.
- Não guardar em `useState` um valor derivável do que já existe em render — idem, decisão de
  design, não mecânica.
- Ausência de comentários no código — não existe regra de lint que proíba comentários.
- Identificadores em inglês — não existe regra de lint que verifique o idioma de um identificador.
- Texto de UI entre chaves num atributo da lista de `restrictedAttributes` (`title={"Dica"}`) — o
  único formato de texto literal que `react/jsx-no-literals` com `ignoreProps: true` não acusa.
  `alt={""}` de imagem decorativa não é texto de UI e não deve ser apontado.
- Subpath import quando o pacote publica (`lodash/debounce` em vez de `lodash`) — não existe
  regra no oxlint para essa convenção.
- `.map()` que renderiza JSX com corpo de mais de 3 linhas deve ser extraído para um componente
  dedicado em vez de ficar inline — não existe regra de lint que meça linhas de corpo de `.map()`:

    ```tsx
    {products.map((product) => (
        <li key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span>{product.price}</span>
        </li>
    ))}
    ```

    vira

    ```tsx
    {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
    ))}
    ```

### Imports

Três regras. A primeira é sobre onde o módulo está; as duas seguintes, sobre reduzir a quantidade
de JavaScript no arquivo buildado — e nenhuma dessas duas reduz o `node_modules`, cujo tamanho
depende só do `package.json` e das dependências transitivas instaladas, não da forma como o código
importa.

**Import interno usa o alias `@/`, nunca `../`.** Um import que sobe de pasta (`../`,
`../../`) é frágil: quebra ao mover o arquivo de lugar. Use `@/styles/pages/home.module.css` em
vez de `../styles/pages/home.module.css`. Import para a mesma pasta ou descendo a partir da
própria localização (`./styles/global.css` em `src/App.tsx`) continua válido — o problema é subir,
não descer. Imports de pacote (`react`, `react-router-dom`) não são afetados.

**Import nomeado, nunca import de namespace.** Importe só o que for usado — prefira

```ts
import { StrictMode } from "react";
```

a

```ts
import * as React from "react";
```

A primeira forma permite tree-shaking: o Rollup (via Vite) descarta do bundle o que não foi
referenciado. O namespace obriga o bundler a manter o módulo inteiro, porque qualquer propriedade
pode ser acessada em tempo de execução.

**Subpath import quando o pacote publicar.** Importe pelo caminho específico — prefira

```ts
import debounce from "lodash/debounce";
```

a

```ts
import { debounce } from "lodash";
```

O ganho aparece em pacotes que publicam um arquivo por função/módulo (`lodash`, `date-fns`) ou por
grupo (bibliotecas de ícones, ex. `react-icons/fi`), onde importar do índice arrasta o pacote
inteiro. Limites: nem todo pacote expõe subpaths — muitos restringem o que é acessível pelo campo
`exports` do `package.json`, e importar um caminho não declarado quebra o build, então confira o
que o pacote publica em vez de presumir. Não se aplica ao React, que só expõe `react` e
`react/jsx-runtime`: não existe subpath por hook porque `useState` não é um módulo isolado, é uma
chamada ao dispatcher interno do runtime. E pacotes ESM com bom tree-shaking (`lodash-es`,
`date-fns` v3) já resolvem isso pela primeira regra — subpath é a saída para pacotes CJS ou mal
empacotados.

## Padrão de branches, commits e PRs

### Tipos de alteração

O `<Tipo>` de branch, commit e título de PR vem sempre desta tabela:

| Tipo     |     Ícone     | Descrição                                                                   |
| -------- | :-----------: | --------------------------------------------------------------------------- |
| Fix      |     :bug:     | Correção de bugs.                                                           |
| Feat     |  :sparkles:   | Desenvolvimento de novas funcionalidades (features).                        |
| Hotfix   |  :ambulance:  | Correção de bugs a partir da branch de produção (main).                     |
| Refactor |   :recycle:   | Melhorias no código (ex.: reestruturações; melhorias no código).            |
| Test     |  :test_tube:  | Criação ou alteração de arquivos de teste.                                  |
| Perf     |     :zap:     | Mudanças a fim de melhorar a performance.                                   |
| Style    |     :art:     | Mudanças apenas em estilo de código (ex.: formatação; clean code).          |
| Docs     |    :bulb:     | Mudanças relacionadas à documentação.                                       |
| Build    |   :rocket:    | Mudanças em arquivos de build (ex.: Vite; `package.json`).                  |
| Chore    | :see_no_evil: | Mudanças sem impacto direto na aplicação (ex.: alterações no `.gitignore`). |
| Revert   |   :rewind:    | Reverter algum commit.                                                      |

### Issues

Toda issue entra no projeto [Portfolio](https://github.com/users/felipe-sant/projects/16), que
reúne os repositórios do portfólio, com Status `Backlog` (o PO revisa e move), `Marco` do
`docs/product/roadmap.md` (ou `Pessoal`, para a trilha fora da v1) e um único `Tipo` (`FEAT`, `DOC`
ou `BUG`). O tipo vive só nesse campo: as labels `enhancement`, `bug` e `documentation` não são
usadas. Labels indicam só a área (`frontend`, `backend`, `infra`, uma ou mais). Toda issue que
depende de outra registra a relação como "blocked by" do GitHub
(`POST /repos/{owner}/{repo}/issues/{n}/dependencies/blocked_by`), além da linha "Depende de" do
corpo.

### Branches

```
<tipo>/<número-da-issue>-<descrição-curta>
```

Tipo em minúsculas (`feat/<número>-agentes-e-skills`). Sem issue aberta, o número é omitido
(`chore/update-gitignore`).

Duas branches de ambiente, nenhuma recebe push direto:

- **`staging`** — ambiente de testes e base do desenvolvimento. Toda branch de trabalho nasce de
  `origin/staging` atualizada e volta para ela por PR.
- **`main`** — produção. Só recebe PR vindo de `staging` (promoção do que foi validado) ou de
  `hotfix/*`.

Hotfix é a exceção: nasce de `origin/main`, volta por PR para a `main` e, depois do merge, a `main`
é levada de volta para a `staging` por PR, para as duas não divergirem.

### Commits

```
<Tipo> <ícone> [#<número-da-issue>] <descrição>
```

Exemplo: `Fix :bug: [#<número>] Troca <a href> por <Link> na página NotFound`. Sem issue
relacionada, o `[#...]` é omitido (`Chore :see_no_evil: Atualiza .gitignore`).

Commits são atômicos: uma mudança concluída por commit, nunca várias tarefas acumuladas.

### Pull Requests

- Toda alteração passa por PR para a `staging`, sem push direto (exceção: `hotfix/*`, ver
  "Branches"). A promoção para produção é um PR de `staging` para `main`, com título no padrão de
  commit (`Chore :see_no_evil: Promove staging para produção`) e a lista das issues incluídas.
- O autor se atribui já na criação (`gh pr create --assignee @me`) e aplica as labels de área
  da issue (`frontend`, `backend`, `infra`).
- A descrição referencia a issue relacionada (`Closes #<número>`). A branch padrão do repositório
  é a `staging`, então a issue fecha no merge do PR para a `staging`.
- O título segue o padrão do commit principal (`<Tipo> <ícone> [#<número>] <descrição>`).
- A descrição segue a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, não um corpo livre, com as
  seções Descrição, Alterações, Decisões técnicas, Como testar, Evidências e Impactos e pontos de
  atenção.

Quando `npm run build`, `npm run lint` e `npm test -- --run` já rodaram localmente (verificação
que o agente `executor` faz a cada tarefa, ver `.claude/agents/executor.md`) antes do `git push`,
o push é feito com `git push --no-verify` — a validação manual já cobre o que um hook rodaria de
novo, então repetir via hook no momento do push seria redundante.

## Tooling de IA (agents, skills e spec-driven)

- `.claude/agents/` — cinco papéis num fluxo de TDD, `sdd` → `executor` → verificação manual do PO →
  `reviewer` → `qa` → `reviewer` → `tester` → `reviewer`: `sdd` (só planeja, escreve
  `spec.md`/`tasks.md` em `.specs/`, nunca toca em `src/`; toda tarefa lista os "Testes" a provar e o
  "Gate"), `executor` (implementa a feature inteira de um `tasks.md` já aprovado, em branch dedicada,
  em TDD: teste antes do código, um por vez, vermelho → verde → refatora, gate e tabela de adequação
  por tarefa, commit atômico com teste e código juntos), `reviewer` (audita contra este arquivo,
  somente leitura, e revisa o trabalho do estágio anterior, nunca o próprio), `qa` (testa a tela no
  navegador com Playwright contra `docs/`, escreve os testes de `e2e/` e reporta bugs; só escreve em
  `e2e/`; só entra se a feature tem tela) e `tester` (valida toda a suíte, audita a adequação dos
  testes, roda o sensor de discriminação e cria testes de unidade que faltam; só escreve em
  `src/**/test/` e `src/testUtils/`). Regras do fluxo:
    - **TDD só para lógica e comportamento** (funções, hooks, store, comportamento de componente e
      página, textos nos três idiomas, bug com o teste que reproduz primeiro). Aparência (CSS, hover,
      espaçamento) não entra em TDD.
    - **Estado vermelho nunca é commitado** nem enviado: ele vive só no working tree entre o teste
      e o código, e o push só acontece no fim do fluxo, depois do último `reviewer`.
    - **Feature com tela:** ao fim do `executor`, a sessão principal sobe a aplicação
      (`npm run dev`), o PO verifica à mão e pede ajustes, e só depois o fluxo segue para o
      `reviewer`.
    - **Pedidos de correção:** quem encontra problema devolve por responsável (`executor` para código,
      `qa` para E2E, `tester` para teste de unidade, `sdd` para spec); a sessão principal orquestra:
      despacha o responsável, chama o `reviewer` para revisar só a correção e repete até não restar
      bloqueante. O `executor` não faz push nem abre PR nesse fluxo: o PR abre depois do último
      `reviewer`.
- `.claude/skills/` — conhecimento carregável sob demanda. São dez, separadas pela pasta do
  artefato: `react-page-scaffold` (página em `src/pages/` + CSS Module + registro de rota),
  `react-component-scaffold` (componente reutilizável em `src/components/` + CSS Module em
  `src/styles/components/`), `vitest-specialist` (teste em `test/` por diretório com Vitest +
  Testing Library, `src/setupTests.ts` e o bloco `test` do `vite.config.ts`),
  `redux-store-scaffold` (slice em `src/store/slices/` + registro no `rootReducer` + hooks tipados),
  `rtk-query-endpoint-scaffold` (endpoints em `src/store/api/` via `api.injectEndpoints`),
  `tdd-patterns` (ciclo vermelho, verde, refatora, adequação dos testes e sensor de discriminação;
  usada por `executor`, `tester` e `reviewer`) e, do agente `qa`, `playwright-e2e` (teste de `e2e/`),
  `accessibility-audit` (auditoria de acessibilidade contra `docs/product/accessibility.md`),
  `screen-qa` (roteiro de QA exploratório de uma tela) e `nfr-verification` (requisitos não
  funcionais de `docs/product/non-functional-requirements.md`).
- `.specs/` — specs por feature/bug (`.specs/features/<slug>/`, `.specs/bugs/<slug>/`), a partir de
  `.specs/_template/`. As pastas de trabalho de cada spec são gitignored (planejamento local); só o resumo
  `_archive/<slug>.md` de cada spec fechada, escrito pelo `executor`, é versionado.
  O estado vive no campo `**Status:**` do `spec.md` (`rascunho` → `em-revisao` → `aprovada` →
  `em-andamento` → `implementada`); só humano promove para `aprovada`.
- `docs/` — documentação versionada **só deste frontend**: visão do produto e glossário
  (`docs/product/`), design system (`docs/design/`), arquitetura (`docs/architecture/`), ADRs
  (`docs/adr/`), diagramas de fluxo e entidades (`docs/diagrams/`), ambientes (`docs/setup/`) e o
  modelo de documentação de tela (`docs/screens/`). O sistema inteiro fica no repositório pai,
  que reúne backend e frontend como submódulos, e o contrato da API fica no backend. Índice em
  `docs/README.md`; o `sdd` não escreve lá, só em `.specs/`.

Ao mudar uma convenção deste arquivo, verifique se algum agente ou skill a repete — eles citam
este `CLAUDE.md` como fonte da verdade, mas duplicam os pontos que precisam aplicar sozinhos.
