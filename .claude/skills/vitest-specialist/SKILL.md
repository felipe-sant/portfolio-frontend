---
name: vitest-specialist
description: Como escrever, rodar e depurar teste em `test/` por diretório neste projeto React com Vitest + Testing Library (jsdom). Use quando for criar, alterar, mover ou depurar qualquer arquivo *.test.tsx / *.test.ts em src/, ou mexer em src/setupTests.ts ou no bloco test do vite.config.ts.
---

# Vitest Specialist

Esta skill é dona do **arquivo de teste**. Como escrever a página ou o componente testado está nas skills `react-page-scaffold` e `react-component-scaffold`.

O stack é Vitest + `@testing-library/react` em ambiente `jsdom`, configurado no bloco `test` do `vite.config.ts` da raiz:

```ts
test: {
    environment: "jsdom",
    pool: "vmThreads",
    setupFiles: ["./src/setupTests.ts"]
}
```

O `pool: "vmThreads"` reaproveita o `jsdom` por worker mantendo um contexto de VM por arquivo; mesmo assim, teste que usa `vi.stubGlobal` ou `vi.stubEnv` restaura no `afterEach` com `vi.unstubAllGlobals()` e `vi.unstubAllEnvs()`.

Não há `globals: true` e não há `passWithNoTests` — as duas ausências têm consequência prática, abaixo.

## 1. Como rodar

| Comando                                               | O que faz                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm test`                                            | **watch mode** (o script é `vitest`, sem `run`). Não termina.                               |
| `npm test -- --run`                                   | execução one-shot. **É esta que você usa** num agente, em CI ou em terminal não-interativo. |
| `npm test -- --run src/pages/test/Home.page.test.tsx` | um arquivo só, one-shot.                                                                    |
| `npm run typecheck`                                   | checagem de tipos isolada, inclusive dos arquivos de teste.                                 |
| `npm run build`                                       | `typecheck` + build de produção. Não roda teste.                                            |

Rodar `npm test` puro dentro de um agente trava a sessão até o timeout: o processo fica esperando input que nunca vem. Sempre `-- --run`.

## 2. Suíte que não coleta nada falha

`passWithNoTests` fica fora da config de propósito: uma execução que não coleta **nenhum** teste sai com exit 1. O efeito colateral útil é que um arquivo de teste com nome fora da convenção não passa despercebido — mas o sintoma é enganoso. Você vê "No test files found" ou uma contagem menor do que esperava, **não** um erro apontando o arquivo errado. Se o teste que você acabou de escrever "não falhou nem passou", o problema é o nome ou o lugar do arquivo, não o conteúdo.

## 3. Nome e localização

`<diretório>/test/<arquivo>.test.tsx`: o teste vive numa pasta `test/` dentro do diretório do arquivo testado, com o mesmo nome do arquivo mais `.test.ts(x)`. O arquivo testado é importado pelo alias `@/` (`import HomePage from "@/pages/Home.page"`), nunca por `../` — a regra `import/no-relative-parent-imports` proíbe —, e `vi.mock`, `vi.doMock` e `import()` dinâmico também usam alias. Nunca uma pasta `__tests__/`, nunca o sufixo `.spec.tsx` — nenhum dos dois é coletado nem reconhecido como convenção aqui. `src/setupTests.ts` não é teste: é setup e fica onde está.

| Arquivo testado                 | Arquivo de teste                          |
| ------------------------------- | ----------------------------------------- |
| `src/pages/Home.page.tsx`       | `src/pages/test/Home.page.test.tsx`       |
| `src/services/http/get.ts`      | `src/services/http/test/get.test.ts`      |
| `src/routers/Router.tsx`        | `src/routers/test/Router.test.tsx`        |
| `src/components/SaveButton.tsx` | `src/components/test/SaveButton.test.tsx` |
| `src/hooks/useCounter.ts`       | `src/hooks/test/useCounter.test.ts`       |

Use `.test.ts` (sem `x`) para o que não renderiza JSX — hook, util, service. `.test.tsx` só quando o arquivo tem JSX dentro.

## 4. `src/setupTests.ts` e o subpath — não "conserte" este import

O arquivo é registrado em `test.setupFiles` do `vite.config.ts` e faz três coisas: registra os matchers do `jest-dom`, reseta o idioma antes de cada teste e desmonta o DOM depois de cada teste.

```ts
import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import i18n from "@/i18n/i18n"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"

