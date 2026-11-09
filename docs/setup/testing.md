# Testes

Convenção e mecânica dos testes do frontend: unidade e integração com Vitest e Testing Library, e ponta a ponta com Playwright. Os comandos estão em [`development.md`](development.md); a medição do E2E, o ranking dos testes lentos e o desenho do sharding estão em [`e2e-performance.md`](e2e-performance.md). A arquitetura geral está em [`../architecture/frontend.md`](../architecture/frontend.md).

## Testes de unidade e integração (Vitest)

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
`jsdom` reporta `en-US`. O `beforeEach` também stuba `Element.prototype.scrollIntoView` (o `jsdom` não o implementa) e chama `clearContentCache()` (cache de leitura de `src/services/content/`), e `failFetchAfter`/`holdFetchAfter` o limpam ao criar o stub: stub novo significa memória vazia. Teste de
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
verificado no navegador real (#55). O `axe.run` é lento no `jsdom`; o `testTimeout` global de 30s (`vite.config.ts`, com `hookTimeout` igual) o cobre, então o `it` que chama o helper não declara timeout próprio. Teste de rota (`App.test.tsx`, `routes.test.tsx`) não chama.
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

## Testes ponta a ponta (Playwright)

A suíte ponta a ponta fica em `e2e/` (`playwright.config.ts` na raiz, `tsconfig.e2e.json`), com
sufixo `.spec.ts`, fora do Vitest (`e2e/**` em `test.exclude`) e da cobertura. Roda só em Chromium
contra `npm run preview:fatec` (`base` `/ra2581392423047/`), que serve o `dist/` já pronto: rode
`npm run build:fatec` antes, porque `test:e2e` não builda. Os quatro projetos de ambiente (`mobile-light`,
`mobile-dark`, `desktop-light`, `desktop-dark`: 390 e 1280px, `colorScheme` claro e escuro,
`reducedMotion`) rodam só os specs de `perEnvironmentSpecs`; os de `independentSpecs` rodam uma vez, no projeto `independent` (1280px, tema claro, `reducedMotion`). **Todo spec novo entra em exatamente uma das duas listas de `e2e/support/specClassification.ts`** (`scripts/test/specClassification.test.ts` falha com spec fora delas): `independentSpecs` só para o que não depende de viewport, tema, movimento nem axe (conteúdo, arquivos de máquina, HTML sem JavaScript); spec com `expectNoAxeViolations`, `emulateMedia`, `setViewportSize`, `viewportSize`, `testInfo`, `test.skip(` ou `test.fail(` por tamanho é obrigatoriamente por ambiente. O CI roda com `fullyParallel` e `workers` fixo no `playwright.config.ts` e `retries: 1`; medição, ranking dos testes lentos (`npm run test:e2e:timings` e `npm run e2e:rank`) e o desenho do sharding em `docs/setup/e2e-performance.md`. Seletor é `getByRole` com nome em português, rota abre sem barra
inicial (relativa ao `baseURL`). Toda tela nova acrescenta o caminho em `e2e/support/routesUnderTest.ts`
(o axe, com `color-contrast` ligada, roda em todas) e, se tiver teclado próprio, um roteiro em
`e2e/<tema>.spec.ts`. Violação do axe se corrige na marcação ou no CSS, nunca desligando regra. Os projetos rodam com `reducedMotion: "reduce"`: roteiro que precisa de movimento pleno usa `test.use({ reducedMotion: "no-preference" })`. Elemento com `useReveal` leva `suppressHydrationWarning` (o `data-reveal` do HTML do servidor difere do primeiro render no navegador). **Teste E2E sem instabilidade:** espera por estado, nunca por tempo (auto-wait, `expect.poll` ou `toPass` com `timeout` e `intervals` delimitados; `waitForTimeout`, mais `retries` e regra do axe desligada são proibidos); depois de navegar espere o foco do `h1` antes de interagir, e o `role="status"` do esqueleto sair antes de medir posição; repita o spec alterado com `--repeat-each=30 --retries=0` preso a poucos núcleos (`taskset -c 0,1`) antes do PR (`docs/setup/e2e-performance.md`, seção "Testes instáveis").

**Toda tela nova entrega os E2E dos próprios fluxos**: clique e navegação, estados de carregamento e erro (forçados por `page.route`) e HTML sem JavaScript (`javaScriptEnabled: false`), com o ID do requisito no título (`"RF-LAY-18: o botão alterna o tema"`) e a prova de que o teste falha quando o comportamento quebra (mutação desfeita). A base são `e2e/theme`, `motion`, `language`, `navigation`, `footer`, `home-flows`, `not-found` e `no-javascript`; o apoio fica em `e2e/support/` (`readContent`, `readProfile`, `readFeaturedProjects`, `readAppVersion`, `readStackOffset`, `openPreferences`, `uiTexts`). O E2E não importa `src/`: o texto de cada idioma de que ele precisa vive em `uiTexts`.
