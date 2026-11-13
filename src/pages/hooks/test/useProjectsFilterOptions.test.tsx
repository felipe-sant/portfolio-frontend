import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import useProjectsFilterOptions from "@/pages/hooks/useProjectsFilterOptions"
import projectsApi from "@/store/api/projects.api"
import createStore from "@/store/createStore"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecords from "@/testUtils/buildProjectRecords"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type ProjectType from "@/types/project/ProjectType.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

type HookProps = {
    filters: ProjectsFilters
    availableTypes: ProjectType[]
}

const BASE: HookProps = { filters: { q: "", sort: "recent" }, availableTypes: ["web"] }

const STACKS = [["React", "Node.js"], ["React"], ["Node.js"], ["Prisma"]]
const YEARS = ["2024-03", "2025-03", "2025-09", "2026-03"]

function filesFor(language: string) {
    return {
        [`content/${language}/projects.json`]: {
            items: buildProjectRecords(4, (index) => ({
                date: YEARS[index],
                stack: [{ category: "frontend", items: STACKS[index].map((name) => ({ name })) }]
            }))
        },
        [`content/${language}/profile.json`]: buildProfile({
            stack: [{ category: "frontend", items: [{ name: "React" }, { name: "Docker" }] }]
        })
    }
}

function renderOptions(props: HookProps = BASE, store = createStore()) {
    function Wrapper({ children }: { children: ReactNode }) {
        return <Provider store={store}>{children}</Provider>
    }

    return {
        store,
        ...renderHook(
            (current: HookProps) =>
                useProjectsFilterOptions(current.filters, current.availableTypes),
            {
                initialProps: props,
                wrapper: Wrapper
            }
        )
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useProjectsFilterOptions", () => {
    it("começa os tipos com Todos e lista só os disponíveis na ordem do enum", () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result } = renderOptions({
            ...BASE,
            availableTypes: ["iot", "web", "api"]
        })

        expect(result.current.typeOptions.map((option) => option.value)).toEqual([
            "",
            "web",
            "api",
            "iot"
        ])
        expect(result.current.typeOptions[0].label).toBe("Todos")
    })

    it("deixa typeValue vazio sem tipo e igual ao tipo aplicado", () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result, rerender } = renderOptions()

        expect(result.current.typeValue).toBe("")

        rerender({ ...BASE, filters: { ...BASE.filters, type: "web" } })

        expect(result.current.typeValue).toBe("web")
    })

    it("traz todas as categorias do enum e todas as ordenações", () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result } = renderOptions()

        expect(result.current.categoryOptions.map((option) => option.value)).toEqual([
            "academic",
            "personal",
            "professional"
        ])
        expect(result.current.sortOptions.map((option) => option.value)).toEqual([
            "recent",
            "oldest",
            "title"
        ])
    })

    it("começa com tecnologia e ano vazios e preenche com as opções do endpoint", async () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result } = renderOptions()

        expect(result.current.technologyOptions).toEqual([])
        expect(result.current.yearOptions).toEqual([])

        await waitFor(() => expect(result.current.technologyOptions.length).toBeGreaterThan(0))

        expect(result.current.technologyOptions).toEqual([
            { value: "Docker", count: 0 },
            { value: "Node.js", count: 2 },
            { value: "Prisma", count: 1 },
            { value: "React", count: 2 }
        ])
        expect(result.current.yearOptions).toEqual([
            { value: "2026", count: 1 },
            { value: "2025", count: 2 },
            { value: "2024", count: 1 }
        ])
    })

    it("mantém as opções vazias com o perfil falhando", async () => {
        const { "content/pt-BR/projects.json": projects } = filesFor("pt-BR")
        const fetchMock = stubContentFetch({ "content/pt-BR/projects.json": projects })
        const { store, result } = renderOptions()

        await waitFor(() => expect(fetchMock).toHaveBeenCalled())
        await waitFor(() =>
            expect(
                Object.values(store.getState().api.queries).some(
                    (entry) =>
                        entry?.endpointName ===
                            projectsApi.endpoints.getProjectFilterOptions.name &&
                        entry.status === "rejected"
                )
            ).toBe(true)
        )

        expect(result.current.technologyOptions).toEqual([])
        expect(result.current.yearOptions).toEqual([])
    })

    it("conta só tecnologia e ano em filtersCount e traz tech, year e sort em appliedFilters", () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result } = renderOptions({
            availableTypes: ["web"],
            filters: {
                q: "a",
                type: "web",
                category: "academic",
                tech: ["React", "Node.js"],
                year: ["2025"],
                sort: "oldest"
            }
        })

        expect(result.current.filtersCount).toBe(3)
        expect(result.current.appliedFilters).toEqual({
            tech: ["React", "Node.js"],
            year: ["2025"],
            sort: "oldest"
        })
    })

    it("devolve filtersCount zero e listas vazias sem tecnologia nem ano", () => {
        stubContentFetch(filesFor("pt-BR"))
        const { result } = renderOptions()

        expect(result.current.filtersCount).toBe(0)
        expect(result.current.appliedFilters).toEqual({ tech: [], year: [], sort: "recent" })
    })

    it("refaz a consulta de opções uma vez ao mudar o idioma", async () => {
        stubContentFetch({ ...filesFor("pt-BR"), ...filesFor("en") })
        const { result, store } = renderOptions()
        await waitFor(() => expect(result.current.technologyOptions.length).toBeGreaterThan(0))

        await act(() => setLanguage("en"))
        await waitFor(() => expect(result.current.typeOptions[0].label).toBe("All"))
        await waitFor(() => expect(result.current.technologyOptions.length).toBeGreaterThan(0))

        const queries = Object.values(store.getState().api.queries).filter(
            (entry) => entry?.endpointName === projectsApi.endpoints.getProjectFilterOptions.name
        )

        expect(queries.map((entry) => entry?.originalArgs)).toEqual([
            { lang: "pt-BR" },
            { lang: "en" }
        ])
    })
})
