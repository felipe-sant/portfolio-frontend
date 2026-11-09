import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, render } from "@testing-library/react"
import useProjectsFilters from "@/pages/hooks/useProjectsFilters"

vi.mock("@/hooks/useHasHydrated", () => ({ default: () => true }))

type FiltersHook = ReturnType<typeof useProjectsFilters>

const PATH = "/pt-BR/projects"
const DEBOUNCE = 300

let latest: FiltersHook
let release: () => void = () => undefined
let isHolding = false
let holdPromise: Promise<null> = Promise.resolve(null)

function holdNavigation() {
    isHolding = true
    holdPromise = new Promise<null>((resolve) => {
        release = () => {
            isHolding = false
            resolve(null)
        }
    })
}

function Probe() {
    const hook = useProjectsFilters()

    useEffect(() => {
        latest = hook
    })

    return null
}

function renderHook(initialPath = PATH) {
    const router = createMemoryRouter(
        [{ path: PATH, element: <Probe />, loader: () => (isHolding ? holdPromise : null) }],
        { initialEntries: [initialPath] }
    )

    render(<RouterProvider router={router} />)

    return router
}

async function flush() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
    })
}

async function advanceDebounce() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE)
    })
}

async function settle() {
    await act(async () => {
        release()
        await vi.advanceTimersByTimeAsync(0)
    })
}

describe("useProjectsFilters", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        isHolding = false
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("mantém o q já aplicado quando tipo e categoria concluem um depois do outro", async () => {
        const router = renderHook(`${PATH}?q=react`)
        await flush()

        act(() => latest.setType("web"))
        await flush()
        act(() => latest.setCategory("personal"))
        await flush()

        expect(router.state.location.search).toBe("?q=react&type=web&category=personal")
    })

    it("soma busca, tipo e categoria disparados antes de a navegação do q concluir", async () => {
        const router = renderHook()
        await flush()
        holdNavigation()

        act(() => latest.setDraft("react"))
        await advanceDebounce()
        act(() => latest.setType("web"))
        act(() => latest.setCategory("personal"))
        await settle()

        expect(router.state.location.search).toBe("?q=react&type=web&category=personal")
        expect(latest.filters).toMatchObject({ q: "react", type: "web", category: "personal" })
    })

    it("mantém o campo igual ao q da URL nessa sequência", async () => {
        renderHook()
        await flush()
        holdNavigation()

        act(() => latest.setDraft("react"))
        await advanceDebounce()
        act(() => latest.setType("web"))
        act(() => latest.setCategory("personal"))
        await settle()

        expect(latest.draft).toBe("react")
        expect(latest.filters.q).toBe(latest.draft)
    })

    it("preserva os três na ordem inversa, categoria e tipo antes da busca concluir", async () => {
        const router = renderHook()
        await flush()
        holdNavigation()

        act(() => latest.setDraft("react"))
        await advanceDebounce()
        act(() => latest.setCategory("personal"))
        act(() => latest.setType("web"))
        await settle()

        expect(router.state.location.search).toBe("?q=react&type=web&category=personal")
    })

    it("preserva o q quando os filtros do modal são aplicados com a navegação presa", async () => {
        const router = renderHook()
        await flush()
        holdNavigation()

        act(() => latest.setDraft("react"))
        await advanceDebounce()
        act(() => latest.applyModalFilters({ tech: ["react"], year: ["2024"], sort: "title" }))
        await settle()

        expect(new URLSearchParams(router.state.location.search).get("q")).toBe("react")
        expect(latest.filters).toMatchObject({ q: "react", tech: ["react"], year: ["2024"] })
    })

    it("parte da nova URL quando uma navegação externa acontece com alvo pendente", async () => {
        const router = renderHook()
        await flush()
        holdNavigation()

        act(() => latest.setDraft("react"))
        await advanceDebounce()
        release()
        await act(async () => {
            await router.navigate(`${PATH}?type=api`)
        })
        await flush()
        act(() => latest.setCategory("personal"))
        await flush()

        expect(router.state.location.search).toBe("?type=api&category=personal")
    })

    it("esvazia campo e q ao limpar a busca", async () => {
        const router = renderHook(`${PATH}?q=react&type=web`)
        await flush()

        act(() => latest.clearSearch())
        await flush()

        expect(latest.draft).toBe("")
        expect(router.state.location.search).toBe("?type=web")
    })

    it("esvazia campo e filtros ao limpar os filtros", async () => {
        const router = renderHook(`${PATH}?q=react&type=web`)
        await flush()

        act(() => latest.clearFilters())
        await flush()

        expect(latest.draft).toBe("")
        expect(router.state.location.search).toBe("")
    })
})
