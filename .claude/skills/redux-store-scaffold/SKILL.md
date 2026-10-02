---
name: redux-store-scaffold
description: Como criar estado de cliente (slice) neste projeto React com Redux Toolkit, seguindo a convenção slice + registro no rootReducer + hooks tipados + teste com renderWithStore. Use quando for adicionar, alterar ou remover um slice em src/store/slices/ ou ler/escrever estado global em componente.
---

# Redux Store Scaffold

Estado de cliente compartilhado entre telas vive num **slice** em `src/store/slices/<nome>.slice.ts`. Estado que só uma página usa continua `useState` no hook da página; dado do servidor não é slice, é endpoint do RTK Query (skill `rtk-query-endpoint-scaffold`). Os trechos abaixo usam um `counter` hipotético para ilustrar o formato.

A infraestrutura da store fica em `src/store/rootReducer.ts` (com `api.reducer`), `src/store/createStore.ts`, `src/store/store.ts`, `useAppDispatch`, `useAppSelector` e no `Provider` de `src/App.tsx`; slice novo só se registra nela, sem recriá-la.

| Peça     | Caminho                                      | Se faltar                                                                      |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Slice    | `src/store/slices/<nome>.slice.ts`           | —                                                                              |
| Registro | entrada em `src/store/rootReducer.ts`        | o slice existe mas `state.<nome>` não existe; o tipo `RootState` não o enxerga |
| Teste    | `src/store/slices/test/<nome>.slice.test.ts` | o `reviewer` bloqueia a revisão                                                |

## Passo a passo

### 1. Slice — `src/store/slices/<nome>.slice.ts`

Um símbolo exportado por arquivo, `export default` no final: o próprio slice. O reducer sai de `<nome>Slice.reducer` e as actions de `<nome>Slice.actions`. O tipo `<Nome>State` é local e **não** leva `export`; só sobe para `src/types/<dominio>/<Nome>State.types.ts` se outro arquivo precisar importá-lo.

```ts
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

type CounterState = {
    value: number
}

const initialState: CounterState = { value: 0 }

const counterSlice = createSlice({
    name: "counter",
    initialState,
    reducers: {
        incremented: (state) => {
            state.value += 1
        },
        addedBy: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        }
    }
})

export default counterSlice
```

Nome de action no passado (`incremented`, `addedBy`), em inglês. Não guarde no slice valor derivável de outro (calcule no seletor).

### 2. Registro — `src/store/rootReducer.ts`

O slice entra no mesmo objeto do `api.reducer`:

```ts
import { combineReducers } from "@reduxjs/toolkit"
import api from "@/store/api"
import counterSlice from "@/store/slices/counter.slice"

const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer,
    [counterSlice.name]: counterSlice.reducer
})

export default rootReducer
```

`RootState` (`src/types/store/RootState.types.ts`) é derivado de `ReturnType<typeof rootReducer>`: o registro atualiza o tipo sozinho. Não edite os tipos de `src/types/store/`.

### 3. Consumo — `useAppSelector` e `useAppDispatch`

Código de aplicação usa só os hooks tipados de `src/store/`, nunca `useSelector`/`useDispatch` direto. O seletor é **estreito**: devolve só o pedaço que o componente usa, nunca o `state` inteiro, para não re-renderizar à toa.

```tsx
import { useTranslation } from "react-i18next"
import counterSlice from "@/store/slices/counter.slice"
import useAppDispatch from "@/store/useAppDispatch"
import useAppSelector from "@/store/useAppSelector"

function CounterButton() {
    const { t } = useTranslation()
    const value = useAppSelector((state) => state.counter.value)
    const dispatch = useAppDispatch()

    return (
        <button type="button" onClick={() => dispatch(counterSlice.actions.incremented())}>
            {t("counter.increment", { value })}
        </button>
    )
}

export default CounterButton
```

O componente segue a skill `react-component-scaffold` (CSS Module, texto por chave). Lógica além de ler e despachar vai para hook.

### 4. Teste

Dois níveis, ambos em `test/` e com alias `@/`:

- **Slice:** teste o reducer como função pura, sem React.
- **Consumo:** `renderWithStore(ui, { preloadedState })` (skill `vitest-specialist`) cria a store por chamada, com estado isolado; passe `preloadedState` em vez de despachar actions na mão.

```ts
import { describe, expect, it } from "vitest"
import counterSlice from "@/store/slices/counter.slice"

describe("counterSlice", () => {
    it("incrementa o valor", () => {
        const state = counterSlice.reducer({ value: 1 }, counterSlice.actions.incremented())

        expect(state.value).toBe(2)
    })

    it("soma o valor recebido", () => {
        const state = counterSlice.reducer({ value: 1 }, counterSlice.actions.addedBy(5))

        expect(state.value).toBe(6)
    })
})
```

```tsx
import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CounterButton from "@/components/CounterButton"
import renderWithStore from "@/testUtils/renderWithStore"

describe("CounterButton", () => {
    it("incrementa a partir do estado inicial informado", async () => {
        const user = userEvent.setup()
        const { store } = renderWithStore(<CounterButton />, {
            preloadedState: { counter: { value: 3 } }
        })

        await user.click(screen.getByRole("button"))

        expect(store.getState().counter.value).toBe(4)
    })
})
```

## Regra de export

- Export no final do arquivo, nunca inline; um símbolo exportado por arquivo, sempre `export default`.
- `<Nome>State` local e sem `export`; só sobe para `src/types/<dominio>/<Nome>State.types.ts` se outro arquivo precisar.

## Checklist

- [ ] `src/store/slices/<nome>.slice.ts` com `createSlice` e `export default` do slice no final
- [ ] `<Nome>State` local, sem `export`
- [ ] Slice registrado em `src/store/rootReducer.ts` ao lado de `api.reducer`
- [ ] Componente lê com `useAppSelector` (seletor estreito) e escreve com `useAppDispatch`; nenhum `useSelector`/`useDispatch` direto
- [ ] Teste do slice e do consumo em `test/`, com `renderWithStore` e `preloadedState`
- [ ] Sem comentário no código; identificadores em inglês; texto de UI por chave
- [ ] `npm run lint`, `npm run build` e `npm test -- --run` passando

## Ao remover ou renomear um slice

Remova o slice, a entrada no `rootReducer.ts` e o teste juntos. Uma entrada órfã no `rootReducer.ts` quebra o build; um teste que ficou para trás quebra no import.
