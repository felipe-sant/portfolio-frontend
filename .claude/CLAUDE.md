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

**Rotas:** cinco telas, todas existentes hoje no código: Início, Projetos (`/projects`), Projeto (`/projects/:id` e `/projects/:id/docs/:name`), Informações (`/about`) e Contato (`/contact`),
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
npm run dev          # dev server do Vite (porta 5173)
npm run typecheck    # tsc -b
npm run lint         # oxlint (npm run lint:fix aplica as correções)
npm test -- --run    # Vitest one-shot (npm test puro entra em watch mode)
npm run test:cov     # suíte inteira + cobertura mínima de 80%
npm run build        # typecheck + build + pré-renderização + arquivos de SEO
npm run test:e2e     # Playwright + axe; exige npm run build:fatec antes
npm run format       # prettier --write
npm run changeset    # changeset do PR (-- --empty quando não altera a versão)
```

A lista completa, o CI, o Husky e o `.editorconfig` estão em [`docs/setup/development.md`](../docs/setup/development.md); a convenção e a mecânica de teste, em [`docs/setup/testing.md`](../docs/setup/testing.md). Regras de teste:

- O teste fica em `test/` ao lado do arquivo testado (`src/pages/test/Home.page.test.tsx`), importa o alvo por `@/` e usa `.test.ts` para o que não renderiza JSX. Descrição de `describe`/`it` em português.
- Teste de tela afirma o texto em português, nunca a chave, não mocka `react-i18next` e troca de idioma com `setLanguage` dentro do `it`. Teste de rota abre o caminho com prefixo (`/pt-BR`).
- Teste que lê a store usa `renderWithStore` de `src/testUtils/`.
- Todo teste de página, layout e componente tem ao menos um `it` com `expectNoAxeViolations(container)`; teste de rota não chama.
- Quem usa `vi.stubGlobal`/`vi.stubEnv` restaura no `afterEach` (`vi.unstubAllGlobals()`/`vi.unstubAllEnvs()`); `pool: "vmThreads"` não vira `isolate: false`.
- Spec novo de `e2e/` entra em exatamente uma das duas listas de `e2e/support/specClassification.ts`. Toda tela nova entrega os E2E dos próprios fluxos (ID do requisito no título, caminho em `e2e/support/routesUnderTest.ts`), o HTML sem JavaScript e a própria pré-renderização.
- E2E espera por estado, nunca por tempo; violação do axe se corrige na marcação ou no CSS, nunca desligando regra; elemento com `useReveal` leva `suppressHydrationWarning`.
- `vite build` não checa tipos: por isso `build` roda `typecheck` antes. Ficam sem teste só `src/entry-client.tsx` e `src/types/`.

## Onde fica cada coisa

Regras por área; o mecanismo de cada uma está em `docs/` (tabela "Onde ler mais" no fim da seção).

- **Rotas** (`src/routers/`): rota nova entra em `pageRoutes` de `routes.tsx` (gera as três
  rotas-pai `pt-BR`, `en` e `es`; a raiz `/` só redireciona) e o caminho vem de `ROUTES` em
  `paths.ts`, montado por `buildPath(path, language, params?)` ou, em componente, por
  `useLocalizedPath()`: nunca se escreve caminho com prefixo à mão nem se usa `ROUTES.home` cru em
  `<Link>`. Navegação interna usa `<Link to>`/`useNavigate`, nunca `<a href>` (âncora crua força
  reload e descarta o estado). As rotas-filhas de `MainLayout` são `lazy` e o único `<Suspense>`
  fica em volta do `<Outlet />` do layout: página nova não tem o próprio.
- **i18n** (`src/i18n/`, `src/locales/`): o idioma ativo se lê por `getLanguage()` e se troca por
  `setLanguage(language)`, que é o único código que grava `LANGUAGE_STORAGE_KEY` (componente nunca
  usa `saveLanguage` nem `localStorage` direto). Locale em `src/locales/<idioma>/<namespace>.json`,
  4 espaços, mesmas chaves nos três idiomas; namespace novo entra nos três idiomas, em
  `src/i18n/resources.ts` e no `ns` de `src/i18n/i18n.ts`. Chave em inglês, lowerCamelCase,
  hierárquica (`meta.title`); quem usa `common` carrega `useTranslation(["notFound", "common"])` e
  chama `t("common:backHome")`; texto com marcação no meio usa `<Trans>` com `t={t}`, `i18nKey` e
  `components`.
- **Estado** (`src/store/`): endpoint nunca é declarado em `api.ts`, sempre injetado por domínio em
  `src/store/api/<dominio>.api.ts` (`api.injectEndpoints`); slice em `slices/<nome>.slice.ts`; tipos
  de store em `src/types/store/`. Código de aplicação usa `useAppDispatch` e `useAppSelector` com
  seletor estreito, nunca o estado inteiro. Estado de uma tela fica em `useState` no hook da página;
  compartilhado vai para um slice; dado do servidor, para um endpoint do RTK Query. Dado de conteúdo
  (R1) vem de `src/services/content/` só pelos `queryFn`: página e componente nunca importam essa
  pasta nem JSON de `public/`. `src/services/http/` é o cliente fetch fora do RTK Query.
- **Páginas** (`src/pages/Nome.page.tsx`, `function NomePage()`, `export default`): estado, efeito e
  chamada a service ficam em `src/pages/hooks/use<Nome>.ts`; o `.page.tsx` só chama o hook e
  renderiza. `src/hooks/` é só para hook reutilizável entre páginas e componentes. Metadados
  (`<title>`, `<meta>`) com as tags nativas do React 19 no JSX da própria página, com valor de
  chave. Página de erro e não encontrada declaram `<meta name="robots" content={"noindex"} />`.
- **Tela pública nova** entrega a entrada no registro de pré-renderização
  (`src/prerender/prerenderRoutes.ts`) com teste de `<h1>` e conteúdo principal nos três idiomas, e
  os E2E dos fluxos. Elemento com `useReveal` leva `suppressHydrationWarning`.
- **Componentes** (`src/components/Nome.tsx`, PascalCase sem sufixo; CSS Module em
  `src/styles/components/nome.module.css`; teste em `src/components/test/Nome.test.tsx`):
  `<Nome>Props` local, `export default`, sem rota própria, texto fixo em `common` ou por prop. O
  `jsx-a11y/prefer-tag-over-role` acusa `role="status"` literal: passe `role={"status"}`. Controle
  de formulário tem borda `--border-control`, nunca `--border-subtle`. Props, comportamento e
  armadilhas de cada componente: `docs/architecture/components.md`.
- **Tela nova** (Projeto, Informações, Contato e as demais): hook da página, componentes e
  pré-renderização estão descritos em `docs/screens/<tela>.md#implementação`. Toda tela pública
  declara `<PageMeta title description path />` e `<JsonLd data={...} />` (construtor em
  `src/utils/`), além de `<title>` e `description` próprios.