beforeEach(async () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
    await i18n.changeLanguage("pt-BR")
})

afterEach(cleanup)
```

**O subpath `/vitest` é obrigatório.** Ele registra os matchers no `expect` do Vitest. O entrypoint raiz (`@testing-library/jest-dom`) chama `expect.extend(...)` contando com um `expect` **global**, que não existe aqui porque não há `globals: true`. Trocar o subpath pelo raiz compila e quebra ao carregar o setup:

```
ReferenceError: expect is not defined
 ❯ src/setupTests.ts:1:1
```

Esse erro ao menos aponta o arquivo. O sintoma de o `setupFiles` ter sumido do `vite.config.ts` é outro, e mais enganoso — `Invalid Chai property: toBeInTheDocument`, apontando para a linha do `expect` no teste, sem nenhuma menção ao setup.

**O `afterEach(cleanup)` também é obrigatório, e não é redundante.** O cleanup automático do Testing Library se registra num `afterEach` global; sem `globals: true` esse global não existe, então o RTL não liga nada sozinho (ele testa `if (typeof afterEach === 'function')`). É esta linha que desmonta o DOM entre um `it` e o seguinte. Apagá-la por parecer supérflua faz todo arquivo com mais de um `render` começar a falhar com `Found multiple elements`.

**O `beforeEach` reseta o idioma, e o reset não grava nada.** Ele apaga a escolha salva em `LANGUAGE_STORAGE_KEY` e chama `i18n.changeLanguage("pt-BR")` direto na instância — não `setLanguage`, que gravaria a escolha via `saveLanguage`. O detector de `src/i18n/i18n.ts` é configurado com `caches: []`, então `changeLanguage` não escreve no `localStorage`: a ordem dos dois passos não importa e todo teste começa sem escolha salva. Sem esse reset, a suíte dependeria do navegador do `jsdom`, que reporta `en-US`, e um teste que troca o idioma vazaria o idioma para o seguinte.

**O literal é `"pt-BR"`, não o fallback `en`.** São duas coisas independentes: `pt-BR` é a língua de referência — o texto nasce nela e os testes de tela afirmam o texto em português —, e `en` (`FALLBACK_LANGUAGE`) é o que o usuário vê quando nenhuma fonte de detecção dá um idioma suportado. Trocar o literal por `FALLBACK_LANGUAGE` "por consistência" faz todo teste de tela falhar, porque passaria a renderizar em inglês. Não existe constante para a língua de referência de propósito: ela seria um símbolo público só para este arquivo.

Se você encontrar este arquivo e algo nele parecer errado, não está: deixe como está.

## 5. Testar um componente ou página

`describe`, `it`, `expect` e `vi` vêm de um `import` explícito de `vitest` — **não** existe `globals: true` na config, então eles não estão no escopo global. Esquecer o import dá `describe is not defined`.

Render direto da página:

```tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import HomePage from "@/pages/Home.page"

describe("HomePage", () => {
    it("renderiza o título principal", () => {
        render(<HomePage />)

        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
    })
})
```

Não há provider nem wrapper de render: a página chama `useTranslation()` e o texto sai em `pt-BR` porque o `src/setupTests.ts` resetou o idioma (item 4) e o `initReactI18next` registra a instância globalmente. Import interno com `@/`, nunca `../`. O nome do `describe` é o identificador testado (inglês); a descrição do `it` é uma frase em português, como todo texto lido por gente.

### Mais de um `render` no mesmo arquivo

Não precisa de nada: o `afterEach(cleanup)` do `src/setupTests.ts` desmonta o DOM entre um `it` e o seguinte, em toda suíte. Um teste com dois `render` não precisa de boilerplate de limpeza:

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SaveButton from "@/components/SaveButton"

describe("SaveButton", () => {
    it("renderiza o label recebido", () => {
        render(<SaveButton label="Salvar alterações" />)

        expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument()
    })

    it("dispara o onClick ao ser clicado", async () => {
        const user = userEvent.setup()
        const onClick = vi.fn()
        render(<SaveButton label="Salvar alterações" onClick={onClick} />)

        await user.click(screen.getByRole("button", { name: "Salvar alterações" }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
```

