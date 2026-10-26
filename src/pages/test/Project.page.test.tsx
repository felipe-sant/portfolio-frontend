import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import failFetchAfter from "@/testUtils/failFetchAfter"
import holdFetchAfter from "@/testUtils/holdFetchAfter"
import parseUntyped from "@/testUtils/parseUntyped"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const NAMES = { "pt-BR": "Projeto", en: "Project", es: "Proyecto" }
const ID_ONE = "0192f1a0-0000-7000-8000-000000000001"
const ID_TWO = "0192f1a0-0000-7000-8000-000000000002"
const README: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b0",
    name: "README.md",
    format: "markdown",
    translated: true
}
const SETUP: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b1",
    name: "SETUP.md",
    format: "markdown",
    translated: true
}
const LICENSE: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b2",
    name: "LICENSE",
    format: "text",
    translated: false,
    contentLanguage: "en"
}

function image(index: number) {
    return {
        large: { src: `/images/p/${index}-large.webp`, width: 1600, height: 900 },
        small: { src: `/images/p/${index}-small.webp`, width: 640, height: 360 },
        alt: `Captura ${index}`,
        caption: `Legenda ${index}`
    }
}

function buildRecords(language: (typeof LANGUAGES)[number], count = 2): ProjectRecord[] {
    return Array.from({ length: count }, (_value, index) => {
        const number = index + 1
        const id = `0192f1a0-0000-7000-8000-${String(number).padStart(12, "0")}`

        return buildProjectRecord({
            id,
            title: `${NAMES[language]} ${number}`,
            summary: `Resumo ${language} ${number}${number === 2 ? " <b>" : ""}`,
            date: `2026-${String((number % 12) + 1).padStart(2, "0")}`,
            types: number % 2 === 1 ? ["web", "api"] : ["api"],
            featured: number === 1,
            images: number === 1 ? [image(1), image(2)] : [],
            documents: number === 1 ? [README, SETUP, LICENSE] : [README],
            related: number === 1 ? [{ id: ID_TWO, reason: `Motivo ${language}` }] : []
        })
    })
}

function buildFiles(count = 2) {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/projects.json`] = { items: buildRecords(language, count) }
        files[`content/${language}/profile.json`] = buildProfile()
        files[`content/${language}/projects/${ID_ONE}/docs/README.md`] =
            `# Título\n\n## Instalação\n\nTexto do readme ${language}`
        files[`content/${language}/projects/${ID_ONE}/docs/SETUP.md`] =
            `## Passos\n\nTexto do setup ${language}`
        files[`content/${language}/projects/${ID_TWO}/docs/README.md`] =
            `## Outro\n\nReadme do segundo ${language}`
    }
    files[`content/shared/projects/${ID_ONE}/docs/LICENSE`] = "MIT License\n\nCopyright"

    return files
}

function renderProject(entry: string, count = 2) {
    const fetchMock = stubContentFetch(buildFiles(count))
    const router = createMemoryRouter(routes, { initialEntries: [entry] })
    const utils = renderWithStore(<RouterProvider router={router} />)

    return { router, fetchMock, ...utils }
}

async function projectLoaded(name = "Projeto 1") {
    return screen.findByRole("heading", { level: 1, name }, { timeout: 5000 })
}

