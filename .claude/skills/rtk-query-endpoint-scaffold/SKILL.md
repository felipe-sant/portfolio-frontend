---
name: rtk-query-endpoint-scaffold
description: Como criar endpoints de API neste projeto React com RTK Query, seguindo a convenção api.injectEndpoints em src/store/api/<dominio>.api.ts + hooks gerados + tagTypes + teste com endpoint injetado e fetch stubado. Use quando for adicionar, alterar ou remover um endpoint, ou consumir dado do servidor numa página.
---

# RTK Query Endpoint Scaffold

Dado vindo do servidor é **estado de servidor**: vive no cache do RTK Query, não em `useState` nem em slice. A base fica em `src/store/api.ts` (`createApi` com `reducerPath: "api"`, `baseUrl` de `@/services/http/apiUrl`, `Accept-Language` no `prepareHeaders`, `tagTypes` e `endpoints: () => ({})`, sem endpoint próprio) e é registrada no `rootReducer` e no middleware da store; endpoint entra por `api.injectEndpoints`, nunca direto em `api.ts`. Os trechos abaixo usam um domínio `items` hipotético para ilustrar o formato. O `get`/`post` de `src/services/http/` é `fetch` cru para o que não passa pelo RTK Query; o RTK Query não o usa como `baseQuery`.

| Peça                        | Caminho                                       | Se faltar                                    |
| --------------------------- | --------------------------------------------- | -------------------------------------------- |
| Endpoints                   | `src/store/api/<dominio>.api.ts`              | —                                            |
| Tag (se houver invalidação) | `tagTypes` em `src/store/api.ts`              | `providesTags`/`invalidatesTags` não compila |
| Consumo                     | hook de página `src/pages/hooks/use<Nome>.ts` | a página mistura dado e render               |
| Teste                       | `src/store/api/test/<dominio>.api.test.ts`    | o `reviewer` bloqueia a revisão              |

## Passo a passo

### 1. Endpoints — `src/store/api/<dominio>.api.ts`

Um arquivo por domínio, via `api.injectEndpoints`, com `export default` da API injetada no final. Os tipos de request/response ficam **locais e sem `export`**; só sobem para `src/types/<dominio>/<Nome>.types.ts` (um por arquivo, `export default`) se outro arquivo precisar importá-los. O caminho é relativo: a `baseUrl` já vem de `apiUrl`.

```ts
import api from "@/store/api"

type Item = {
    id: string
    name: string
}

type CreateItemRequest = {
    name: string
}

const itemsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getItems: build.query<Item[], void>({
            query: () => "/items"
        }),
        createItem: build.mutation<Item, CreateItemRequest>({
            query: (body) => ({ url: "/items", method: "POST", body })
        })
    })
})

export default itemsApi
```

Os hooks gerados (`useGetItemsQuery`, `useCreateItemMutation`) são consumidos pela própria API (`itemsApi.useGetItemsQuery()`), sem export nomeado extra. Nome de endpoint em inglês: `getX` para query, verbo no imperativo para mutation.

### 2. Tags — invalidação de cache (quando necessário)

`tagTypes` fica em `src/store/api.ts` e só recebe um tipo quando o projeto precisa que uma mutation refaça uma query. Declare o tipo da tag lá e use `providesTags`/`invalidatesTags` no endpoint:

```ts
const api = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: ["Item"],
    endpoints: () => ({})
})
```

```ts
getItems: build.query<Item[], void>({
    query: () => "/items",
    providesTags: ["Item"]
}),
createItem: build.mutation<Item, CreateItemRequest>({
    query: (body) => ({ url: "/items", method: "POST", body }),
    invalidatesTags: ["Item"]
})
```

### 3. Consumo — hook de página

A lógica de dado não fica no `.page.tsx`: vive em `src/pages/hooks/use<Nome>.ts` (skill `react-page-scaffold`), que devolve o que a página renderiza, incluindo `isLoading` e `error`.

