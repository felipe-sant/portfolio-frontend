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
comentários. As regras completas de código e de agentes, com o que o oxlint verifica sozinho, estão em
[`.claude/CLAUDE.md`](../../.claude/CLAUDE.md); o padrão de branches, commits, PRs e changeset está em
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
`en` e `es`. Para adicionar um namespace, crie o JSON nos três idiomas, registre-o em
`src/i18n/resources.ts` e inclua o nome no `ns` de `src/i18n/i18n.ts`.

O idioma ativo é o do primeiro segmento do caminho: `/pt-BR`, `/en` ou `/es`. Prefixo
desconhecido ou ausente (`/fr`, `/pt`, `/projects`) cai na página não encontrada, em inglês, e `?lng=`
não tem efeito. A raiz `/` só redireciona, nesta ordem: escolha salva, idioma do navegador e, por
último, `/en` (fallback). A escolha é salva no `localStorage` sob
`LANGUAGE_STORAGE_KEY = "portfolio-frontend:language"` (`src/i18n/languageStorageKey.ts`) quando o
código chama `setLanguage`; o idioma do navegador nunca é gravado. `<html lang>` acompanha o idioma
ativo. Link interno usa `useLocalizedPath()`, que mantém o prefixo do idioma. O resumo está em
[`frontend.md`](frontend.md#internacionalização).

## Alias de import, `public/`, enum e utils

- **Alias de import `@/`** — `@/*` resolve para `src/*`. Configurado em dois lugares que precisam
  continuar concordando: `paths` no `tsconfig.app.json` (para o `tsc` e o editor) e `resolve.alias` no
  `vite.config.ts` (para o dev server e o build). Mexer em um sem o outro deixa o `tsc -b`
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