- **Layout compartilhado** (`src/layouts/Main.layout.tsx`): monta `SkipLink`, `Header`, o único
  `<main id="main-content">` (página não renderiza `main`), `Footer` e `<ScrollRestoration />`;
  detalhe em `docs/screens/layout.md#implementação`.
- **Estilo** (`src/styles/pages/<nome>.module.css` e `src/styles/components/<nome>.module.css`): CSS
  Module usa as custom properties de `src/styles/global.css` em vez de valor fixo, com os nomes dos
  tokens do handoff (`--danger-surface`, nunca `error*`); token global novo entra em `global.css`.
  Classe usada como `css.x` precisa existir no módulo importado (a tipagem `{ [key: string]: string
}` transforma a ausente em `undefined`, sem erro). Sem estilo inline nem CSS global de escopo
  local; `:global` só nos hovers de `projectCard.module.css` e `featuredProject.module.css`. `a` é
  sublinhado em `global.css`: componente que se apresenta como botão zera no próprio módulo.
- **Tema e movimento**: a escolha é escrita só por `useTheme()` e `useMotion()` (chamados em
  `App.tsx`); `?tema=` não existe. Animação nova usa `--dur-*` e `--ease`, nunca duração fixa, para
  o botão e o sistema a desligarem. Detalhe em `docs/architecture/frontend.md#tema` e `#movimento`.
- **Alias e `public/`**: `@/*` resolve para `src/*` em dois lugares que precisam concordar, `paths`
  do `tsconfig.app.json` e `resolve.alias` do `vite.config.ts`. Arquivo estático novo (imagem,
  fonte, dado mock) entra em `public/`; fonte é self-hospedada (`woff2` e licença em
  `public/fonts/`, `@font-face` em `global.css`, `preload` no `index.html`), nunca CDN. Detalhe em
  `docs/architecture/code-structure.md`.
- **Config e dados:** variável do cliente tem prefixo `VITE_` e se lê com
  `import.meta.env.VITE_ALGO`, nunca `process.env`; `import.meta.env.BASE_URL`, `VITE_API_URL` e
  `VITE_SITE_URL` só são lidos em `src/utils/publicUrl.ts`, `src/services/http/apiUrl.ts` e
  `getSiteUrl`, e `BASE_PATH` só em `vite.config.ts`. Listas fixas de valores ficam em
  `src/enum/<nome>.enum.ts` (`export default`) e funções puras reutilizáveis sem React em
  `src/utils/`. Conteúdo em `public/content/<idioma>/`; ID novo vem de `npm run content:id`.

