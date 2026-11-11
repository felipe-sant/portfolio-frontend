# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

Frontend em React 19 e TypeScript (`strict`), com Vite, Redux Toolkit com RTK Query, i18next com react-i18next, CSS
Modules e Vitest com Testing Library. Este arquivo guarda só as regras e convenções que o agente aplica ao escrever
código; o detalhe está em `docs/` (tabela "Onde ler mais", em "Onde fica cada coisa").

O conteúdo de documentação está em **português**. **Identificadores no código são em inglês** (ver "Estilo de
código"). Texto de UI não é escrito no código: vem de chave de tradução (`t("heading")`, `<Trans>`), com o valor de cada
idioma em `src/locales/<idioma>/`. Idiomas: `pt-BR`, `en` e `es`; **`pt-BR` é a língua de referência** (texto novo nasce
nele, seus JSON tipam as chaves e os testes de tela afirmam o português). **O idioma de uma página é decidido pelo
caminho da URL** (`/pt-BR`, `/en`, `/es`); `en` é o `fallbackLng`, o destino da raiz `/` sem escolha salva nem idioma de
navegador suportado e o idioma da página não encontrada sem prefixo válido.

## Produto

Este repositório é o frontend do **portfólio pessoal de Luiz Felipe dos Santos**, desenvolvedor full stack. O usuário é
ao mesmo tempo cliente, PO e dev: ele decide escopo e prioridade e aprova as specs. Visão, público e escopo em
`docs/product/overview.md`.

**Handoff de design:** `/home/felipe/faculdade/design_handoff_portfolio` é a base do design (R3). Reaproveite `tokens/`
e use `components/` como ponto de partida; não copie o HTML das telas (`*.dc.html`), `support.js`, `image-slot.js` nem
os sketches de `assets/`. Onde o handoff diverge das convenções deste repositório, as convenções prevalecem (fonte
self-hospedada, CSS Module em vez de `.ds-*`, código sem comentários). Referência visual validada pelo PO:
`docs/design/prototype/` (`npm run dev`, em `/docs/design/prototype/prototipo-indice.dc.html`).

**Rotas:** cinco telas, com caminhos em inglês (D32) sob o prefixo do idioma (`/<idioma>`, sem barra final): Início,
Projetos (`/projects`), Projeto (`/projects/:id` e `/projects/:id/docs/:name`, `:id` é UUID v7), Informações (`/about`)
e Contato (`/contact`, formulário desligado na v1, D05). A raiz `/` só redireciona e `/projects` sem prefixo cai em não
encontrada.

**Voz e copy:** texto em `pt-BR` como referência, na primeira pessoa do singular, direto, sem emoji e sem superlativo.
Títulos são substantivos curtos sem ponto final, botões usam verbo no infinitivo + objeto ("Ver projetos", "Enviar
mensagem") e o separador de metadados é `·`.

**Requisitos obrigatórios de toda spec:**

- **R1 — Frontend-only com dados mock.** O backend ainda não existe: a aplicação funciona sozinha com dados mock até ele
  existir. Redux Toolkit, RTK Query e `src/services/http/` ficam no projeto para a troca do mock pela API.
- **R2 — Tradução em `pt-BR`, `en` e `es`.** Toda feature ou tarefa que cria ou altera texto de UI entrega o texto nos
  três idiomas, com `pt-BR` como referência. Chave de tradução sem uso é removida.
- **R3 — O design segue as decisões, o protótipo e o handoff.** Tokens, componentes, voz e copy, acessibilidade e
  responsividade seguem, nesta ordem de precedência: convenções do repositório > `docs/design/decisions.md` > protótipo
    > handoff.

**Versões:** a v1 é a entrega da faculdade (Fatec), no GitHub Pages, com dados reais em JSON pela camada local (R1) e
sem backend, prazo 22/11/2026; V2+ são de uso pessoal. Ordem e critério em `docs/product/roadmap.md`. **Decisões de
design:** `docs/design/decisions.md` (`D01`–`D56`, `PI1`–`PI5`), citadas por specs e issues.

## Comandos

```bash
npm run dev          # dev server do Vite (porta 5173)
npm run typecheck    # tsc -b
npm run lint         # oxlint (npm run lint:fix aplica as correções)
npm test -- --run    # Vitest one-shot (npm test puro entra em watch mode)
npm run build        # typecheck + build + pré-renderização + arquivos de SEO
npm run test:e2e     # Playwright + axe; exige npm run build:fatec antes
npm run changeset    # changeset do PR (-- --empty quando não altera a versão)
```

A lista completa, o CI, o Husky e o `.editorconfig` estão em
[`docs/setup/development.md`](../docs/setup/development.md); a convenção e a mecânica de teste, em
[`docs/setup/testing.md`](../docs/setup/testing.md). Regras de teste:

- O teste fica em `test/` ao lado do arquivo testado (`src/pages/test/Home.page.test.tsx`), importa o alvo por `@/` e
  usa `.test.ts` para o que não renderiza JSX; `describe`/`it` em português.
- Teste de tela afirma o texto em português, nunca a chave, não mocka `react-i18next` e troca de idioma com
  `setLanguage` dentro do `it`; teste de rota abre o caminho com prefixo (`/pt-BR`).
- Teste que lê a store usa `renderWithStore` de `src/testUtils/`. Todo teste de página, layout e componente tem ao menos
  um `it` com `expectNoAxeViolations(container)`; teste de rota não chama. Quem usa `vi.stubGlobal`/`vi.stubEnv`
  restaura no `afterEach`.
- Spec novo de `e2e/` entra em exatamente uma lista de `e2e/support/specClassification.ts`; toda tela nova entrega os
  E2E dos fluxos (ID do requisito no título, caminho em `e2e/support/routesUnderTest.ts`), o HTML sem JavaScript e a
  pré-renderização. E2E espera por estado, nunca por tempo; violação do axe se corrige na marcação ou no CSS, nunca
  desligando regra; elemento com `useReveal` leva `suppressHydrationWarning`.

## Onde fica cada coisa

Regras por área; o mecanismo de cada uma está em `docs/` (tabela "Onde ler mais" no fim da seção).

- **Rotas** (`src/routers/`): rota nova entra em `pageRoutes` de `routes.tsx` (gera as três rotas-pai `pt-BR`, `en` e
  `es`; a raiz `/` só redireciona) e o caminho vem de `ROUTES` em `paths.ts`, montado por
  `buildPath(path, language, params?)` ou, em componente, por `useLocalizedPath()`: nunca caminho com prefixo escrito à
  mão nem `ROUTES.home` cru em `<Link>`. Navegação interna usa `<Link to>`/`useNavigate`, nunca `<a href>` (âncora crua
  recarrega e descarta o estado). O único `<Suspense>` fica em volta do `<Outlet />` do layout: página nova não tem o
  próprio (exceção: Contato, em `docs/screens/contact.md#implementação`).
- **i18n** (`src/i18n/`, `src/locales/`): idioma ativo por `getLanguage()` e troca por `setLanguage(language)`, o único
  código que grava `LANGUAGE_STORAGE_KEY` (componente nunca usa `saveLanguage` nem `localStorage`). Namespace novo entra
  nos três idiomas, em `src/i18n/resources.ts` e no `ns` de `src/i18n/i18n.ts`. Chave em inglês, lowerCamelCase,
  hierárquica; quem usa `common` carrega `useTranslation(["notFound", "common"])` e chama `t("common:backHome")`; texto
  com marcação usa `<Trans>`.
- **Estado** (`src/store/`): endpoint nunca em `api.ts`, sempre injetado por domínio em `src/store/api/<dominio>.api.ts`
  (`api.injectEndpoints`); slice em `slices/<nome>.slice.ts`; tipos de store em `src/types/store/`. Código de aplicação
  usa `useAppDispatch` e `useAppSelector` com seletor estreito, nunca o estado inteiro. Dado de conteúdo (R1) vem de
  `src/services/content/` só pelos `queryFn`: página e componente nunca importam essa pasta nem JSON de `public/`.
- **Páginas** (`src/pages/Nome.page.tsx`, `function NomePage()`, `export default`): estado, efeito e chamada a service
  ficam em `src/pages/hooks/use<Nome>.ts`; o `.page.tsx` só chama o hook e renderiza, sem `main` (o layout tem o único
  `<main id="main-content">`). `src/hooks/` é só para hook reutilizável entre páginas e componentes. Metadados com as
  tags nativas do React 19 no JSX, com valor de chave; erro e não encontrada declaram
  `<meta name="robots" content={"noindex"} />`.
- **Tela pública nova** declara `<PageMeta title description path />` e `<JsonLd data={...} />` (construtor em
  `src/utils/`), entrega a entrada no registro de pré-renderização (`src/prerender/prerenderRoutes.ts`) com teste de
  `<h1>` e conteúdo nos três idiomas e os E2E dos fluxos; detalhe da tela em `docs/screens/<tela>.md#implementação`.
- **Componentes** (`src/components/Nome.tsx`, PascalCase sem sufixo; CSS Module em
  `src/styles/components/nome.module.css`; teste em `src/components/test/Nome.test.tsx`; skill
  `react-component-scaffold`): `<Nome>Props` local, `export default`, sem rota própria, texto fixo em `common` ou por
  prop. O lint acusa `role="status"` literal: passe `role={"status"}`. Controle de formulário tem borda
  `--border-control`, nunca `--border-subtle`. Catálogo (acrescente o componente novo): `docs/architecture/components.md`.
- **Estilo** (`src/styles/pages/<nome>.module.css`, `src/styles/components/<nome>.module.css`): CSS Module usa as custom
  properties de `src/styles/global.css` (token novo entra lá, com o nome do handoff, como `--danger-surface`, nunca
  `error*`). Classe usada como `css.x` precisa existir no módulo importado (a tipagem a transforma em `undefined`
  calado). Sem estilo inline nem CSS global local; `:global` só nos hovers de `projectCard.module.css` e
  `featuredProject.module.css`. Tema e movimento só se escrevem por `useTheme()` e `useMotion()`; animação nova usa
  `--dur-*` e `--ease`. Detalhe em `docs/architecture/frontend.md`.
- **Alias e `public/`**: `@/*` resolve para `src/*` em dois lugares que precisam concordar, `paths` do
  `tsconfig.app.json` e `resolve.alias` do `vite.config.ts`. Asset estático novo (imagem, fonte, dado mock) entra em
  `public/`; fonte é self-hospedada, nunca CDN.
- **Config e dados:** variável do cliente tem prefixo `VITE_` e se lê com `import.meta.env.VITE_ALGO`; `BASE_URL`,
  `VITE_API_URL` e `VITE_SITE_URL` só são lidos em `src/utils/publicUrl.ts`, `src/services/http/apiUrl.ts` e
  `getSiteUrl`. Listas fixas de valores em `src/enum/<nome>.enum.ts`, funções puras reutilizáveis sem React em
  `src/utils/`, ID novo de conteúdo por `npm run content:id`.

### Onde ler mais

| Área                                         | Leia                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Rotas, estado, i18n, serviços, SEO, tema     | `docs/architecture/frontend.md`                                                                                    |
| Pastas, páginas, alias, convenções           | `docs/architecture/code-structure.md`                                                                              |
| Componentes                                  | `docs/architecture/components.md`                                                                                  |
| Telas e layout                               | `docs/screens/<tela>.md`, seção "Implementação"                                                                    |
| Testes de unidade e E2E                      | `docs/setup/testing.md`, `docs/setup/e2e-performance.md`                                                           |
| Comandos, CI, ambientes, variáveis           | `docs/setup/development.md`, `docs/setup/environments.md`                                                          |
| Produto, versões, acessibilidade, requisitos | `docs/product/overview.md`, `docs/product/glossary.md`, `docs/product/roadmap.md`, `docs/product/accessibility.md` |
| Design e decisões (`D01`–`D56`, `PI1`–`PI5`) | `docs/design/design-system.md`, `docs/design/decisions.md`                                                         |
| Contrato da API e modelo de dados            | `docs/architecture/api-contract.md`, `docs/architecture/data-model.md`                                             |

## Estilo de código

Texto completo, exemplos e o que o oxlint verifica: `docs/architecture/code-structure.md#convenções-de-código`.

- **Todo identificador é em inglês** (componente, função, variável, propriedade, tipo, hook, arquivo, classe de CSS
  Module e chave de tradução): `name`/`active`, nunca `nome`/`ativo`.
- **Texto de UI nunca fica no código**: vem de `t()` ou `<Trans>`, com o valor em `src/locales/` nos três idiomas
  (`pt-BR` primeiro); `react/jsx-no-literals` acusa texto solto. Exceção: mensagem de `Error` lançada no cliente é
  literal em português, de diagnóstico. Mensagem de erro de API vem traduzida pelo backend, que recebe o idioma ativo
  (`getLanguage()`) em `Accept-Language`.
- **Export no final do arquivo e um símbolo exportado por arquivo, sempre `export default`** (valor ou tipo). Tipo
  exportado vive em `src/types/<dominio>/<NomeDoTipo>.types.ts` (PascalCase, domínio em lowerCamelCase) e se importa com
  `import type`; tipo não exportado fica no arquivo, sem `export` (`<Nome>Props`, `<Nome>State`, request e response de
  endpoint), e vai para `src/types/` se outro arquivo precisar dele.
- **Sem comentários** (`//`, `/* */`, `{/* */}`): renomeie, extraia função ou simplifique; o contexto vai para
  `README.md`, descrição do PR, `spec.md` ou mensagem de commit. Exceção: diretiva de ferramenta (`@ts-expect-error`,
  `eslint-disable`, pragma de build) e cabeçalho de licença de terceiros.
- **TypeScript `strict` e hooks**: sem `any` explícito e sem cast para silenciar erro (use `unknown` com checagem);
  dependências de `useEffect`, `useMemo` e `useCallback` completas; não guarde em `useState` o que dá para derivar no
  render. Lógica reutilizável vai para hook e acesso a dado externo para service, nunca no JSX.
- **Imports**: interno por `@/`, nunca `../` (mesma pasta ou descendo vale); nomeado, nunca de namespace; subpath quando
  o pacote publica (`lodash/debounce`), conferindo o `exports` do pacote.
- **`.map()` que renderiza JSX com corpo de mais de 3 linhas** vira componente dedicado
  (`<ProductListItem key={product.id} product={product} />`).

### Dependências novas

Antes de acrescentar um pacote ao `package.json` (ou de planejar tarefa que o acrescente), registre o resultado na spec
(`.specs/`) ou, sem spec, na descrição do PR; checklist completo com comandos em
`docs/architecture/code-structure.md#dependências-novas`:

- **Manutenção:** última versão e último commit, repositório não arquivado, sem `deprecated` no npm.
- **Problemas conhecidos:** issues abertas que atinjam o uso previsto e avisos de segurança, inclusive transitivos.
- **Compatibilidade:** `peerDependencies` com React, TypeScript e Vite do projeto, tipos embutidos e ESM com
  tree-shaking.
- **Necessidade e peso:** o que já existe no projeto ou se resolve com poucas linhas; kB gzip no bundle ou no chunk.

Pacote com aviso de segurança sem correção, arquivado, depreciado ou incompatível não entra sem o PO decidir;
atualização de versão maior segue a mesma checagem.

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

Toda issue entra no projeto [Portfolio](https://github.com/users/felipe-sant/projects/16) com Status `Backlog`, `Marco`
do `docs/product/roadmap.md` (ou `Pessoal`), um único `Tipo` (`FEAT`, `DOC` ou `BUG`) e labels só de área (`frontend`,
`backend`, `infra`); dependência vira "blocked by" do GitHub ([`CONTRIBUTING.md`](../CONTRIBUTING.md#issues)).

### Branches

`<tipo>/<número-da-issue>-<descrição-curta>`, tipo em minúsculas (`feat/<número>-agentes-e-skills`); sem issue aberta, o
número é omitido (`chore/update-gitignore`). Nenhuma branch de ambiente recebe push direto: `staging` é a base (toda
branch nasce de `origin/staging` atualizada e volta por PR) e `main` é produção (só recebe PR de `staging` ou de
`hotfix/*`, que nasce de `origin/main`).

### Commits

`<Tipo> <ícone> [#<número-da-issue>] <descrição>`, por exemplo
`Fix :bug: [#<número>] Troca <a href> por <Link> na página NotFound`; sem issue, o `[#...]` é omitido. Commits são
atômicos: uma mudança concluída por commit.

### Pull Requests

- Todo PR vai para a `staging` (exceção: `hotfix/*`, para a `main`); a promoção `staging` → `main` é do `promote.yml`,
  com merge humano por commit de merge (nunca squash).
- O autor se atribui (`gh pr create --assignee @me`), aplica as labels de área e referencia a issue
  (`Closes #<número>`); título igual ao do commit principal e descrição na estrutura de
  `.github/PULL_REQUEST_TEMPLATE.md`.
- **Todo PR para a `staging` traz um changeset** (`npm run changeset`; `-- --empty` só para o que não altera a versão);
  `hotfix/*` leva `patch` e roda `npm run changeset:version`.

## Tooling de IA (agents, skills e spec-driven)

Papéis e skills: [`.claude/README.md`](README.md). Fluxo de TDD: `sdd` → `executor` → verificação manual do PO →
`reviewer` → `qa` → `reviewer` → `tester` → `reviewer`. Regras do fluxo:

- **TDD só para lógica e comportamento** (funções, hooks, store, comportamento de componente e página, textos nos três
  idiomas, bug com o teste que reproduz primeiro). Aparência (CSS, hover, espaçamento) não entra em TDD.
- **Estado vermelho nunca é commitado** nem enviado: ele vive só no working tree entre o teste e o código, e o push só
  acontece no fim do fluxo, depois do último `reviewer`.
- **Feature com tela:** ao fim do `executor`, a sessão principal sobe a aplicação (`npm run dev`), o PO verifica à mão e
  pede ajustes, e só depois o fluxo segue para o `reviewer`.
- **Pedidos de correção:** quem encontra problema devolve por responsável (`executor` para código, `qa` para E2E,
  `tester` para teste de unidade, `sdd` para spec); a sessão principal despacha o responsável, chama o `reviewer` para
  revisar só a correção e repete até não restar bloqueante. O `executor` não faz push nem abre PR nesse fluxo.
- **`.specs/`:** specs em `.specs/features/<slug>/` e `.specs/bugs/<slug>/`, a partir de `.specs/_template/`; a
  spec nasce na branch da feature, criada pelo `sdd` e commitada nela, e viaja com o PR; ao chegar em `implementada`
  ela permanece versionada, como contexto para tarefas futuras. O estado vive no `**Status:**` do `spec.md`
  (`rascunho` → `em-revisao` → `aprovada` → `em-andamento` → `implementada`); só humano promove para `aprovada`.
