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
do tipo das chaves e os testes de tela afirmam o texto em português. **O fallback de runtime é
`en`**, o que o usuário vê quando nenhuma fonte de detecção dá um idioma suportado. As duas coisas
são independentes.

## Produto

Este repositório é o frontend do **portfólio pessoal de Luiz Felipe dos Santos**, desenvolvedor
full stack. O usuário é ao mesmo tempo cliente, PO e dev: ele decide escopo e prioridade e aprova
as specs. Esta seção é um resumo; o detalhe vive em `docs/` e no handoff de design.

**Handoff de design:** `/home/felipe/faculdade/design_handoff_portfolio` é a fonte de verdade do
design (R3). Reaproveite `tokens/` (nomes e valores dos tokens) e use `components/` como ponto de
partida dos componentes. Não copie o HTML das telas (`*.dc.html`), `support.js`, `image-slot.js`
nem os sketches de `assets/` (não são imagens de produção). Onde o handoff diverge das convenções
deste repositório, as convenções prevalecem: fonte self-hospedada em vez de Google Fonts, CSS
Module em vez de classe global `.ds-*` e código sem comentários.

**Rotas:** cinco telas, das quais hoje só `/` existe no código (as demais vêm nas specs de tela):

- `/` (Início): primeira impressão, com quem é, o que faz agora, projetos em destaque e stack.
- `/projetos` (Projetos): encontrar um projeto por busca, tipo, categoria ou tecnologia.
- `/projetos/:slug` (Projeto): estudo de caso, com galeria, documentação e ficha técnica.
- `/informacoes` (Informações): sobre mim, stack, complementos e trajetória.
- `/contato` (Contato): formulário de mensagem e canais diretos.

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
- **R3 — O handoff é a fonte de verdade do design.** Tokens, componentes, voz e copy,
  acessibilidade e responsividade seguem o handoff, com as convenções do repositório prevalecendo
  onde divergem.

**Pendências do handoff:** menu mobile (painel aberto não desenhado), logo (hoje placeholder),
imagens reais dos projetos e foto de perfil, rodapé (decisão sobre o fundo), backend do formulário
de contato e renderizador de markdown da documentação do projeto.

**Onde ler mais:** `docs/product/overview.md` (visão, escopo, requisitos e pendências),
`docs/product/glossary.md` (glossário), `docs/design/design-system.md` (design system),
`docs/diagrams/` (fluxo de navegação e entidades) e `docs/architecture/frontend.md` (arquitetura).

## Comandos

```bash
npm run dev      # dev server do Vite (porta padrão 5173)
npm run build    # typecheck + build de produção em dist/
npm run preview  # serve o conteúdo de dist/ já gerado — depende de um npm run build anterior
npm test         # Vitest em watch mode (o script é `vitest`, sem `run`)
npm test -- --run                            # execução one-shot (CI, agente, terminal não-interativo)
npm test -- --run src/pages/test/Home.page.test.tsx   # um arquivo específico
npm run typecheck # checagem de tipos (tsc -b) de src/ e vite.config.ts
npm run lint      # oxlint sobre o projeto (configuração em .oxlintrc.json)
npm run lint:fix  # mesma coisa, aplicando as correções automáticas possíveis (oxlint --fix)
npm run format    # prettier --write em **/*.{ts,tsx,css,json,md,yml,html}, conforme .prettierrc e .prettierignore
npm run test:cov  # vitest run --coverage — suíte inteira + relatório de cobertura
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
`"pt-BR"`, não `FALLBACK_LANGUAGE`, e o reset não grava nada por causa do `caches: []`. Teste de
tela afirma o texto em português, nunca a chave (o i18next devolve a própria chave quando falta
tradução), não mocka `react-i18next` e troca de idioma com `setLanguage` dentro do `it`. Para
simular uma nova carga de página (detecção do zero e persistência do `?lng=`), prepare URL,
`navigator` e `localStorage`, rode `vi.resetModules()` e faça `await import("@/i18n/i18n")`,
como em `src/i18n/test/i18n.test.ts`; restaure URL e stubs no fim.
Teste de componente ou hook que lê a store usa `renderWithStore(ui, { preloadedState })` de
`src/testUtils/renderWithStore.tsx`, que cria `createStore(preloadedState)` por chamada (estado e
cache do RTK Query isolados) e devolve o `render` junto da `store`. O teste de store injeta o
próprio endpoint com `api.injectEndpoints`, stuba o `fetch` com `vi.stubGlobal` e define
`VITE_API_URL` absoluta com `vi.stubEnv` (o `Request` do Node não aceita URL relativa), com
`vi.resetModules()` e import dinâmico para a constante ser relida; o endpoint injetado persiste
enquanto o módulo vive, então o nome é único por arquivo (ver `src/store/test/api.test.ts` e
`src/testUtils/test/renderWithStore.test.tsx`).
Cada formato de teste tem seu jeito: página renderizada direto, árvore de rotas em
`createMemoryRouter` (para verificar a rota `*`, por exemplo), layout com `<Outlet />` preenchido
por rota-filha, módulo com `fetch` stubado via `vi.stubGlobal`, componente com interação
(`user-event`), hook com `renderHook` e função pura. A skill `vitest-specialist` traz um trecho de
cada formato.

Ficam sem teste `src/index.tsx`, que só chama `createRoot` num `#root` que não existe fora do
`index.html`, e a pasta `src/types/`, que só declara tipo e não tem runtime.