Isso só funciona por causa da linha no setup — ver item 4.

O `label="Salvar alterações"` literal é aceito aqui porque `*.test.ts`/`*.test.tsx` estão liberados de `react/jsx-no-literals` (item 7). No código da aplicação, quem usa o componente passa o texto já traduzido: `<SaveButton label={t("profile.saveChanges")} />`.

### Hook com `renderHook`

Hook não renderiza JSX, então o arquivo é `.test.ts`. `renderHook` roda o hook dentro de um componente descartável, e `act` envolve a chamada que muda estado:

```ts
import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useCounter } from "@/hooks/useCounter"

describe("useCounter", () => {
    it("incrementa o valor a cada chamada", () => {
        const { result } = renderHook(() => useCounter(0))

        act(() => result.current.increment())

        expect(result.current.value).toBe(1)
    })
})
```

### Função pura

Sem render e sem `setup`: chame a função e afirme o retorno, com um `it` por regra.

```ts
import { describe, expect, it } from "vitest"
import { formatPrice } from "@/utils/formatPrice"

describe("formatPrice", () => {
    it("formata o valor em reais", () => {
        expect(formatPrice(10)).toBe("R$ 10,00")
    })
})
```

### Módulo que chama `fetch`

Troque o `fetch` global por um `vi.fn()` com `vi.stubGlobal` e desfaça o stub depois de cada teste, para ele não vazar para o seguinte. `src/services/http/test/get.test.ts` segue este formato:

```ts
import { afterEach, describe, expect, it, vi } from "vitest"
import get from "@/services/http/get"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("get", () => {
    it("devolve o corpo da resposta em JSON", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "1" }) })
        vi.stubGlobal("fetch", fetchMock)

        await expect(get<{ id: string }>("/api/items")).resolves.toEqual({ id: "1" })
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })
})
```

## 6. Testar algo que depende de rota

`src/routers/routes.tsx` tem `routes` (export default, um `RouteObject[]`) e `src/routers/Router.tsx` tem `Router` (export default, que faz `createBrowserRouter(routes)` e renderiza um `RouterProvider`). No teste você cria o router em memória com **`createMemoryRouter(routes, { initialEntries })`** e o renderiza com `RouterProvider`, como em `src/routers/test/Router.test.tsx`. As páginas são `lazy`, então a primeira asserção usa `findBy*` com `await`:

```tsx
import { describe, expect, it } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import routes from "@/routers/routes"

describe("routes", () => {
    it("renderiza a página de NotFound em uma rota inexistente", async () => {
        const router = createMemoryRouter(routes, { initialEntries: ["/rota-que-nao-existe"] })
        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole("heading", { name: "404 - Página não encontrada" })
        ).toBeInTheDocument()
    })
})
```

**Fallback do `<Suspense>`:** o `lazy()` guarda o módulo carregado no próprio `routes.tsx`, então depois que qualquer teste do arquivo renderizou a página, o fallback (`Carregando...`) não aparece mais e um teste dele passa ou falha conforme a ordem. O teste do fallback chama `vi.resetModules()` e importa `routes` de novo com `const { default: freshRoutes } = await import("@/routers/routes")`, recebendo um `lazy()` ainda não resolvido — como em `src/routers/test/Router.test.tsx`.

**Por que não renderizar o `Router` (export default):** ele usa `createBrowserRouter`, que lê a URL real do jsdom (`/`) e não aceita entrada inicial — não há como testar outra rota. O `createMemoryRouter` recebe as mesmas `routes` e deixa escolher a URL de partida.

**Para testar o conteúdo de uma tela, importe a página direto** (como no item 5) em vez de atravessar a árvore de rotas. Assim o teste falha por um motivo só: se ele renderiza via rota, uma quebra no `Router.tsx` derruba junto o teste da página, e você perde tempo procurando no lugar errado. O teste de rota testa **roteamento** (qual URL cai em qual tela); o teste de página testa conteúdo.

Componente que usa `<Link>` ou `useNavigate` também precisa de um router em volta — sem ele o render estoura na hora.