beforeEach(() => {
    window.history.pushState({}, "", "/")
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("ProjectPage, não encontrada", () => {
    it.each([
        ["id fora do formato", "/pt-BR/projects/nao-e-um-uuid"],
        ["id inexistente", "/pt-BR/projects/0192f1a0-0000-7000-8000-000000000099"],
        ["documento fora da lista", `/pt-BR/projects/${ID_ONE}/docs/OUTRO.md`],
        ["README em /docs/", `/pt-BR/projects/${ID_ONE}/docs/README.md`],
        ["subcaminho desconhecido", `/pt-BR/projects/${ID_ONE}/outra`]
    ])("mostra a não encontrada com rodapé, noindex e sem SEO para %s", async (_name, path) => {
        renderProject(path)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Página não encontrada" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
        if (!path.endsWith("/outra")) {
            expect(screen.getByRole("contentinfo")).toBeInTheDocument()
        }
        expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
            "content",
            "noindex"
        )
        expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
        expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
    })

    it("mostra a não encontrada em inglês sem o prefixo do idioma", async () => {
        renderProject(`/projects/${ID_ONE}`)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Page not found" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
    })

    it("mostra a não encontrada no idioma do prefixo", async () => {
        renderProject(`/en/projects/${ID_ONE}/docs/OUTRO.md`)

        expect(
            await screen.findByRole(
                "heading",
                { level: 1, name: "Page not found" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
    })
})

describe("ProjectPage, rota e conteúdo", () => {
    it.each(LANGUAGES)(
        "abre o projeto e o documento em %s, com o h1 no idioma do caminho",
        async (language) => {
            const { router } = renderProject(`/${language}/projects/${ID_ONE}`)

            expect(await projectLoaded(`${NAMES[language]} 1`)).toBeInTheDocument()
            expect(document.documentElement.lang).toBe(language)

            await act(async () => {
                await router.navigate(`/${language}/projects/${ID_ONE}/docs/SETUP.md`)
            })

            expect(
                await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
            ).toBeInTheDocument()
            expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
                `${NAMES[language]} 1`
            )
        }
    )

    it("preserva o state da navegação ao trocar a caixa do nome do documento", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const state = { fromProjects: true, documentSteps: 1 }

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/setup.md`, { state })
        })

        await waitFor(() =>
            expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        )
        expect(router.state.location.state).toEqual(state)
    })

    it("o pai da rota enxerga o name da filha e troca a caixa do nome por replace", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}/docs/setup.md`)

        await waitFor(() =>
            expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        )
        expect(router.state.historyAction).toBe("REPLACE")
        expect(
            await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        ).toBeInTheDocument()
    })

    it("mostra o cabeçalho com badges, rótulo, h1 e resumo", async () => {
        const { container } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        expect(screen.getByText("Em destaque")).toBeInTheDocument()
        expect(screen.getByText("Pessoal", { selector: "span" })).toBeInTheDocument()
        const label = container.querySelector("main header p")
        expect(label?.textContent?.replace(/\s+/g, " ")).toBe("Web · API · 2026")
        expect(label?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
        expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("tabindex", "-1")
        expect(screen.getByText("Resumo pt-BR 1")).toBeInTheDocument()
    })

    it("não mostra o badge de destaque em projeto que não é destaque", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        expect(screen.queryByText("Em destaque")).not.toBeInTheDocument()
    })

    it("tem um main, um h1 e o título do README ou do documento", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        await waitFor(() => expect(document.title).toBe("Projeto 1 · Luiz Felipe dos Santos"))

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        })

        await waitFor(() =>
            expect(document.title).toBe("SETUP.md · Projeto 1 · Luiz Felipe dos Santos")
        )
    })

    it("põe galeria, ficha e documentação nessa ordem no HTML", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const gallery = screen.getByRole("region", { name: "Galeria" })
        const facts = screen.getByRole("heading", { level: 2, name: "Ficha técnica" })
        const documentTitle = screen.getByRole("heading", { level: 2, name: "README.md" })

        expect(within(gallery).getByRole("img", { name: "Captura 1" })).toBeInTheDocument()
        expect(
            gallery.compareDocumentPosition(facts) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        expect(
            facts.compareDocumentPosition(documentTitle) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
    })

    it("sem capturas, mostra o placeholder no lugar da galeria", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        expect(screen.queryByRole("region", { name: "Galeria" })).not.toBeInTheDocument()
    })

    it("tem a barra de volta como link real, sem Próximo nem contador", async () => {
        const { container } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const back = screen.getByRole("link", { name: "Voltar para Projetos" })

        expect(back).toHaveAttribute("href", "/pt-BR/projects")
        expect(back.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
        expect(screen.queryByText(/Próximo/)).not.toBeInTheDocument()
        expect(container.textContent).not.toMatch(/Projeto \d+ de \d+/)
    })

    it("com relacionados mostra a seção e leva ao outro projeto com foco no h1; sem, a seção não existe", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        const related = screen.getByRole("heading", { level: 2, name: "Projetos relacionados" })

        expect(related).toBeInTheDocument()
        expect(screen.getByText("Motivo pt-BR")).toBeInTheDocument()

        await user.click(screen.getByRole("link", { name: "Projeto 2" }))

        expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID_TWO}`)
        const heading = await projectLoaded("Projeto 2")
        await waitFor(() => expect(heading).toHaveFocus())
        expect(
            screen.queryByRole("heading", { name: "Projetos relacionados" })
        ).not.toBeInTheDocument()
    })

    it("troca de documento pela nav sem refazer o projeto, sem skeleton e com foco no título", async () => {
        const user = userEvent.setup()
        const { store } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        await user.click(screen.getByRole("button", { name: /Imagem 2 de 2/ }))

        await user.click(screen.getByRole("link", { name: "SETUP.md: Projeto 1" }))

        const title = await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        await waitFor(() => expect(title).toHaveFocus())
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Projeto 1")
        expect(screen.getByText("2 de 2")).toBeInTheDocument()
        const projectQueries = Object.values(store.getState().api.queries).filter(
            (query) => query?.endpointName === "getProject"
        )
        expect(projectQueries).toHaveLength(1)
        expect(await screen.findByText("Passos", {}, { timeout: 5000 })).toBeInTheDocument()
    })

    it("troca de idioma num documento mantendo id, documento e âncora", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md#passos`)
        await projectLoaded()

        await user.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        const link = screen.getByRole("link", { name: "English" })
        expect(link).toHaveAttribute("href", `/en/projects/${ID_ONE}/docs/SETUP.md#passos`)
        await user.click(link)

        await waitFor(() =>
            expect(router.state.location.pathname).toBe(`/en/projects/${ID_ONE}/docs/SETUP.md`)
        )
        expect(router.state.location.hash).toBe("#passos")
        expect(await projectLoaded("Project 1")).toBeInTheDocument()
    })

    it("dá nome que diz o destino a todo link da tela", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        for (const link of within(screen.getByRole("main")).getAllByRole("link")) {
            expect(link).toHaveAccessibleName(/\S{3,}/)
            expect(link.textContent).not.toMatch(/^(clique aqui|saiba mais|aqui)$/i)
        }
    })

    it("volta da tela à lista com a busca, o filtro e a quantidade, depois de abrir dois documentos", async () => {
        const user = userEvent.setup()
        const { router } = renderProject("/pt-BR/projects?type=web", 20)
        await user.click(
            await screen.findByRole("button", { name: "Carregar mais" }, { timeout: 5000 })
        )
        const card = await screen.findByRole("link", { name: "Projeto 1" }, { timeout: 5000 })

        await user.click(card)
        await projectLoaded()
        await user.click(screen.getByRole("link", { name: "SETUP.md: Projeto 1" }))
        await screen.findByRole("heading", { level: 2, name: "SETUP.md" })
        await user.click(screen.getByRole("link", { name: "LICENSE: Projeto 1" }))
        await screen.findByRole("heading", { level: 2, name: "LICENSE" })
        await user.click(screen.getByRole("link", { name: "Voltar para Projetos" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/pt-BR/projects"))
        expect(router.state.location.search).toBe("?type=web")
        await waitFor(() =>
            expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThanOrEqual(10)
        )
    }, 30000)

    it("sem a marca, a barra de volta abre /projects sem query", async () => {
        const user = userEvent.setup()
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}?x=1`)
        await projectLoaded()

        await user.click(screen.getByRole("link", { name: "Voltar para Projetos" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/pt-BR/projects"))
        expect(router.state.location.search).toBe("")
    })

    it("não tem violações de acessibilidade com o README nem com um documento de texto", async () => {
        const { container, router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()
        await screen.findByRole("heading", { level: 3, name: "Instalação" }, { timeout: 10000 })
        await expectNoAxeViolations(container)

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/LICENSE`)
        })
        await screen.findByRole("region", { name: "LICENSE" }, { timeout: 5000 })

        await expectNoAxeViolations(container)
    }, 40000)
})