`npm run test:cov` roda a suíte inteira com `@vitest/coverage-v8` (bloco `test.coverage` em
`vite.config.ts`), gerando relatório nos formatos `text`, `json`, `json-summary` e `html` em
`coverage/` (gitignored) e aplicando um threshold mínimo de 80% em statements, branches, functions
e lines — abaixo disso o comando termina com erro. `exclude` cobre os arquivos sem runtime
relevante já citados acima, mais `vite.config.ts`, `src/setupTests.ts` e o glob `src/types/**`.

O bloco `test` usa `pool: "vmThreads"`: o `jsdom` é criado uma vez por worker e cada arquivo roda
num contexto de VM isolado. Não troque por `isolate: false`, que compartilha o estado entre
arquivos e faz o resultado depender da ordem de execução. Como o worker é reaproveitado, teste que
stuba com `vi.stubGlobal`/`vi.stubEnv` restaura no `afterEach` com
`vi.unstubAllGlobals()`/`vi.unstubAllEnvs()`.

O CI (`.github/workflows/`) roda `npm run build`, `npm run lint` e a suíte de testes, os mesmos
comandos da verificação local.

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

- **`App.tsx`** renderiza o `Router` dentro do `<Provider store={store}>` do react-redux e importa, por efeito colateral, `@/i18n/i18n` (que
  inicializa a instância do i18next) e o `global.css`; `@/i18n/i18n` está no `allow` de
  `import/no-unassigned-import` no `.oxlintrc.json`. Metadados (`<title>`, `<meta>`) são
  declarados por cada página com as tags nativas do React 19, escritas dentro do JSX da própria
  página, que sobem sozinhas para o `<head>`, sem biblioteca nem wrapper, e com valor vindo de chave:
  `<title>{t("meta.title")}</title>` e
  `<meta name="description" content={t("meta.description")} />`.
