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

### Dependências novas

Antes de acrescentar um pacote ao `package.json` (ou de planejar uma tarefa que o acrescente),
verifique se ele vale a pena e registre o resultado na spec (`.specs/`) ou, sem spec, na descrição
do PR:

- **Manutenção:** data da última versão e do último commit (`npm view <pacote> time`,
  `gh api repos/<dono>/<repo>`); repositório não arquivado; sem `deprecated` no npm.
- **Problemas conhecidos:** issues abertas do repositório (`gh issue list -R <dono>/<repo>`), em
  especial bugs que atinjam o uso previsto, e avisos de segurança
  (`gh api "advisories?ecosystem=npm&affects=<pacote>"`), incluindo as dependências transitivas
  relevantes. Pacote parado há muito tempo não é problema por si só (utilitário pequeno e estável),
  mas o motivo precisa estar anotado.
- **Compatibilidade:** `peerDependencies` com a versão de React, TypeScript e Vite do projeto, tipos
  embutidos e formato ESM com tree-shaking.
- **Necessidade e peso:** se o que o pacote entrega já existe no projeto ou se resolve com poucas
  linhas; custo em kB gzip no bundle e, quando for carregado sob demanda, no chunk dele.

Pacote com aviso de segurança sem correção, arquivado, depreciado ou incompatível não entra sem o PO
decidir. Atualizar versão de pacote existente segue a mesma checagem quando a mudança for de versão
maior.

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
