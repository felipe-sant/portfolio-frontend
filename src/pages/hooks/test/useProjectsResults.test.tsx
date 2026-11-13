import { afterEach, describe, expect, it, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import useProjectsResults from "@/pages/hooks/useProjectsResults"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import projectsElementIds from "@/utils/projectsElementIds"

type Pages = Parameters<typeof useProjectsResults>[0]

type HookProps = {
    pages: Pages
    hasFilters: boolean
}

function buildPages(overrides: Partial<Pages> = {}): Pages {
    return {
        hasData: true,
        items: [],
        shown: 0,
        total: 0,
        availableTypes: ["web"],
        isLoading: false,
        isError: false,
        retry: vi.fn(async () => undefined),
        ...overrides
    }
}

function renderResults(pages: Pages, hasFilters = false) {
    return renderHook((props: HookProps) => useProjectsResults(props.pages, props.hasFilters), {
        initialProps: { pages, hasFilters }
    })
}

afterEach(() => {
    document.body.innerHTML = ""
})

describe("useProjectsResults", () => {
    it("devolve o texto vazio com erro e sem dados", () => {
        expect(
            renderResults(buildPages({ isError: true, hasData: false, total: 5 })).result.current
                .text
        ).toBe("")
        expect(renderResults(buildPages({ hasData: false })).result.current.text).toBe("")
    })

    it("mostra o texto de carregando enquanto carrega", () => {
        const { result } = renderResults(buildPages({ isLoading: true, hasData: false }))

        expect(result.current.text).toBe("Carregando projetos…")
    })

    it("conta com nenhum projeto e com total e mostrados", () => {
        expect(renderResults(buildPages({ total: 0 })).result.current.text).toBe("0 projetos")
        expect(renderResults(buildPages({ total: 10, shown: 9 })).result.current.text).toBe(
            "9 de 10 projetos"
        )
        expect(renderResults(buildPages({ total: 1, shown: 1 })).result.current.text).toBe(
            "1 de 1 projeto"
        )
    })

    it("escreve a contagem no idioma ativo", async () => {
        await setLanguage("en")

        const { result } = renderResults(buildPages({ total: 10, shown: 9 }))

        expect(result.current.text).toBe("9 of 10 projects")
    })

    it("começa com texto vazio sem dados e mantém o anterior até o novo chegar", () => {
        const texts: string[] = []
        const { rerender } = renderHook(
            (props: HookProps) => {
                const results = useProjectsResults(props.pages, props.hasFilters)
                texts.push(results.text)

                return results
            },
            {
                initialProps: {
                    pages: buildPages({ isLoading: true, hasData: false }),
                    hasFilters: false
                }
            }
        )

        expect(texts[0]).toBe("")

        rerender({ pages: buildPages({ total: 10, shown: 9 }), hasFilters: false })

        expect(texts.at(-1)).toBe("9 de 10 projetos")
    })

    it("marca isEmptyContent só com dados, total zero, sem filtro e sem tipo disponível", () => {
        const base = { total: 0, availableTypes: [] }

        expect(renderResults(buildPages(base)).result.current.isEmptyContent).toBe(true)
        expect(
            renderResults(buildPages({ ...base, hasData: false })).result.current.isEmptyContent
        ).toBe(false)
        expect(renderResults(buildPages(base), true).result.current.isEmptyContent).toBe(false)
        expect(
            renderResults(buildPages({ ...base, availableTypes: ["web"] })).result.current
                .isEmptyContent
        ).toBe(false)
        expect(
            renderResults(buildPages({ total: 3, availableTypes: [] })).result.current
                .isEmptyContent
        ).toBe(false)
    })

    it("marca isNoResults com total zero que não é conteúdo vazio", () => {
        expect(
            renderResults(buildPages({ total: 0, availableTypes: ["web"] })).result.current
                .isNoResults
        ).toBe(true)
        expect(
            renderResults(buildPages({ total: 0, availableTypes: [] }), true).result.current
                .isNoResults
        ).toBe(true)
        expect(
            renderResults(buildPages({ total: 0, availableTypes: [] })).result.current.isNoResults
        ).toBe(false)
        expect(renderResults(buildPages({ total: 2 })).result.current.isNoResults).toBe(false)
    })

    it("libera canClearFilters só com filtro, sem carregar, sem erro e sem resultado vazio", () => {
        const withResults = { total: 2, shown: 2 }

        expect(renderResults(buildPages(withResults), true).result.current.canClearFilters).toBe(
            true
        )
        expect(renderResults(buildPages(withResults), false).result.current.canClearFilters).toBe(
            false
        )
        expect(
            renderResults(buildPages({ ...withResults, isLoading: true }), true).result.current
                .canClearFilters
        ).toBe(false)
        expect(
            renderResults(buildPages({ ...withResults, isError: true }), true).result.current
                .canClearFilters
        ).toBe(false)
        expect(renderResults(buildPages({ total: 0 }), true).result.current.canClearFilters).toBe(
            false
        )
    })

    it("separa principais e experimentos na ordem recebida", () => {
        const items = [
            buildProjectSummary({ id: "a", title: "A", experiment: false }),
            buildProjectSummary({ id: "b", title: "B", experiment: true }),
            buildProjectSummary({ id: "c", title: "C", experiment: false }),
            buildProjectSummary({ id: "d", title: "D", experiment: true })
        ]

        const { result } = renderResults(buildPages({ items, total: 4, shown: 4 }))

        expect(result.current.mainItems.map((item) => item.title)).toEqual(["A", "C"])
        expect(result.current.experimentItems.map((item) => item.title)).toEqual(["B", "D"])
    })

    it("no retry foca o título antes de refazer a consulta e devolve a promessa", async () => {
        const heading = document.createElement("h1")
        heading.id = projectsElementIds.heading
        heading.tabIndex = -1
        document.body.appendChild(heading)
        const order: string[] = []
        const retry = vi.fn(async () => {
            order.push(document.activeElement === heading ? "focused" : "not-focused")
        })
        const { result } = renderResults(buildPages({ retry }))

        const promise = result.current.retry()

        expect(promise).toBeInstanceOf(Promise)
        await promise
        expect(retry).toHaveBeenCalledTimes(1)
        expect(order).toEqual(["focused"])
    })
})