## 6b. Testar algo que usa a store (Redux / RTK Query)

`renderWithStore(ui, { preloadedState })`, de `@/testUtils/renderWithStore`, cria `createStore(preloadedState)` por chamada, envolve o `ui` em `Provider` e devolve o resultado do `render` junto da `store`. Cada chamada tem estado e cache do RTK Query isolados, então um teste não vaza para o outro. Para estado de slice, passe `preloadedState` em vez de despachar actions na mão.

O teste injeta o próprio endpoint com `api.injectEndpoints`, stuba o `fetch` com `vi.stubGlobal` e define `VITE_API_URL` absoluta com `vi.stubEnv` (o `Request` do Node não aceita URL relativa). A constante da URL é lida na carga do módulo: use `vi.resetModules()` e import dinâmico, e restaure no `afterEach`. O endpoint injetado persiste enquanto o módulo vive, então use nome único por arquivo ou `resetModules` por teste. Modelos: `src/store/test/api.test.ts` e `src/testUtils/test/renderWithStore.test.tsx`.

```tsx
import { afterEach, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

it("mostra o dado do endpoint injetado", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com")
    vi.resetModules()
    const { default: api } = await import("@/store/api")
    const { default: renderWithStore } = await import("@/testUtils/renderWithStore")
    vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(
            async () =>
                new Response(JSON.stringify({ name: "Exemplo" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                })
        )
    )
    const profileApi = api.injectEndpoints({
        endpoints: (build) => ({
            getProfile: build.query<{ name: string }, void>({ query: () => "/profile" })
        })
    })

    function Profile() {
        const { data } = profileApi.useGetProfileQuery()
        return <p>{data?.name}</p>
    }

    renderWithStore(<Profile />)

    expect(await screen.findByText("Exemplo")).toBeInTheDocument()
})
```

## 7. Texto traduzido

Todo texto de UI vem de chave (`t()`/`<Trans>`), com valor por idioma em `src/locales/`. O teste não precisa de nada para isso funcionar: **não há wrapper de render nem provider**, porque o `initReactI18next` registra a instância de `src/i18n/i18n.ts` globalmente, e o `src/setupTests.ts` deixa todo teste começando em `pt-BR` e sem escolha salva (item 4).

**Afirme o texto em `pt-BR`, nunca a chave.** `pt-BR` é a língua de referência e o idioma do reset — não o fallback `en`. Uma asserção sobre a chave (`getByRole("heading", { name: "heading" })`) passaria mesmo com a tradução vazia ou ausente, porque o i18next devolve a própria chave quando não acha valor. O texto em português é o que prova que a tradução existe e chegou à tela.

**Para testar outro idioma, troque dentro do `it` com `await setLanguage(...)`**, antes do `render`:

```tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import HomePage from "@/pages/Home.page"

describe("HomePage", () => {
    it("traduz o título e os metadados quando o idioma é es", async () => {
        await setLanguage("es")

        render(<HomePage />)

        expect(
            screen.getByRole("heading", { name: "Desarrollador full stack en TypeScript." })
        ).toBeInTheDocument()
        expect(document.title).toBe("Luiz Felipe dos Santos · Desarrollador full stack")
    })
})
```

Não precisa desfazer a troca: o `beforeEach` do setup volta para `pt-BR` e apaga a escolha que o `setLanguage` gravou, antes do próximo teste.

**Não mocke `react-i18next`.** Um mock de `useTranslation` que devolve a chave esconde exatamente o que o teste deveria pegar (chave errada, namespace não registrado em `src/i18n/resources.ts`, tradução faltando) e diverge do comportamento real de `<Trans>`.

**`*.test.ts`/`*.test.tsx` estão liberados de `react/jsx-no-literals`** por um bloco `overrides` no `.oxlintrc.json`. Em teste, `render(<SaveButton label="Salvar alterações" />)` é aceito; o mesmo literal num componente da aplicação é erro de lint.

### Simular uma nova carga de página

