import { afterEach, describe, expect, it, vi } from "vitest"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"

interface PageLoad {
    path?: string
    browserLanguages?: string[]
}

async function loadPage({ path = "/", browserLanguages = ["en-US"] }: PageLoad = {}) {
    window.history.pushState({}, "", path)
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
    it.each([
        ["/en/projects", "en"],
        ["/es", "es"],
        ["/pt-BR", "pt-BR"]
    ])("abre em %s no idioma %s", async (path, expected) => {
        const i18n = await loadPage({ path })

        expect(i18n.resolvedLanguage).toBe(expected)
    })

    it("abre no idioma do caminho mesmo com navegador em en e escolha salva es", async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, "es")

        const i18n = await loadPage({ path: "/pt-BR", browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("pt-BR")
    })

    it.each([["/"], ["/fr"], ["/projects"], ["/pt/projects"]])(
        "abre no fallback en em %s mesmo com navegador em es",
        async (path) => {
            const i18n = await loadPage({ path, browserLanguages: ["es"] })

            expect(i18n.resolvedLanguage).toBe("en")
        }
    )

    it("ignora o ?lng= sem gravar nada", async () => {
        const i18n = await loadPage({ path: "/pt-BR?lng=es" })

        expect(i18n.resolvedLanguage).toBe("pt-BR")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("ignora o ?lng= na raiz sem gravar nada", async () => {
        const i18n = await loadPage({ path: "/?lng=es" })

        expect(i18n.resolvedLanguage).toBe("en")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("não grava a escolha ao abrir um prefixo", async () => {
        await loadPage({ path: "/es" })

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("mantém o lang do html igual ao idioma ativo", async () => {
        const i18n = await loadPage({ path: "/es" })
        expect(document.documentElement.lang).toBe("es")

        await i18n.changeLanguage("pt-BR")

        expect(document.documentElement.lang).toBe("pt-BR")
    })

    it("mostra o valor de en quando a chave falta em es", async () => {
        const i18n = await loadPage({ path: "/es" })
        i18n.removeResourceBundle("es", "common")
        i18n.addResourceBundle("es", "common", { loading: "Cargando..." })

        expect(i18n.t("loading")).toBe("Cargando...")
        expect(i18n.t("backHome")).toBe("Back to home")
    })

    it.each([
        ["pt-BR", "9 de 10 projetos", "1 de 1 projeto", "0 projetos", "Em destaque"],
        ["en", "9 of 10 projects", "1 of 1 project", "0 projects", "Featured"],
        ["es", "9 de 10 proyectos", "1 de 1 proyecto", "0 proyectos", "Destacado"]
    ])(
        "resolve as chaves de contagem e de destaque em %s",
        async (language, plural, singular, none, featured) => {
            const i18n = await loadPage({ path: `/${language}` })

            expect(i18n.t("projects:results.count", { count: 10, shown: 9 })).toBe(plural)
            expect(i18n.t("projects:results.count", { count: 1, shown: 1 })).toBe(singular)
            expect(i18n.t("projects:results.countNone")).toBe(none)
            expect(i18n.t("common:projectCard.featured")).toBe(featured)
        }
    )

    it.each([
        ["pt-BR", "(nenhum projeto)"],
        ["en", "(no projects)"],
        ["es", "(ningún proyecto)"]
    ])("resolve o texto da opção sem projeto em %s", async (language, text) => {
        const i18n = await loadPage({ path: `/${language}` })

        expect(i18n.t("projects:filters.modal.noProjects")).toBe(text)
    })

    it.each([
        [
            "pt-BR",
            "Maps · Luiz Felipe dos Santos",
            "Projeto · Luiz Felipe dos Santos",
            "Voltar para Projetos",
            "Situação",
            "Ver código no GitHub: Maps (abre em nova aba)",
            "Ver todos os projetos",
            "Não consegui carregar este projeto"
        ],
        [
            "en",
            "Maps · Luiz Felipe dos Santos",
            "Project · Luiz Felipe dos Santos",
            "Back to Projects",
            "Status",
            "View code on GitHub: Maps (opens in a new tab)",
            "View all projects",
            "I couldn't load this project"
        ],
        [
            "es",
            "Maps · Luiz Felipe dos Santos",
            "Proyecto · Luiz Felipe dos Santos",
            "Volver a Proyectos",
            "Estado",
            "Ver código en GitHub: Maps (se abre en una pestaña nueva)",
            "Ver todos los proyectos",
            "No pude cargar este proyecto"
        ]
    ])(
        "resolve os textos do namespace project do Marco 1 em %s",
        async (
            language,
            title,
            fallbackTitle,
            back,
            status,
            codeName,
            viewAllName,
            errorHeading
        ) => {
            const i18n = await loadPage({ path: `/${language}` })

            expect(i18n.t("project:meta.title", { project: "Maps" })).toBe(title)
            expect(i18n.t("project:meta.fallbackTitle")).toBe(fallbackTitle)
            expect(i18n.t("project:backToProjects")).toBe(back)
            expect(i18n.t("project:facts.status")).toBe(status)
            expect(i18n.t("project:links.codeName", { project: "Maps" })).toBe(codeName)
            expect(i18n.t("project:related.viewAllName")).toBe(viewAllName)
            expect(i18n.t("project:loadError.heading")).toBe(errorHeading)
        }
    )

    it.each([
        [
            "pt-BR",
            "Em desenvolvimento",
            "Concluído",
            "Descontinuado",
            "Frontend",
            "Infra e ferramentas"
        ],
        ["en", "In development", "Completed", "Discontinued", "Frontend", "Infra and tooling"],
        ["es", "En desarrollo", "Concluido", "Descontinuado", "Frontend", "Infra y herramientas"]
    ])(
        "resolve projectStatus e stackCategory de common em %s",
        async (language, inDevelopment, completed, discontinued, frontend, tooling) => {
            const i18n = await loadPage({ path: `/${language}` })

            expect(i18n.t("common:projectStatus.inDevelopment")).toBe(inDevelopment)
            expect(i18n.t("common:projectStatus.completed")).toBe(completed)
            expect(i18n.t("common:projectStatus.discontinued")).toBe(discontinued)
            expect(i18n.t("common:stackCategory.frontend")).toBe(frontend)
            expect(i18n.t("common:stackCategory.backend")).toBe("Backend")
            expect(i18n.t("common:stackCategory.tooling")).toBe(tooling)
        }
    )

    it.each([
        [
            "pt-BR",
            ["Galeria", "Ampliar imagem", "2 de 5", "Miniaturas", "Imagem 2 de 5"],
            ["Imagem ampliada", "Fechar", "Imagem anterior", "Próxima imagem"]
        ],
        [
            "en",
            ["Gallery", "Enlarge image", "2 of 5", "Thumbnails", "Image 2 of 5"],
            ["Enlarged image", "Close", "Previous image", "Next image"]
        ],
        [
            "es",
            ["Galería", "Ampliar imagen", "2 de 5", "Miniaturas", "Imagen 2 de 5"],
            ["Imagen ampliada", "Cerrar", "Imagen anterior", "Imagen siguiente"]
        ]
    ])("resolve os textos de galeria e lightbox em %s", async (language, gallery, lightbox) => {
        const i18n = await loadPage({ path: `/${language}` })
        const values = { current: 2, total: 5 }

        expect([
            i18n.t("project:gallery.label"),
            i18n.t("project:gallery.enlarge"),
            i18n.t("project:gallery.counter", values),
            i18n.t("project:gallery.thumbnails"),
            i18n.t("project:gallery.thumbnail", values)
        ]).toEqual(gallery)
        expect([
            i18n.t("project:lightbox.label"),
            i18n.t("project:lightbox.close"),
            i18n.t("project:lightbox.previous"),
            i18n.t("project:lightbox.next")
        ]).toEqual(lightbox)
    })

    it.each([
        [
            "pt-BR",
            "SETUP.md · Maps · Luiz Felipe dos Santos",
            ["Documentação do projeto", "SETUP.md: Maps"],
            [
                "Não consegui carregar este documento",
                "O restante da página continua aqui. Tente de novo em alguns segundos."
            ],
            ["(abre em nova aba)", "Tabela 2", "Feito", "A fazer", "Código"]
        ],
        [
            "en",
            "SETUP.md · Maps · Luiz Felipe dos Santos",
            ["Project documentation", "SETUP.md: Maps"],
            [
                "I couldn't load this document",
                "The rest of the page is still here. Try again in a few seconds."
            ],
            ["(opens in a new tab)", "Table 2", "Done", "To do", "Code"]
        ],
        [
            "es",
            "SETUP.md · Maps · Luiz Felipe dos Santos",
            ["Documentación del proyecto", "SETUP.md: Maps"],
            [
                "No pude cargar este documento",
                "El resto de la página sigue aquí. Inténtalo de nuevo en unos segundos."
            ],
            ["(se abre en una pestaña nueva)", "Tabla 2", "Hecho", "Pendiente", "Código"]
        ]
    ])(
        "resolve os textos de documentação em %s",
        async (language, documentTitle, documents, loadError, markdown) => {
            const i18n = await loadPage({ path: `/${language}` })

            expect(
                i18n.t("project:meta.documentTitle", { document: "SETUP.md", project: "Maps" })
            ).toBe(documentTitle)
            expect([
                i18n.t("project:documents.label"),
                i18n.t("project:documents.linkName", { document: "SETUP.md", project: "Maps" })
            ]).toEqual(documents)
            expect([
                i18n.t("project:documents.loadError.heading"),
                i18n.t("project:documents.loadError.description")
            ]).toEqual(loadError)
            expect([
                i18n.t("project:markdown.newTab"),
                i18n.t("project:markdown.table", { index: 2 }),
                i18n.t("project:markdown.taskDone"),
                i18n.t("project:markdown.taskTodo"),
                i18n.t("project:codeBlock.label")
            ]).toEqual(markdown)
        }
    )

    it.each(["pt-BR", "en", "es"])(
        "mantém o nome oficial de cada linguagem de código em %s",
        async (language) => {
            const i18n = await loadPage({ path: `/${language}` })

            expect([
                i18n.t("project:codeBlock.language.typescript"),
                i18n.t("project:codeBlock.language.javascript"),
                i18n.t("project:codeBlock.language.tsx"),
                i18n.t("project:codeBlock.language.java"),
                i18n.t("project:codeBlock.language.python"),
                i18n.t("project:codeBlock.language.json"),
                i18n.t("project:codeBlock.language.bash"),
                i18n.t("project:codeBlock.language.env")
            ]).toEqual([
                "TypeScript",
                "JavaScript",
                "TSX",
                "Java",
                "Python",
                "JSON",
                "Bash",
                ".env"
            ])
        }
    )
})
