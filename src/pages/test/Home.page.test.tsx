import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { act, screen, waitFor, within } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import HomePage from "@/pages/Home.page"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"

const SITE_URL = "http://localhost:5173"

function renderHomePage() {
    return renderWithStore(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    )
}

function readJsonLd() {
    const script = document.querySelector('script[type="application/ld+json"]')
    return JSON.parse(script?.textContent ?? "null")
}

const FEATURED_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f51"

function buildTimeline() {
    return {
        items: [
            buildTimelineItemRecord({
                id: "job",
                kind: "experience",
                title: "Dev Fullstack",
                organization: "Empresa Exemplo",
                start: "2024-06"
            }),
            buildTimelineItemRecord({
                id: "degree",
                kind: "education",
                title: "Tecnólogo em Software",
                organization: "Fatec",
                stage: "6º semestre",
                start: "2023-02"
            })
        ]
    }
}

function buildProjects() {
    return {
        items: [
            buildProjectRecord({
                id: FEATURED_ID,
                title: "Projeto Destaque",
                summary: "Resumo do destaque.",
                featured: true,
                types: ["web", "api"],
                category: "academic",
                cardTechnologies: ["React", "Node.js"]
            }),
            buildProjectRecord({ title: "Projeto Comum", featured: false })
        ]
    }
}

function buildFiles(overrides: Record<string, unknown> = {}) {
    const files: Record<string, unknown> = {}

    for (const language of ["pt-BR", "en", "es"]) {
        files[`content/${language}/profile.json`] = buildProfile({
            links: { github: "https://github.com/example" }
        })
        files[`content/${language}/timeline.json`] = buildTimeline()
        files[`content/${language}/projects.json`] = buildProjects()
    }

    return { ...files, ...overrides }
}

function without(files: Record<string, unknown>, path: string) {
    const rest = { ...files }
    delete rest[path]

    return rest
}