A detecção de idioma (`?lng=` → escolha salva → navegador → `en`) e a persistência do `?lng=` rodam uma vez só, quando `src/i18n/i18n.ts` é importado. `i18n.changeLanguage()` sem argumento não serve para reproduzir isso: ele não executa a persistência do `?lng=`. Para testar a inicialização, prepare a URL, o navegador e o `localStorage`, descarte o cache de módulos com `vi.resetModules()` e importe a instância de novo com `await import("@/i18n/i18n")` — como o `i18n.ts` cria a instância com `createInstance()`, cada import depois do reset é uma instância nova, sem estado da anterior. É o helper de `src/i18n/test/i18n.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"

interface PageLoad {
    search?: string
    browserLanguages?: string[]
}

async function loadPage({ search = "", browserLanguages = ["en-US"] }: PageLoad = {}) {
    window.history.pushState({}, "", `/${search}`)
    vi.spyOn(navigator, "languages", "get").mockReturnValue(browserLanguages)
    vi.spyOn(navigator, "language", "get").mockReturnValue(browserLanguages[0] ?? "")
    vi.resetModules()

    const { default: i18n } = await import("@/i18n/i18n")

    return i18n
}

afterEach(() => {
    vi.restoreAllMocks()
    window.history.pushState({}, "", "/")
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

describe("i18n", () => {
    it("ativa e grava o idioma de um ?lng= válido", async () => {
        const i18n = await loadPage({ search: "?lng=es", browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("es")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es")
    })
})
```

O `?lng=` é stubado com `window.history.pushState` e o `navigator` com `vi.spyOn` no getter. **Restaure os dois no `afterEach`**: `vi.restoreAllMocks()` desfaz os spies e `pushState` de volta para `"/"` limpa a URL, senão o `?lng=` e o idioma do navegador vazam para o teste seguinte (inclusive o `App.test.tsx`, que lê a URL real). Um teste que muda a URL por outro motivo, como o cenário de rota desconhecida em `src/test/App.test.tsx`, segue a mesma regra.

## 8. Queries do Testing Library

Ordem de preferência: **`getByRole` com `name`** > `getByLabelText` / `getByText` > `getByTestId` (último recurso). `getByRole` consulta a árvore de acessibilidade — o que o usuário e o leitor de tela enxergam —, então além de encontrar o elemento ele pega regressão de acessibilidade: se o `<button>` virou `<div onClick>` ou a imagem perdeu o `alt`, a query falha. `getByTestId` passa mesmo com a marcação quebrada, por isso é o último recurso.

| Prefixo    | Quando não acha           | Use para                                                                            |
| ---------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `getBy*`   | **estoura**               | afirmar que o elemento está lá (o caso comum)                                       |
| `queryBy*` | devolve `null`            | afirmar **ausência**: `expect(screen.queryByRole("alert")).not.toBeInTheDocument()` |
| `findBy*`  | estoura depois do timeout | o que aparece de forma **assíncrona** — sempre com `await`                          |

`getAllBy*`/`queryAllBy*`/`findAllBy*` para mais de um elemento. `findBy*` sem `await` devolve uma Promise que passa em qualquer `expect` de verdade/falsidade e nunca testa nada.

## 9. Interação

- **`fireEvent`** para disparar um evento cru: `fireEvent.click(element)`, `fireEvent.change(input, { target: { value: "texto" } })`.
- **`@testing-library/user-event`** quando a interação é uma sequência real de usuário (digitar caractere a caractere, `tab`, `hover`) — ele dispara a cadeia de eventos que o navegador dispararia, e por isso pega bug que o `fireEvent` não pega.

> **`@testing-library/user-event` a partir da v14.** A API é **assíncrona e baseada em instância**: crie `const user = userEvent.setup()` dentro do `it` e use `await user.click(element)`, `await user.type(input, "texto")`. Sem o `await`, a asserção seguinte roda antes do efeito da interação (teste flaky ou falso verde). Chamar `userEvent.click(...)` direto, sem `setup()`, é a forma antiga e não deve ser usada.

## 10. Erros comuns