- **`src/i18n/`** — configuração de idioma (i18next, react-i18next e
  i18next-browser-languagedetector), um símbolo público por arquivo com `export default`.
  `i18n.ts` cria a instância com `createInstance()` (import nomeado de `i18next`; `i18next.use(...)`
  no export default cai em `import/no-named-as-default-member`), registra `LanguageDetector` e
  `initReactI18next` — que torna a instância global, sem provider nem wrapper de render — e inicia
  de forma síncrona (`initAsync: false`) com `resources` (`resources.ts`), `defaultNS: "common"`,
  `supportedLngs: SUPPORTED_LANGUAGES` (`supportedLanguages.ts`) e
  `fallbackLng: FALLBACK_LANGUAGE` (`fallbackLanguage.ts`, valor `en`). Não existe constante de
  "idioma padrão" nem de língua de referência: `pt-BR` é referência pelo tipo de `resources.ts`,
  não pelo runtime. A detecção segue `["querystring", "localStorage", "navigator"]`, com
  `?lng=` e `LANGUAGE_STORAGE_KEY` (`languageStorageKey.ts`, único lugar onde o valor da chave
  aparece), e `convertDetectedLanguage` passa todo código por `resolveSupportedLanguage`
  (`resolveSupportedLanguage.ts`: código exato, ou `es-*` → `es`, `en-*` → `en`, `pt`/`pt-*` →
  `pt-BR`, ou `undefined`). A ordem efetiva é escolha salva (por `setLanguage` ou por um `?lng=`
  válido) → idioma do navegador → `en`; navegador em `fr` abre em `en`.
    - **`caches: []`: o detector nunca grava**, para que quem não escolheu idioma acompanhe o
      idioma do navegador a cada carga.
    - **`saveLanguage` é o único código que escreve em `LANGUAGE_STORAGE_KEY`**, interno à pasta,
      chamado só por `setLanguage` e por `i18n.ts` logo depois do `init()`, quando a URL tem `?lng=`
      suportado. `i18n.ts` não importa `setLanguage`, para não criar ciclo.
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
  `home`, `notFound`, `mainLayout`); `common` guarda texto compartilhado (`backHome`, `loading`)
  e texto fixo de componente de `src/components/`. Chave em inglês, lowerCamelCase, hierárquica por
  papel (`meta.title`, `meta.description`, `heading`, `filters.category.academic`). Página com
  namespace próprio chama `useTranslation("home")`; quem também usa chave de `common` carrega os
  dois, `useTranslation(["notFound", "common"])`, e chama `t("common:backHome")`, senão a chave não
  tipa. Texto com marcação no meio usa `<Trans>` com `t={t}`, `i18nKey` e
  `components={{ strong: <strong /> }}`, com o `<strong>` escrito no próprio valor do JSON.
  Namespace novo entra nos três idiomas, em `src/i18n/resources.ts` e no `ns` de
  `src/i18n/i18n.ts`.
- **`src/routers/`** — ponto único de registro de rotas. `routes.tsx` tem `routes`
  (`RouteObject[]`, export default, com `MainLayout` como rota-pai e as páginas como filhas, os
  paths vindos de `ROUTES` em `paths.ts`) e `Router.tsx` tem o `Router` (export default), que cria
  o data router com `createBrowserRouter(routes)` e renderiza um `RouterProvider`. A rota `*` cai
  em `NotFound` e fica por último. Toda página nova entra em `routes.tsx`. O teste renderiza
  `routes` com `createMemoryRouter(routes, { initialEntries })` e `RouterProvider`.
  As rotas-filhas de `MainLayout` são `lazy` e o único `<Suspense>` fica em volta do `<Outlet />`
  de `src/layouts/Main.layout.tsx`: página nova não precisa (nem deve) ter o próprio `<Suspense>`.
  Navegação interna usa `<Link to="...">`/`useNavigate` do `react-router-dom` com o path de
  `ROUTES`, nunca `<a href="...">`: âncora crua força reload completo da página e descarta o estado
  da aplicação.
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
      concatenado, store nova a cada chamada) e `store.ts` (a instância da aplicação).
    - `useAppDispatch.ts` e `useAppSelector.ts`: `useDispatch.withTypes<AppDispatch>()` e
      `useSelector.withTypes<RootState>()`; código de aplicação usa só esses, com seletor estreito
      (`useAppSelector((state) => state.x.y)`), nunca o estado inteiro.
    - `slices/<nome>.slice.ts`: `createSlice`, export default do próprio slice, `<Nome>State` local.
    - Tipos em `src/types/store/RootState.types.ts` (`ReturnType<typeof rootReducer>`),
      `AppStore.types.ts` (`ReturnType<typeof createStore>`) e `AppDispatch.types.ts`
      (`AppStore["dispatch"]`), um por arquivo, importados com `import type`.
    - O `<Provider store={store}>` fica em `App.tsx`, em volta do `<Router />`. Estado que só uma
      página usa continua `useState` no hook da página; estado compartilhado vai para um slice;
      dado do servidor vai para um endpoint do RTK Query. Idioma continua em `src/i18n/`.
    - Refetch on focus/reconnect (`setupListeners`) segue desligado, o padrão do RTK Query.
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

