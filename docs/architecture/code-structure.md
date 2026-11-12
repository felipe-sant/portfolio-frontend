# Estrutura do código

Onde cada coisa fica em `src/`, de onde vêm os dados do conteúdo e como o texto de UI é traduzido. A forma geral da aplicação (camadas, roteamento, estado, estilo e testes) está em [`frontend.md`](frontend.md).

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
comentários. As regras de código estão resumidas em [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md) e completas, com o que o oxlint
verifica sozinho, em [Convenções de código](#convenções-de-código); o padrão de branches, commits, PRs e changeset está em
[`CONTRIBUTING.md`](../../CONTRIBUTING.md). A visão de arquitetura está em
[`frontend.md`](frontend.md).

## Dados do conteúdo

Na v1 não há backend (R1). Os dados vêm de arquivos locais que uma camada de dados responde como a
API responderia, com os mesmos parâmetros, respostas e erros de
[`api-contract.md`](api-contract.md):

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

O conteúdo é o real do portfólio, escrito em `pt-BR` e traduzido para `en` e `es`; o teste de
conteúdo reprova campo traduzível de `en` ou `es` igual ao `pt-BR`. Para alterar ou acrescentar conteúdo, edite os arquivos de `public/content/pt-BR/` (o modelo de
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
`en` e `es`. Para adicionar um namespace, crie o JSON nos três idiomas, importe-o nos
três arquivos de `src/i18n/languageBundles/` (`ptBR.ts`, `en.ts` e `es.ts`) e inclua o nome em `src/i18n/namespaces.ts`.

O idioma ativo é o do primeiro segmento do caminho: `/pt-BR`, `/en` ou `/es`. Prefixo
desconhecido ou ausente (`/fr`, `/pt`, `/projects`) cai na página não encontrada, em inglês, e `?lng=`
não tem efeito. A raiz `/` só redireciona, nesta ordem: escolha salva, idioma do navegador e, por
último, `/en` (fallback). A escolha é salva no `localStorage` sob
`LANGUAGE_STORAGE_KEY = "portfolio-frontend:language"` (`src/i18n/languageStorageKey.ts`) quando o
código chama `setLanguage`; o idioma do navegador nunca é gravado. `<html lang>` acompanha o idioma
ativo. Link interno usa `useLocalizedPath()`, que mantém o prefixo do idioma. O resumo está em
[`frontend.md`](frontend.md#internacionalização).

## Alias de import, `public/`, enum e utils

- **Alias de import `@/`** — `@/*` resolve para `src/*`. Configurado em três lugares que precisam
  continuar concordando: `paths` no `tsconfig.app.json` (para o `tsc` e o editor), `paths` no
  `tsconfig.e2e.json` (para os E2E do Playwright) e `resolve.alias` no `vite.config.ts` (para o dev
  server e o build). Mexer em um sem o outro deixa o `tsc -b`
  verde e quebra o build, ou vice-versa. O Vitest herda o alias do mesmo `vite.config.ts`.
- **`public/`** — assets estáticos que o Vite copia como estão para a raiz de `dist/` no build, sem
  passar pelo bundler, e são referenciados por caminho absoluto (`/favicon.svg`). Arquivo estático
  novo (imagem, fonte, dado mock) entra aqui. Fonte é self-hospedada: `woff2` e licença em
  `public/fonts/`, `@font-face` em `src/styles/global.css` e `preload` no `index.html`, nunca
  CDN ou serviço de fonte de terceiros (Google Fonts e afins).

## Páginas e hooks

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

## Enum e utils

**`src/enum/`** guarda as listas fixas de valores (`PROJECT_TYPES`, `PROJECT_CATEGORIES` etc.), um
símbolo por arquivo com `export default`, nomeado `<nome>.enum.ts`; os tipos de `src/types/` derivam
delas. **`src/utils/`** guarda funções puras reutilizáveis sem relação com React, como `publicUrl.ts`,
a **única** leitura de `import.meta.env.BASE_URL`. Se a pasta não existir, crie no primeiro uso.

## Convenções de código

Texto completo das convenções de código do `.claude/CLAUDE.md`, com exemplos, o que o oxlint verifica e o checklist de dependências novas. O `CLAUDE.md` guarda a regra de uma linha de cada uma.

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