| Sintoma                                                                                           | Causa                                                                                                                                            |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Invalid Chai property: toBeInTheDocument`                                                        | o setup não carregou: `setupFiles` saiu do bloco `test` do `vite.config.ts` (item 4)                                                             |
| `ReferenceError: expect is not defined`, apontando `src/setupTests.ts:1`                          | o import do setup foi trocado pelo entrypoint raiz do `jest-dom` em vez do subpath `/vitest` (item 4)                                            |
| "No test files found", ou exit 1 sem nenhuma falha visível                                        | nome ou lugar do arquivo fora da convenção — não é coletado, e sem `passWithNoTests` a suíte vazia falha (itens 2 e 3)                           |
| `useNavigate() may be used only in the context of a <Router>`                                     | faltou um router em volta do que usa `<Link>`/`useNavigate` (`MemoryRouter`, ou `createMemoryRouter` com `RouterProvider`; item 6)               |
| `document is not defined`                                                                         | `environment: "jsdom"` fora do bloco `test` do `vite.config.ts`                                                                                  |
| `Found multiple elements with the role ...`                                                       | render anterior não foi desmontado: alguém removeu o `afterEach(cleanup)` do `src/setupTests.ts` (item 4)                                        |
| `describe is not defined` / `vi is not defined`                                                   | falta o `import` de `vitest` — não há `globals: true`                                                                                            |
| teste de tela não acha o texto em português, mas acha o texto em inglês                           | o `beforeEach` do `src/setupTests.ts` sumiu ou trocou o `"pt-BR"` pelo fallback `en`, e o idioma veio do navegador do `jsdom` (`en-US`) (item 4) |
| teste passa sozinho e falha na suíte, com o idioma ou a URL de outro teste                        | um teste stubou `?lng=` ou o `navigator` e não restaurou no `afterEach` (item 7)                                                                 |
| o texto renderizado é a própria chave (`heading`, `meta.title`)                                   | chave sem valor, ou namespace não registrado em `src/i18n/resources.ts`: o i18next devolve a chave quando não acha tradução (item 7)             |
| asserção logo após `user.click(...)` falha de forma intermitente, ou passa sem o efeito acontecer | a interação da v14 é assíncrona e faltou o `await` (item 9)                                                                                      |

**Teste que passaria com o setup desligado não prova nada.** `expect(element).toBeTruthy()` é verdadeiro para qualquer objeto, inclusive um nó fora do documento; prefira um matcher do `jest-dom` (`toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`) que afirma algo sobre o DOM. Vale o mesmo teste de sanidade de sempre: quebre a asserção de propósito uma vez e confirme que ela fica vermelha.

## Checklist

- [ ] Arquivo em `<diretório-do-arquivo-testado>/test/<arquivo>.test.tsx`
- [ ] `describe`/`it`/`expect`/`vi` importados de `vitest`
- [ ] Import do arquivo testado com `@/`, nunca `../`
- [ ] Query por `getByRole` com `name` sempre que possível; `getByTestId` só como último recurso
- [ ] Componente que lê a store renderizado com `renderWithStore` (nunca um `Provider` montado à mão); endpoint injetado com `fetch` stubado e `VITE_API_URL` absoluta
- [ ] Router em memória em volta do que depende de rota (`createMemoryRouter(routes, ...)` + `RouterProvider`), não o `Router` default
- [ ] Nenhum `afterEach(cleanup)` local — o `src/setupTests.ts` já faz isso em toda suíte
- [ ] Texto afirmado em `pt-BR`, nunca a chave; outro idioma só com `await setLanguage(...)` dentro do `it`
- [ ] Nenhum mock de `react-i18next` e nenhum wrapper/provider de i18n no render
- [ ] URL (`pushState`) e stubs de `navigator` restaurados no `afterEach` de quem os alterou
- [ ] `user-event` na API v14 (`setup()` e `await`)
- [ ] Sem comentário no código; nome de identificador em inglês, descrição do `it` em português
- [ ] `npm test -- --run` passa, e a contagem de arquivos cresceu com o arquivo novo
- [ ] `npm run typecheck` passa

## Ao remover ou renomear o arquivo testado

Mova ou renomeie o `.test.tsx` **junto**, na mesma mudança. Se o arquivo testado sumiu e o teste ficou, ele quebra no import — visível e fácil. O caso silencioso é o contrário: um teste renomeado para fora da convenção simplesmente deixa de ser coletado, a suíte continua verde e a cobertura sumiu sem aviso. Depois de mover, rode `npm test -- --run` e **confira a contagem de arquivos**, não só o verde.