A convenção de variáveis de ambiente é a do Vite: só variáveis com prefixo `VITE_`
são expostas ao código do cliente, e a leitura é `import.meta.env.VITE_ALGO`, nunca
`process.env.REACT_APP_ALGO`. A convenção é
materializada em `.env.example` (na raiz, com `VITE_API_URL` como exemplo) e na augmentação de
`ImportMetaEnv`/`ImportMeta` em `src/vite-env.d.ts`.

A configuração de build fica em `vite.config.ts` na raiz (plugin React + bloco `test` do Vitest),
e a entrada da aplicação é o `index.html` da raiz, que carrega `/src/index.tsx` como módulo.

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
(`src/services/http/parseResponse.ts`, `src/index.tsx`) é literal em português, como diagnóstico.
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
própria localização (`./routers/Router` em `src/App.tsx`) continua válido — o problema é subir,
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

Nunca use uma label do GitHub (`enhancement`, `bug` como label, etc.) no lugar do tipo: a label
classifica a issue, o tipo classifica a mudança.

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
- O autor se atribui já na criação (`gh pr create --assignee @me`) e aplica labels que já existem
  no repositório (`bug`, `enhancement`, `documentation`, etc.).
- A descrição referencia a issue relacionada (`Closes #<número>`). O GitHub só fecha a issue
  quando o PR entra na branch padrão (`main`): no PR para a `staging` a referência fica registrada,
  e o PR de promoção `staging` → `main` repete o `Closes #<número>` de cada issue incluída.
- O título segue o padrão do commit principal (`<Tipo> <ícone> [#<número>] <descrição>`).
- A descrição segue a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`, não um corpo livre, com as
  seções Descrição, Alterações, Decisões técnicas, Como testar, Evidências e Impactos e pontos de
  atenção.

Quando `npm run build`, `npm run lint` e `npm test -- --run` já rodaram localmente (verificação
que o agente `executor` faz a cada tarefa, ver `.claude/agents/executor.md`) antes do `git push`,
o push é feito com `git push --no-verify` — a validação manual já cobre o que um hook rodaria de
novo, então repetir via hook no momento do push seria redundante.

## Tooling de IA (agents, skills e spec-driven)

- `.claude/agents/` — três papéis que formam o fluxo planejar → aprovar → executar → revisar:
  `sdd` (só planeja, escreve `spec.md`/`tasks.md` em `.specs/`, nunca toca em `src/`), `executor`
  (implementa um `tasks.md` já aprovado, em branch dedicada, com commits atômicos, e sempre chama
  o `reviewer` ao terminar) e `reviewer`
  (audita o resultado contra este arquivo, somente leitura).
- `.claude/skills/` — conhecimento carregável sob demanda. São cinco, separadas pela pasta do
  artefato: `react-page-scaffold` (página em `src/pages/` + CSS Module + registro de rota),
  `react-component-scaffold` (componente reutilizável em `src/components/` + CSS Module em
  `src/styles/components/`), `vitest-specialist` (teste em `test/` por diretório com Vitest +
  Testing Library, `src/setupTests.ts` e o bloco `test` do `vite.config.ts`),
  `redux-store-scaffold` (slice em `src/store/slices/` + registro no `rootReducer` + hooks tipados)
  e `rtk-query-endpoint-scaffold` (endpoints em `src/store/api/` via `api.injectEndpoints`).
- `.specs/` — specs por feature/bug (`.specs/features/<slug>/`, `.specs/bugs/<slug>/`), a partir de
  `.specs/_template/`. As pastas de spec são gitignored: planejamento local, fora do histórico.
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