### Onde ler mais

| Área                                                                                    | Leia                                                                   |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Rotas, pré-renderização, estado, i18n, serviços, SEO por tela, estilos, tema, movimento | `docs/architecture/frontend.md`                                        |
| Pastas, páginas e hooks, alias, `public/`, enum, utils, convenções de código completas  | `docs/architecture/code-structure.md`                                  |
| Componentes (props, comportamento, armadilhas)                                          | `docs/architecture/components.md`                                      |
| Cada tela e o layout (requisitos e "Implementação")                                     | `docs/screens/<tela>.md`                                               |
| Testes de unidade, mecânica, cobertura e E2E                                            | `docs/setup/testing.md`, `docs/setup/e2e-performance.md`               |
| Comandos, CI, hooks, ambientes e variáveis                                              | `docs/setup/development.md`, `docs/setup/environments.md`              |
| Produto, glossário, versões, acessibilidade e requisitos não funcionais                 | `docs/product/`                                                        |
| Design system, decisões (`D01`–`D56`, `PI1`–`PI5`) e protótipo                          | `docs/design/`                                                         |
| Contrato da API e modelo de dados                                                       | `docs/architecture/api-contract.md`, `docs/architecture/data-model.md` |
| Fluxo de navegação e entidades                                                          | `docs/diagrams/`                                                       |

## Estilo de código

Texto completo, exemplos e o que o oxlint verifica:
`docs/architecture/code-structure.md#convenções-de-código`.

- **Todo identificador é em inglês** (componente, função, variável, propriedade, tipo, hook,
  arquivo, classe de CSS Module e chave de tradução): `name`/`active`, nunca `nome`/`ativo`.
- **Texto de UI nunca fica no código**: vem de `t()` ou `<Trans>`, com o valor em `src/locales/` nos
  três idiomas (`pt-BR` primeiro); `react/jsx-no-literals` acusa texto solto. Exceção: mensagem de
  `Error` lançada no cliente é literal em português, de diagnóstico. Mensagem de erro de API vem
  traduzida pelo backend, que recebe o idioma ativo (`getLanguage()`) em `Accept-Language`.
- **Export no final do arquivo e um símbolo exportado por arquivo, sempre `export default`** (valor
  ou tipo). Tipo exportado vive em `src/types/<dominio>/<NomeDoTipo>.types.ts` (PascalCase, domínio
  em lowerCamelCase) e se importa com `import type`; tipo não exportado fica no arquivo, sem
  `export` (`<Nome>Props`, `<Nome>State`, request e response de endpoint), e vai para `src/types/`
  se outro arquivo precisar dele. Fora da regra: declaração de ambiente (`*.d.ts`).
- **Sem comentários** (`//`, `/* */`, `{/* */}`): renomeie, extraia função ou simplifique; o
  contexto vai para `README.md`, descrição do PR, `spec.md` ou mensagem de commit. Exceção: diretiva
  de ferramenta (`@ts-expect-error`, `eslint-disable`, pragma de build) e cabeçalho de licença de
  terceiros.
- **TypeScript `strict`**: sem `any` explícito e sem cast para silenciar erro; use `unknown` com
  checagem ou modele o tipo.
- **Hooks**: dependências de `useEffect`, `useMemo` e `useCallback` completas; não guarde em
  `useState` o que dá para derivar no render. Lógica reutilizável vai para hook e acesso a dado
  externo para service, nunca no JSX.
- **Imports**: interno por `@/`, nunca `../` (mesma pasta ou descendo vale); nomeado, nunca de
  namespace; subpath quando o pacote publica (`lodash/debounce`), conferindo o `exports` do pacote.
- **`.map()` que renderiza JSX com corpo de mais de 3 linhas** vira componente dedicado
  (`<ProductListItem key={product.id} product={product} />`).
- **Lint e revisão**: o oxlint cobre `any`, dependências de hook, import de namespace, `../`,
  acessibilidade (`jsx-a11y`) e texto literal; o resto (responsabilidades, `useState` derivável,
  comentários, inglês, subpath, `.map`) é revisão manual do `reviewer`.

### Dependências novas

Antes de acrescentar um pacote ao `package.json` (ou de planejar tarefa que o acrescente), registre
o resultado na spec (`.specs/`) ou, sem spec, na descrição do PR; checklist completo com comandos em
`docs/architecture/code-structure.md#dependências-novas`:

- **Manutenção:** última versão e último commit, repositório não arquivado, sem `deprecated` no npm.
- **Problemas conhecidos:** issues abertas que atinjam o uso previsto e avisos de segurança,
  inclusive transitivos.
