import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router-dom"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MainLayout from "@/layouts/Main.layout"
import setLanguage from "@/i18n/setLanguage"
import AboutPage from "@/pages/About.page"
import ProjectPage from "@/pages/Project.page"
import createLanguageLoader from "@/routers/createLanguageLoader"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import holdFetchAfter from "@/testUtils/holdFetchAfter"
import relaxTimeoutsForLoad from "@/testUtils/relaxTimeoutsForLoad"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"

relaxTimeoutsForLoad()

const SITE_URL = "http://localhost:5173"
const PROJECT_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const JOB_ID = "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1"
const DEGREE_ID = "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2"
const COURSE_ID = "0192f1b2-3a4c-7d5e-8f60-718293a4b5c3"
const LANGUAGES = ["pt-BR", "en", "es"] as const

function buildFiles(profileOverrides = {}) {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/profile.json`] = buildProfile({
            summary: "Sou desenvolvedor full stack em TypeScript.",
            aboutParagraphs: ["Primeiro parágrafo sobre mim.", "Segundo parágrafo sobre mim."],
            workPrinciples: ["Escrevo o teste junto com o código", "Reviso o que entrego"],
            availability: { isAvailable: true, label: "Procurando novos projetos" },
            photo: {
                large: { src: "images/profile/photo-large.webp", width: 362, height: 362 },
                small: { src: "images/profile/photo-small.webp", width: 320, height: 320 }
            },
            stack: [
                { category: "tooling", items: [{ name: "Docker" }] },
                { category: "frontend", items: [{ name: "React" }, { name: "TypeScript" }] },
                { category: "backend", items: [{ name: "Node.js" }] }
            ],
            ...profileOverrides
        })
        files[`content/${language}/projects.json`] = {
            items: [
                buildProjectRecord({
                    id: PROJECT_ID,
                    title: "Maps",
                    documents: [
                        {
                            id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b6",
                            name: "README.md",
                            format: "markdown",
                            translated: true
                        }
                    ]
                })
            ]
        }
        files[`content/${language}/projects/${PROJECT_ID}/docs/README.md`] = "## Sobre\n\nTexto"
        files[`content/${language}/timeline.json`] = {
            items: [
                buildTimelineItemRecord({
                    id: JOB_ID,
                    kind: "experience",
                    title: "Desenvolvedor frontend",
                    organization: "Empresa Exemplo",
                    details: ["CLT"],
                    start: "2024-06",
                    summary: "Resumo da experiência atual.",
                    responsibilities: ["Mantenho a interface"],
                    technologies: ["React"],
                    projectIds: [PROJECT_ID]
                }),
                buildTimelineItemRecord({
                    id: DEGREE_ID,
                    kind: "education",
                    title: "Análise de Sistemas",
                    organization: "Fatec",
                    stage: "6º semestre",
                    start: "2023-02",
                    end: "2026-12",
                    summary: "Resumo da formação.",
                    disciplines: ["Banco de dados"]
                }),
                buildTimelineItemRecord({
                    id: COURSE_ID,
                    kind: "course",
                    title: "AWS Cloud",
                    organization: "AWS",
                    start: "2025-01",
                    end: "2025-03",
                    summary: "Resumo do curso.",
                    certificates: [
                        {
                            id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d1",
                            name: "Cloud Practitioner",
                            issuer: "AWS"
                        }
                    ]
                })
            ]
        }
    }

    return files
}

function without(files: Record<string, unknown>, ...paths: string[]) {
    const rest = { ...files }

    for (const path of paths) {
        delete rest[path]
    }

    return rest
}

function renderAbout() {
    return renderWithStore(
        <MemoryRouter initialEntries={["/pt-BR/about"]}>
            <AboutPage />
        </MemoryRouter>
    )
}

function renderAboutWithLayout() {
    const router = createMemoryRouter(
        [
            {
                path: "/pt-BR",
                element: <MainLayout />,
                loader: createLanguageLoader("pt-BR"),
                children: [
                    { path: "about", element: <AboutPage /> },
                    {
                        path: "projects/:id",
                        element: <ProjectPage />,
                        children: [{ index: true, element: null }]
                    }
                ]
            }
        ],
        { initialEntries: ["/pt-BR/about"] }
    )

    return { router, ...renderWithStore(<RouterProvider router={router} />) }
}

function readJsonLd() {
    const script = document.querySelector('script[type="application/ld+json"]')

    return JSON.parse(script?.textContent ?? "null")
}

async function loaded() {
    await screen.findByText("Sou desenvolvedor full stack em TypeScript.")
    await screen.findByRole("button", { name: /Desenvolvedor frontend/ })
}

beforeEach(() => {
    stubContentFetch(buildFiles())
})

afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.removeAttribute("data-motion")
})

describe("AboutPage, estrutura", () => {
    it("mostra as seções na ordem, cada uma com aria-labelledby, e os headings de RF-ABOUT-01", async () => {
        const { container } = renderAbout()
        await loaded()
        const regions = within(container).getAllByRole("region")

        expect(regions.map((region) => region.getAttribute("aria-labelledby") !== null)).toEqual([
            true,
            true,
            true,
            true,
            true
        ])
        expect(regions.map((region) => region.querySelector("h1, h2")?.textContent)).toEqual([
            "Luiz Felipe dos Santos",
            "Sobre mim",
            "Stack",
            "Certificados",
            "Trajetória"
        ])
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)
        ).toEqual(["Sobre mim", "Stack", "Certificados", "Como eu trabalho", "Trajetória"])
        expect(screen.queryByText(/depoimento/i)).not.toBeInTheDocument()
    })

    it("mostra os grupos de stack e de trajetória com h3", async () => {
        renderAbout()
        await loaded()

        expect(
            screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)
        ).toEqual([
            "Agora",
            "Frontend",
            "Backend",
            "Infra e ferramentas",
            "Experiências profissionais",
            "Formações",
            "Cursos"
        ])
        expect(screen.getByText("Selecione um item para ver o detalhe.")).toBeInTheDocument()
    })
})

describe("AboutPage, cartão Agora", () => {
    it("mostra o cargo e os links de redes do perfil ao lado de Sobre mim", async () => {
        renderAbout()
        await loaded()

        const card = screen.getByRole("group", { name: "Agora" })

        expect(card).toHaveTextContent("Cargo")
        expect(card).toHaveTextContent("Desenvolvedor full stack")
        expect(within(card).getAllByRole("link")).toHaveLength(1)
    })
})

describe("AboutPage, apresentação", () => {
    it("mostra o rótulo, o h1 com o nome, o parágrafo, a localização e o selo", async () => {
        renderAbout()
        await loaded()

        expect(screen.getByText("Informações")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { level: 1, name: "Luiz Felipe dos Santos" })
        ).toBeInTheDocument()
        expect(screen.getByText("Sou desenvolvedor full stack em TypeScript.")).toBeInTheDocument()
        expect(screen.getByText("São José dos Campos · SP")).toBeInTheDocument()
        expect(screen.getByText("Procurando novos projetos")).toBeInTheDocument()
        expect(
            screen.getByRole("img", { name: "Foto de Luiz Felipe dos Santos" })
        ).toBeInTheDocument()
    })

    it("sem disponibilidade não mostra o selo e mantém a localização", async () => {
        stubContentFetch(
            buildFiles({ availability: { isAvailable: false, label: "Procurando novos projetos" } })
        )
        renderAbout()
        await loaded()

        expect(screen.queryByText("Procurando novos projetos")).not.toBeInTheDocument()
        expect(screen.getByText("São José dos Campos · SP")).toBeInTheDocument()
    })

    it("sem foto mostra o placeholder decorativo e nenhuma imagem", async () => {
        stubContentFetch(buildFiles({ photo: undefined }))
        const { container } = renderAbout()
        await loaded()

        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(container.querySelector("img")).toBeNull()
    })

    it.each([
        ["pt-BR", "Baixar CV", "Baixar CV (PDF), abre a pré-visualização", "Entrar em contato"],
        ["en", "Download CV", "Download CV (PDF), opens the preview", "Get in touch"],
        ["es", "Descargar CV", "Descargar CV (PDF), abre la vista previa", "Ponerse en contacto"]
    ] as const)(
        "mostra Baixar CV como link do PDF e Entrar em contato em %s",
        async (language, visible, name, contact) => {
            await act(() => setLanguage(language))
            renderAbout()
            const link = screen.getByRole("link", { name })

            expect(link).toHaveTextContent(visible)
            expect(link).toHaveAttribute("href", `/cv/cv-${language}.pdf`)
            expect(link).not.toHaveAttribute("download")
            expect(link).not.toHaveAttribute("target")
            expect(screen.getByRole("link", { name: contact })).toHaveAttribute(
                "href",
                `/${language}/contact`
            )
        }
    )

    it("clicar em Baixar CV abre o modal e fechar devolve o foco ao link", async () => {
        renderAbout()
        const link = screen.getByRole("link", { name: /Baixar CV/ })

        await userEvent.click(link)

        const dialog = screen.getByRole("dialog", { name: "Currículo" })
        expect(within(dialog).getByTitle("Currículo em PDF")).toHaveAttribute(
            "src",
            "/cv/cv-pt-BR.pdf"
        )

        await userEvent.keyboard("{Escape}")

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(link).toHaveFocus()
    })

    it("mostra h1, botões e títulos das seções já no carregamento", () => {
        holdFetchAfter(stubContentFetch(buildFiles()), 0)
        renderAbout()

        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Baixar CV/ })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Entrar em contato" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: "Sobre mim" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: "Trajetória" })).toBeInTheDocument()
    })
})

describe("AboutPage, conteúdo", () => {
    it("mostra um parágrafo por item de Sobre mim, as frases de Como eu trabalho e os certificados", async () => {
        renderAbout()
        await loaded()
        const aboutMe = screen.getByRole("region", { name: "Sobre mim" })

        expect(within(aboutMe).getAllByText(/parágrafo sobre mim/)).toHaveLength(2)
        const workStyle = screen.getByRole("heading", { name: "Como eu trabalho" })
        const list = workStyle.parentElement?.querySelector("ul") as HTMLElement

        expect(
            within(list)
                .getAllByRole("listitem")
                .map((item) => item.textContent)
        ).toEqual(["Escrevo o teste junto com o código", "Reviso o que entrego"])
        expect(screen.getAllByText(/Cloud Practitioner/)[0].closest("li")).toHaveTextContent(
            "Cloud Practitioner · AWS"
        )
    })
})

describe("AboutPage, carregando", () => {
    it("mostra skeletons aria-hidden e um único status Carregando", () => {
        holdFetchAfter(stubContentFetch(buildFiles()), 0)
        const { container } = renderAbout()

        expect(screen.getAllByRole("status")).toHaveLength(1)
        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThan(4)
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade carregando", async () => {
        holdFetchAfter(stubContentFetch(buildFiles()), 0)
        const { container } = renderAbout()

        await expectNoAxeViolations(container)
    })
})

describe("AboutPage, erro por fonte", () => {
    it("com o perfil falhando mostra um alerta nas partes do perfil e mantém a trajetória", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/profile.json"))
        renderAbout()

        await screen.findByRole("alert")
        await screen.findByRole("button", { name: /Desenvolvedor frontend/ })

        expect(screen.getAllByRole("alert")).toHaveLength(1)
        expect(screen.getAllByRole("button", { name: "Tentar novamente" })).toHaveLength(5)
        expect(screen.getAllByText("Não foi possível carregar esta parte da página.")).toHaveLength(
            5
        )
        expect(screen.getAllByText(/Cloud Practitioner/).length).toBeGreaterThan(0)
        expect(screen.queryByText(/erro|500|404|Error/i)).not.toBeInTheDocument()
    })

    it("com a trajetória falhando mostra o alerta em Certificados e em Trajetória e mantém o perfil", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/timeline.json"))
        renderAbout()

        await screen.findByRole("alert")

        expect(screen.getAllByRole("alert")).toHaveLength(1)
        expect(screen.getAllByRole("button", { name: "Tentar novamente" })).toHaveLength(2)
        expect(screen.getByText("Sou desenvolvedor full stack em TypeScript.")).toBeInTheDocument()
        expect(screen.getByText("Reviso o que entrego")).toBeInTheDocument()
    })

    it("Tentar novamente do perfil refaz só o perfil", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/profile.json"))
        renderAbout()
        const [retry] = await screen.findAllByRole("button", { name: "Tentar novamente" })
        const recovered = stubContentFetch(buildFiles())

        await userEvent.click(retry)

        await screen.findByText("Sou desenvolvedor full stack em TypeScript.")
        const requested = recovered.mock.calls.map(([input]) => String(input))

        expect(requested.some((url) => url.endsWith("profile.json"))).toBe(true)
        expect(requested.some((url) => url.endsWith("timeline.json"))).toBe(false)
    })

    it("não tem violações de acessibilidade com erro", async () => {
        stubContentFetch(without(buildFiles(), "content/pt-BR/profile.json"))
        const { container } = renderAbout()
        await screen.findByRole("alert")

        await expectNoAxeViolations(container)
    })
})

describe("AboutPage, vazio", () => {
    it("esconde as partes sem dado com o título e a faixa inteira", async () => {
        stubContentFetch({
            ...buildFiles({ stack: [], workPrinciples: [] }),
            "content/pt-BR/timeline.json": { items: [] }
        })
        const { container } = renderAbout()
        await screen.findByText("Sou desenvolvedor full stack em TypeScript.")
        await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())

        expect(screen.queryByRole("heading", { name: "Stack" })).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Trajetória" })).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Certificados" })).not.toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "Como eu trabalho" })).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it("esconde só a coluna sem dado dentro da faixa", async () => {
        stubContentFetch(buildFiles({ workPrinciples: [] }))
        renderAbout()
        await loaded()

        expect(screen.queryByRole("heading", { name: "Como eu trabalho" })).not.toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Certificados" })).toBeInTheDocument()
        const labelledBy = screen
            .getByRole("region", { name: "Certificados" })
            .getAttribute("aria-labelledby")

        expect(labelledBy).toBe("about-certificates-heading")
        expect(document.getElementById(labelledBy ?? "")).not.toBeNull()
    })
})

describe("AboutPage, modal de trajetória", () => {
    it("abre o detalhe no clique, fecha por Esc devolvendo o foco e não muda a URL", async () => {
        const { container } = renderAbout()
        await loaded()
        const opener = screen.getByRole("button", { name: /Desenvolvedor frontend/ })

        await userEvent.click(opener)
        const dialog = screen.getByRole("dialog", { name: "Desenvolvedor frontend" })

        expect(within(dialog).getByText("Resumo da experiência atual.")).toBeInTheDocument()
        await expectNoAxeViolations(document.body)

        await userEvent.keyboard("{Escape}")

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(opener).toHaveFocus()
        expect(container).not.toHaveAttribute("inert")
    })

    it("devolve o foco ao item mesmo quando o foco estava no body na abertura", async () => {
        renderAbout()
        await loaded()
        const opener = screen.getByRole("button", { name: /Análise de Sistemas|Fatec/ })

        act(() => {
            opener.click()
        })
        const dialog = await screen.findByRole("dialog")
        await userEvent.click(within(dialog).getByRole("button", { name: "Fechar" }))

        await waitFor(() => expect(opener).toHaveFocus())
    })

    it("navega para o projeto relacionado, fecha o modal e foca o h1 do projeto", async () => {
        const { router } = renderAboutWithLayout()
        await screen.findByRole("button", { name: /Desenvolvedor frontend/ })
        const opener = screen.getByRole("button", { name: /Desenvolvedor frontend/ })

        await userEvent.click(opener)
        const dialog = screen.getByRole("dialog")
        await userEvent.click(within(dialog).getByRole("link", { name: "Maps" }))

        const heading = await screen.findByRole("heading", { level: 1, name: "Maps" })

        expect(router.state.location.pathname).toBe(`/pt-BR/projects/${PROJECT_ID}`)
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        await waitFor(() => expect(heading).toHaveFocus())
        expect(opener).not.toHaveFocus()
    })
})

describe("AboutPage, metadados", () => {
    it.each([
        ["pt-BR", "Informações · Luiz Felipe dos Santos"],
        ["en", "About · Luiz Felipe dos Santos"],
        ["es", "Información · Luiz Felipe dos Santos"]
    ] as const)("define título, descrição e html lang em %s", async (language, title) => {
        await act(() => setLanguage(language))
        renderAbout()

        expect(document.title).toBe(title)
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toMatch(
            /Luiz Felipe dos Santos/
        )
        expect(document.documentElement.lang).toBe(language)
    })

    it("declara a canônica, hreflang com x-default, og:type profile e twitter:card", () => {
        renderAbout()

        expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
            "href",
            `${SITE_URL}/pt-BR/about`
        )
        expect(document.head.querySelector('link[hreflang="x-default"]')).toHaveAttribute(
            "href",
            `${SITE_URL}/en/about`
        )
        expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute(
            "content",
            "profile"
        )
        expect(document.head.querySelector('meta[name="twitter:card"]')).toBeInTheDocument()
    })

    it("monta o JSON-LD ProfilePage com Person e escapa o <", async () => {
        stubContentFetch(buildFiles({ summary: "Texto </script> perigoso" }))
        renderAbout()
        await screen.findByText(/Texto/)
        const script = document.querySelector('script[type="application/ld+json"]')

        await waitFor(() => expect(readJsonLd()["@type"]).toBe("ProfilePage"))
        expect(readJsonLd().mainEntity["@type"]).toBe("Person")
        expect(readJsonLd().mainEntity.description).toBe("Texto </script> perigoso")
        expect(script?.innerHTML).not.toContain("</script>")
    })
})

describe("AboutPage, Reveal", () => {
    it("envolve as quatro seções abaixo da primeira tela e não a apresentação", async () => {
        const { container } = renderAbout()
        await loaded()
        const wrappers = Array.from(container.querySelectorAll("[data-reveal]"))
        const hero = screen.getByRole("region", { name: "Luiz Felipe dos Santos" })

        expect(wrappers).toHaveLength(4)
        expect(wrappers.every((wrapper) => wrapper.querySelector("section") !== null)).toBe(true)
        expect(hero.closest("[data-reveal]")).toBeNull()
    })

    it("não esconde nenhuma seção com movimento reduzido nem antes da hidratação", async () => {
        document.documentElement.setAttribute("data-motion", "reduced")
        const { container } = renderAbout()
        await loaded()

        expect(container.querySelectorAll('[data-reveal="hidden"]')).toHaveLength(0)
        expect(screen.getByRole("heading", { name: "Trajetória" })).toBeVisible()
    })
})

describe("AboutPage, acessibilidade", () => {
    it("não tem violações de acessibilidade na tela normal", async () => {
        const { container } = renderAbout()
        await loaded()

        await expectNoAxeViolations(container)
    })
})