```ts
import itemsApi from "@/store/api/items.api"

function useItemList() {
    const { data, isLoading, error } = itemsApi.useGetItemsQuery()

    return { items: data ?? [], isLoading, hasError: error !== undefined }
}

export default useItemList
```

```tsx
import { useTranslation } from "react-i18next"
import useItemList from "@/pages/hooks/useItemList"

function ItemListPage() {
    const { t } = useTranslation(["itemList", "common"])
    const { items, isLoading, hasError } = useItemList()

    if (isLoading) return <p>{t("common:loading")}</p>
    if (hasError) return <p role="alert">{t("loadError")}</p>

    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>{item.name}</li>
            ))}
        </ul>
    )
}

export default ItemListPage
```

Mutation: `const [createItem, { isLoading }] = itemsApi.useCreateItemMutation()` e `await createItem({ name }).unwrap()` para tratar a falha. Quando a requisição precisar de cancelamento, o RTK Query já passa o `AbortSignal` do ciclo de vida da query.

### 4. Teste

O teste usa o endpoint do domínio com o `fetch` stubado e `VITE_API_URL` absoluta (o `Request` do Node não aceita URL relativa), com `vi.resetModules()` e import dinâmico para a constante ser relida. A store vem de `renderWithStore` (skill `vitest-specialist`), com cache isolado por teste.

```tsx
import { afterEach, describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("itemsApi", () => {
    it("mostra os itens devolvidos pela API", async () => {
        vi.stubEnv("VITE_API_URL", "https://api.example.com")
        vi.resetModules()
        const { default: itemsApi } = await import("@/store/api/items.api")
        const { default: renderWithStore } = await import("@/testUtils/renderWithStore")
        const fetchMock = vi.fn().mockImplementation(
            async () =>
                new Response(JSON.stringify([{ id: "1", name: "Primeiro" }]), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                })
        )
        vi.stubGlobal("fetch", fetchMock)

        function Items() {
            const { data } = itemsApi.useGetItemsQuery()
            return <p>{data?.[0].name}</p>
        }

        renderWithStore(<Items />)

        expect(await screen.findByText("Primeiro")).toBeInTheDocument()
        expect((fetchMock.mock.calls[0][0] as Request).url).toBe("https://api.example.com/items")
    })
})
```

Teste de um endpoint injetado só no próprio teste (sem arquivo de domínio) usa `api.injectEndpoints` dentro do `it`; o endpoint persiste enquanto o módulo vive, então o nome é único por arquivo ou há `resetModules` por teste.

## Regra de export

- Export no final do arquivo, nunca inline; um símbolo exportado por arquivo, sempre `export default`.
- Tipo de request/response local e sem `export`; só sobe para `src/types/<dominio>/<Nome>.types.ts` se outro arquivo precisar.

## Checklist

- [ ] `src/store/api/<dominio>.api.ts` com `api.injectEndpoints` e `export default` da API injetada
- [ ] Tipos de request/response locais, sem `export`
- [ ] Caminho relativo nas queries (a `baseUrl` vem de `apiUrl`); nenhuma leitura direta de `import.meta.env.VITE_API_URL`
- [ ] `tagTypes` em `src/store/api.ts` e `providesTags`/`invalidatesTags` só se houver invalidação
- [ ] Consumo por hook de página em `src/pages/hooks/`, com `isLoading` e erro tratados
- [ ] Teste em `test/` com `fetch` stubado, `VITE_API_URL` absoluta e `renderWithStore`
- [ ] Sem comentário no código; identificadores em inglês; texto de UI por chave
- [ ] `npm run lint`, `npm run build` e `npm test -- --run` passando

## Ao remover ou renomear um endpoint

Remova o endpoint, o hook de página que o consome e o teste juntos, e a tag em `tagTypes` se ninguém mais a usa. Um consumidor que ficou para trás aponta para um hook inexistente e quebra o `npm run typecheck`.