- **Compatibilidade:** `peerDependencies` com React, TypeScript e Vite do projeto, tipos embutidos e
  ESM com tree-shaking.
- **Necessidade e peso:** o que já existe no projeto ou se resolve com poucas linhas; kB gzip no
  bundle ou no chunk.

Pacote com aviso de segurança sem correção, arquivado, depreciado ou incompatível não entra sem o PO
decidir; atualização de versão maior segue a mesma checagem.

## Padrão de branches, commits e PRs

A fonte, para humanos, é o [`CONTRIBUTING.md`](../CONTRIBUTING.md); esta seção é o resumo que o agente
aplica sozinho e não pode contradizê-lo (`scripts/test/contributingTypesTable.test.ts` mantém a tabela
de tipos igual nos dois).

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

Toda issue entra no projeto [Portfolio](https://github.com/users/felipe-sant/projects/16) com Status `Backlog`, `Marco` do `docs/product/roadmap.md` (ou `Pessoal`) e um único `Tipo` (`FEAT`, `DOC` ou `BUG`); as labels indicam só a área (`frontend`, `backend`, `infra`). Dependência entre issues vira "blocked by" do GitHub, além da linha "Depende de" do corpo (detalhe em [`CONTRIBUTING.md`](../CONTRIBUTING.md#issues)).

### Branches

`<tipo>/<número-da-issue>-<descrição-curta>`, tipo em minúsculas (`feat/<número>-agentes-e-skills`); sem issue aberta, o número é omitido (`chore/update-gitignore`). Nenhuma branch de ambiente recebe push direto: `staging` é a base (toda branch nasce de `origin/staging` atualizada e volta por PR) e `main` é produção (só recebe PR de `staging` ou de `hotfix/*`, que nasce de `origin/main`).

### Commits

`<Tipo> <ícone> [#<número-da-issue>] <descrição>`, por exemplo `Fix :bug: [#<número>] Troca <a href> por <Link> na página NotFound`; sem issue, o `[#...]` é omitido. Commits são atômicos: uma mudança concluída por commit.

### Pull Requests

- Toda alteração passa por PR para a `staging` (exceção: `hotfix/*`, para a `main`). A promoção `staging` → `main` é gerada pelo `promote.yml`, com merge humano sempre por commit de merge (nunca squash).
- O autor se atribui (`gh pr create --assignee @me`), aplica as labels de área e referencia a issue (`Closes #<número>`); o título segue o do commit principal e a descrição, a estrutura de `.github/PULL_REQUEST_TEMPLATE.md`.
- **Todo PR para a `staging` traz um changeset** (`npm run changeset`; `-- --empty` só para o que não altera a versão); `hotfix/*` leva `patch` e roda `npm run changeset:version`. Regras completas em [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Tooling de IA (agents, skills e spec-driven)

Papéis em `.claude/agents/`, skills em `.claude/skills/`: descritos em [`.claude/README.md`](README.md). O fluxo de TDD tem cinco papéis, `sdd` → `executor` → verificação manual do PO → `reviewer` → `qa` → `reviewer` → `tester` → `reviewer`. Regras do fluxo:

- **TDD só para lógica e comportamento** (funções, hooks, store, comportamento de componente e página, textos nos três idiomas, bug com o teste que reproduz primeiro). Aparência (CSS, hover, espaçamento) não entra em TDD.
- **Estado vermelho nunca é commitado** nem enviado: ele vive só no working tree entre o teste e o código, e o push só acontece no fim do fluxo, depois do último `reviewer`.
- **Feature com tela:** ao fim do `executor`, a sessão principal sobe a aplicação (`npm run dev`), o PO verifica à mão e pede ajustes, e só depois o fluxo segue para o `reviewer`.
- **Pedidos de correção:** quem encontra problema devolve por responsável (`executor` para código, `qa` para E2E, `tester` para teste de unidade, `sdd` para spec); a sessão principal despacha o responsável, chama o `reviewer` para revisar só a correção e repete até não restar bloqueante. O `executor` não faz push nem abre PR nesse fluxo.
- **`.specs/`:** specs em `.specs/features/<slug>/` e `.specs/bugs/<slug>/`, a partir de `.specs/_template/`; as pastas de trabalho são gitignored e só o resumo `_archive/<slug>.md` é versionado. O estado vive no `**Status:**` do `spec.md` (`rascunho` → `em-revisao` → `aprovada` → `em-andamento` → `implementada`); só humano promove para `aprovada`.
- **`docs/`:** documentação só deste frontend (índice em `docs/README.md`); o `sdd` não escreve lá, só em `.specs/`.

Ao mudar uma convenção deste arquivo, verifique se algum agente ou skill a repete.