function startRender(entry: string) {
    const fetchMock = stubContentFetch(buildFiles())
    const control = { fetchMock }
    const router = createMemoryRouter(routes, { initialEntries: [entry] })

    return {
        control,
        router,
        render: () => renderWithStore(<RouterProvider router={router} />)
    }
}

describe("ProjectPage, carregando e erro", () => {
    it.each([
        ["README", `/pt-BR/projects/${ID_ONE}`],
        ["documento", `/pt-BR/projects/${ID_ONE}/docs/SETUP.md`]
    ])(
        "mostra a barra de volta, o skeleton e o aviso, sem h1, com o título genérico (%s)",
        async (_name, path) => {
            const { control, render } = startRender(path)
            const release = holdFetchAfter(control.fetchMock, 0)
            const { container } = render()

            const status = await screen.findByText("Carregando...", {}, { timeout: 5000 })
            expect(status).toHaveAttribute("role", "status")
            expect(screen.getByRole("link", { name: "Voltar para Projetos" })).toBeInTheDocument()
            expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument()
            expect(container.querySelector('main [aria-hidden="true"]')).toBeInTheDocument()
            await waitFor(() => expect(document.title).toBe("Projeto · Luiz Felipe dos Santos"))
            expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()

            await act(async () => {
                release()
            })
            await projectLoaded()
        }
    )

    it("não tem violações de acessibilidade carregando", async () => {
        const { control, render } = startRender(`/pt-BR/projects/${ID_ONE}`)
        holdFetchAfter(control.fetchMock, 0)
        const { container } = render()
        await screen.findByText("Carregando...", {}, { timeout: 5000 })

        await expectNoAxeViolations(container)
    }, 20000)

    it("não tem violações de acessibilidade em erro", async () => {
        const { control, render } = startRender(`/pt-BR/projects/${ID_ONE}`)
        failFetchAfter(control.fetchMock, 0)
        const { container } = render()
        await screen.findByRole("alert", {}, { timeout: 5000 })

        await expectNoAxeViolations(container)
    }, 20000)

    it("leva o foco ao h1 quando o conteúdo chega, se o visitante não moveu o foco", async () => {
        const { control, router, render } = startRender("/pt-BR/projects")
        render()
        await screen.findAllByRole("heading", { level: 2 }, { timeout: 5000 })
        const release = holdFetchAfter(control.fetchMock, 0)

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_TWO}`)
        })
        await screen.findByText("Carregando...", {}, { timeout: 5000 })
        await act(async () => {
            release()
        })

        const heading = await projectLoaded("Projeto 2")
        await waitFor(() => expect(heading).toHaveFocus())
    })

    it("mantém o foco onde o visitante o pôs ao chegar o conteúdo", async () => {
        const { control, router, render } = startRender("/pt-BR/projects")
        render()
        await screen.findAllByRole("heading", { level: 2 }, { timeout: 5000 })
        const release = holdFetchAfter(control.fetchMock, 0)

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_TWO}`)
        })
        await screen.findByText("Carregando...", {}, { timeout: 5000 })
        const back = screen.getByRole("link", { name: "Voltar para Projetos" })
        back.focus()
        await act(async () => {
            release()
        })

        const heading = await projectLoaded("Projeto 2")
        expect(heading).not.toHaveFocus()
        expect(back).toHaveFocus()
    })

    it("mostra o erro com alerta, h1 e saída, sem texto técnico, e tenta de novo sem recarregar", async () => {
        const user = userEvent.setup()
        const { control, render } = startRender(`/pt-BR/projects/${ID_ONE}`)
        const recover = failFetchAfter(control.fetchMock, 0)
        const { container } = render()

        const alert = await screen.findByRole("alert", {}, { timeout: 5000 })
        expect(
            within(alert).getByRole("heading", {
                level: 1,
                name: "Não consegui carregar este projeto"
            })
        ).toBeInTheDocument()
        expect(
            within(alert).getByText(
                "Os dados do projeto não chegaram. O restante do site continua funcionando."
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Voltar para Projetos" })).toBeInTheDocument()
        expect(within(alert).getByRole("link", { name: "Ver outros projetos" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
        expect(container.textContent).not.toMatch(/500|Falha|status/)
        expect(document.title).toBe("Projeto · Luiz Felipe dos Santos")

        recover()
        await user.click(within(alert).getByRole("button", { name: "Tentar novamente" }))

        expect(await projectLoaded()).toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it.each([
        ["en", "Loading..."],
        ["es", "Cargando..."]
    ] as const)("traduz o carregando em %s", async (language, loading) => {
        const { control, render } = startRender(`/${language}/projects/${ID_ONE}`)
        holdFetchAfter(control.fetchMock, 0)
        render()

        expect(await screen.findByText(loading, {}, { timeout: 5000 })).toBeInTheDocument()
    })

    it.each([
        ["en", "I couldn't load this project"],
        ["es", "No pude cargar este proyecto"]
    ] as const)("traduz o erro em %s", async (language, errorHeading) => {
        const { control, render } = startRender(`/${language}/projects/${ID_ONE}`)
        failFetchAfter(control.fetchMock, 0)
        render()

        expect(
            await screen.findByRole("heading", { level: 1, name: errorHeading }, { timeout: 5000 })
        ).toBeInTheDocument()
    })
})

const SITE = "http://localhost:5173"

function head(selector: string) {
    return document.head.querySelector(selector)
}

function jsonLdNodes() {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (script) => parseUntyped(script.textContent ?? "")
    )
}

describe("ProjectPage, SEO", () => {
    it("com imagem usa a variante grande da primeira captura com alt, largura e altura", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        await waitFor(() =>
            expect(head('meta[property="og:image"]')).toHaveAttribute(
                "content",
                `${SITE}/images/p/1-large.webp`
            )
        )
        expect(head('meta[property="og:image:alt"]')).toHaveAttribute("content", "Captura 1")
        expect(head('meta[property="og:image:width"]')).toHaveAttribute("content", "1600")
        expect(head('meta[property="og:image:height"]')).toHaveAttribute("content", "900")
    })

    it("sem imagem usa a imagem padrão do site e o alt padrão", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        await waitFor(() =>
            expect(head('meta[property="og:image"]')).toHaveAttribute(
                "content",
                `${SITE}/images/og-site.png`
            )
        )
        expect(head('meta[property="og:image:width"]')).toHaveAttribute("content", "1200")
        expect(head('meta[property="og:image:alt"]')?.getAttribute("content")).toMatch(/\S{5,}/)
    })

    it("tem a mesma descrição, igual ao resumo, no README e nos outros documentos", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        for (const path of ["", "/docs/SETUP.md"]) {
            await act(async () => {
                await router.navigate(`/pt-BR/projects/${ID_ONE}${path}`)
            })
            await waitFor(() =>
                expect(head('meta[name="description"]')).toHaveAttribute(
                    "content",
                    "Resumo pt-BR 1"
                )
            )
            expect(head('meta[property="og:description"]')).toHaveAttribute(
                "content",
                "Resumo pt-BR 1"
            )
        }
    })

    it.each(LANGUAGES)(
        "README em %s tem canônica, hreflang, og:type article e og:url",
        async (language) => {
            renderProject(`/${language}/projects/${ID_ONE}`)
            await projectLoaded(`${NAMES[language]} 1`)

            const canonical = `${SITE}/${language}/projects/${ID_ONE}`
            await waitFor(() =>
                expect(head('link[rel="canonical"]')).toHaveAttribute("href", canonical)
            )
            expect(head('meta[property="og:url"]')).toHaveAttribute("content", canonical)
            expect(head('meta[property="og:type"]')).toHaveAttribute("content", "article")
            expect(head('meta[name="twitter:card"]')).toHaveAttribute(
                "content",
                "summary_large_image"
            )
            expect(head('link[hreflang="x-default"]')).toHaveAttribute(
                "href",
                `${SITE}/en/projects/${ID_ONE}`
            )
            for (const item of LANGUAGES) {
                expect(head(`link[hreflang="${item}"]`)).toHaveAttribute(
                    "href",
                    `${SITE}/${item}/projects/${ID_ONE}`
                )
            }
        }
    )

    it("documento além do README tem canônica do nome exato mesmo aberto em outra caixa", async () => {
        renderProject(`/pt-BR/projects/${ID_ONE}/docs/setup.md`)
        await screen.findByRole("heading", { level: 2, name: "SETUP.md" }, { timeout: 5000 })

        const canonical = `${SITE}/pt-BR/projects/${ID_ONE}/docs/SETUP.md`
        await waitFor(() =>
            expect(head('link[rel="canonical"]')).toHaveAttribute("href", canonical)
        )
        expect(head('meta[property="og:url"]')).toHaveAttribute("content", canonical)
        expect(head('link[hreflang="es"]')).toHaveAttribute(
            "href",
            `${SITE}/es/projects/${ID_ONE}/docs/SETUP.md`
        )
        expect(head('link[hreflang="x-default"]')).toHaveAttribute(
            "href",
            `${SITE}/en/projects/${ID_ONE}/docs/SETUP.md`
        )
    })

    it("README tem um JSON-LD do projeto e o documento além do README tem também o TechArticle", async () => {
        const { router } = renderProject(`/pt-BR/projects/${ID_ONE}`)
        await projectLoaded()

        await waitFor(() => expect(jsonLdNodes()).toHaveLength(1))
        const [project] = jsonLdNodes()
        expect(project["@id"]).toBe(`${SITE}/pt-BR/projects/${ID_ONE}#project`)
        expect(["SoftwareSourceCode", "CreativeWork"]).toContain(project["@type"])

        await act(async () => {
            await router.navigate(`/pt-BR/projects/${ID_ONE}/docs/SETUP.md`)
        })

        await waitFor(() => expect(jsonLdNodes()).toHaveLength(2))
        const article = jsonLdNodes().find((node) => node["@type"] === "TechArticle")
        expect(article?.about).toEqual({ "@id": `${SITE}/pt-BR/projects/${ID_ONE}#project` })
    })

    it("escapa o < no JSON-LD", async () => {
        renderProject(`/pt-BR/projects/${ID_TWO}`)
        await projectLoaded("Projeto 2")

        await waitFor(() => expect(jsonLdNodes()).toHaveLength(1))
        const raw = document.querySelector('script[type="application/ld+json"]')?.textContent
        expect(raw).not.toContain("<")
        expect(raw).toContain("\\u003cb>")
    })

    it.each([
        ["carregando", () => holdOnly()],
        ["erro", () => failOnly()],
        ["documento inexistente", () => notFoundOnly()]
    ])("não declara canônica, Open Graph nem JSON-LD em %s", async (_name, setup) => {
        await setup()

        expect(head('link[rel="canonical"]')).toBeNull()
        expect(head('meta[property="og:title"]')).toBeNull()
        expect(document.querySelector('script[type="application/ld+json"]')).toBeNull()
    })
})

async function holdOnly() {
    const fetchMock = stubContentFetch(buildFiles())
    holdFetchAfter(fetchMock, 0)
    const router = createMemoryRouter(routes, { initialEntries: [`/pt-BR/projects/${ID_ONE}`] })
    renderWithStore(<RouterProvider router={router} />)
    await screen.findByText("Carregando...", {}, { timeout: 5000 })
}

async function failOnly() {
    const fetchMock = stubContentFetch(buildFiles())
    failFetchAfter(fetchMock, 0)
    const router = createMemoryRouter(routes, { initialEntries: [`/pt-BR/projects/${ID_ONE}`] })
    renderWithStore(<RouterProvider router={router} />)
    await screen.findByRole("alert", {}, { timeout: 5000 })
}

async function notFoundOnly() {
    renderProject(`/pt-BR/projects/${ID_ONE}/docs/OUTRO.md`)
    await screen.findByRole(
        "heading",
        { level: 1, name: "Página não encontrada" },
        { timeout: 5000 }
    )
}