beforeEach(() => {
    stubContentFetch(buildFiles())
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("HomePage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = renderHomePage()

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza o título principal", () => {
        renderHomePage()

        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
    })

    it("renderiza a frase de apresentação do perfil", async () => {
        renderHomePage()

        expect(
            await screen.findByText("Trabalho em produtos web de ponta a ponta.")
        ).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        renderHomePage()

        expect(document.title).toBe("Portfólio · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato."
        )
    })

    it("traduz título e meta description quando o idioma é en", async () => {
        await setLanguage("en")

        renderHomePage()

        expect(document.title).toBe("Portfolio · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfolio of Luiz Felipe dos Santos, full stack developer in TypeScript: projects, background and contact."
        )
    })

    it("traduz os metadados quando o idioma é es", async () => {
        await setLanguage("es")

        renderHomePage()

        expect(document.title).toBe("Portafolio · Luiz Felipe dos Santos")
    })

    it("atualiza texto, metadados e lang do html ao trocar o idioma com a página aberta", async () => {
        renderHomePage()
        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()

        await act(() => setLanguage("es"))

        expect(
            screen.getByRole("heading", { name: "Desarrollador full stack en TypeScript" })
        ).toBeInTheDocument()
        expect(document.title).toBe("Portafolio · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portafolio de Luiz Felipe dos Santos, desarrollador full stack en TypeScript: proyectos, trayectoria y contacto."
        )
        expect(document.documentElement.lang).toBe("es")
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "declara canônica, quatro hreflang e JSON-LD em %s",
        async (language) => {
            await setLanguage(language)

            renderHomePage()

            expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
                `${SITE_URL}/${language}`
            )
            expect(document.head.querySelectorAll("link[rel='alternate'][hreflang]")).toHaveLength(
                4
            )
            const [website, person] = readJsonLd()["@graph"]
            expect(website["@type"]).toBe("WebSite")
            expect(website.inLanguage).toBe(language)
            expect(person["@id"]).toBe(`${SITE_URL}/${language}#person`)
            expect(website.publisher["@id"]).toBe(person["@id"])
        }
    )

    it("completa sameAs e knowsAbout com o perfil carregado", async () => {
        renderHomePage()

        await act(async () => {
            await Promise.resolve()
        })

        await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        await expect.poll(() => readJsonLd()["@graph"][1].knowsAbout).toEqual(["TypeScript"])
        expect(readJsonLd()["@graph"][1].sameAs).toEqual(["https://github.com/example"])
    })

    it("mostra todos os blocos na ordem hero, status, stack e destaques", async () => {
        renderHomePage()

        const status = await screen.findByRole("heading", { name: "O que faço agora" })
        const stack = await screen.findByRole("heading", { name: "Tecnologias que uso" })
        const featured = await screen.findByRole("heading", { name: "Projetos em destaque" })
        const hero = screen.getByRole("heading", { level: 1 })

        expect(hero.compareDocumentPosition(status)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        expect(status.compareDocumentPosition(stack)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        expect(stack.compareDocumentPosition(featured)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        expect(screen.getByText("Disponível para projetos")).toBeInTheDocument()
        expect(screen.getByText("Dev Fullstack")).toBeInTheDocument()
        expect(screen.getByText(/Tecnólogo em Software/)).toBeInTheDocument()
        expect(screen.getByText("desde 06/2024")).toBeInTheDocument()
        expect(screen.getByText("6º semestre")).toBeInTheDocument()
        expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0)
    })

    it("lista só o destaque marcado, com um link para o projeto e o rótulo de metadados", async () => {
        renderHomePage()

        const link = await screen.findByRole("link", { name: "Projeto Destaque" })

        expect(link).toHaveAttribute("href", `/pt-BR/projects/${FEATURED_ID}`)
        expect(screen.queryByText("Projeto Comum")).not.toBeInTheDocument()
        expect(screen.getByText(/Web.*API.*Acadêmico.*2026/)).toBeInTheDocument()
    })

    it("aponta os links para projetos, sobre e currículo com o prefixo do idioma", async () => {
        renderHomePage()

        await screen.findByRole("link", { name: "Projeto Destaque" })

        expect(screen.getByRole("link", { name: /Ver projetos/ })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
        expect(screen.getAllByRole("link", { name: "Ver todos os projetos" })).toHaveLength(2)
        for (const link of screen.getAllByRole("link", { name: "Ver todos os projetos" })) {
            expect(link).toHaveAttribute("href", "/pt-BR/projects")
        }
        expect(screen.getByRole("link", { name: "Ler sobre mim" })).toHaveAttribute(
            "href",
            "/pt-BR/about"
        )
        const resume = screen.getByRole("link", {
            name: "Baixar CV (PDF), abre a pré-visualização"
        })
        expect(resume).toHaveAttribute("href", "/cv/cv-pt-BR.pdf")
        expect(resume).not.toHaveAttribute("download")
        expect(resume).not.toHaveAttribute("target")
    })

    it.each([
        ["en", "Featured projects", "View all projects"],
        ["es", "Proyectos destacados", "Ver todos los proyectos"]
    ] as const)("traduz a tela em %s", async (language, heading, viewAll) => {
        await setLanguage(language)

        renderHomePage()

        expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument()
        expect(screen.getAllByRole("link", { name: viewAll })).toHaveLength(2)
        expect(await screen.findByRole("link", { name: "Projeto Destaque" })).toHaveAttribute(
            "href",
            `/${language}/projects/${FEATURED_ID}`
        )
        expect(screen.queryByText(/^home:|^common:/)).not.toBeInTheDocument()
    })

    it("mostra um único status de carregamento e o remove quando os dados chegam", async () => {
        renderHomePage()

        expect(screen.getAllByRole("status")).toHaveLength(1)
        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Ver projetos/ })).toBeInTheDocument()

        await screen.findByRole("link", { name: "Projeto Destaque" })
        await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())
    })

    it("não mostra o selo quando o perfil não está disponível", async () => {
        stubContentFetch(
            buildFiles({
                "content/pt-BR/profile.json": buildProfile({
                    availability: { isAvailable: false, label: "Indisponível" }
                })
            })
        )

        renderHomePage()

        await screen.findByRole("link", { name: "Projeto Destaque" })
        expect(screen.queryByText("Indisponível")).not.toBeInTheDocument()
        expect(screen.queryByText("Disponível para projetos")).not.toBeInTheDocument()
    })

    it("some com a seção de status quando nada está em curso", async () => {
        stubContentFetch(buildFiles({ "content/pt-BR/timeline.json": { items: [] } }))

        renderHomePage()

        await screen.findByRole("link", { name: "Projeto Destaque" })
        expect(screen.queryByRole("heading", { name: "O que faço agora" })).not.toBeInTheDocument()
    })

    it("some só com o card sem item em curso", async () => {
        const [job] = buildTimeline().items
        stubContentFetch(buildFiles({ "content/pt-BR/timeline.json": { items: [job] } }))

        renderHomePage()

        expect(await screen.findByText("Dev Fullstack")).toBeInTheDocument()
        expect(screen.queryByText("Cursando")).not.toBeInTheDocument()
    })

    it("mostra o estado vazio sem destaques, mantendo o cabeçalho e as saídas", async () => {
        stubContentFetch(buildFiles({ "content/pt-BR/projects.json": { items: [] } }))

        renderHomePage()

        expect(await screen.findByText("Nenhum projeto em destaque no momento")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Projetos em destaque" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ler sobre mim" })).toBeInTheDocument()
    })

    it("mostra o alerta do status e refaz só aquela consulta, levando o foco ao heading", async () => {
        const files = buildFiles()
        stubContentFetch(without(files, "content/pt-BR/timeline.json"))
        renderHomePage()

        const alert = await screen.findByRole("alert")
        expect(alert).toHaveTextContent("Não consegui carregar o que faço agora")
        expect(alert).toHaveTextContent("Verifique sua conexão e tente de novo.")
        expect(screen.queryByRole("heading", { name: "Não consegui carregar" })).toBeNull()
        await screen.findByRole("link", { name: "Projeto Destaque" })

        stubContentFetch(files)
        await userEvent.click(within(alert).getByRole("button", { name: "Tentar novamente" }))

        expect(await screen.findByText("Dev Fullstack")).toBeInTheDocument()
        await waitFor(() =>
            expect(screen.getByRole("heading", { name: "O que faço agora" })).toHaveFocus()
        )
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("leva o foco ao alerta quando a nova tentativa falha de novo", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/projects.json"))
        renderHomePage()

        await screen.findByText("Não consegui carregar os projetos")
        const featuredAlert = screen
            .getAllByRole("alert")
            .find((element) => element.textContent?.includes("Não consegui carregar os projetos"))

        if (!featuredAlert) {
            throw new Error("Alerta de destaques não encontrado")
        }

        await userEvent.click(
            within(featuredAlert).getByRole("button", { name: "Tentar novamente" })
        )

        await waitFor(() =>
            expect(document.activeElement).toHaveTextContent("Não consegui carregar os projetos")
        )
        expect(screen.getByRole("heading", { name: "Projetos em destaque" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ler sobre mim" })).toBeInTheDocument()
    })

    it("esconde selo, parágrafo e faixa sem mensagem quando o perfil falha", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/profile.json"))

        renderHomePage()

        await screen.findByRole("link", { name: "Projeto Destaque" })
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Ver projetos/ })).toBeInTheDocument()
        expect(screen.queryByText("Disponível para projetos")).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Tecnologias que uso" })).toBeNull()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade com os dados carregados", async () => {
        const { container } = renderHomePage()
        await screen.findByRole("link", { name: "Projeto Destaque" })

        await expectNoAxeViolations(container)
    }, 15000)
})
