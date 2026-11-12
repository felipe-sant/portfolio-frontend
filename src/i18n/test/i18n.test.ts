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
    const { default: addStaticResources } = await import("@/i18n/addStaticResources")
    addStaticResources()
    await i18n.changeLanguage(i18n.language)

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
        ["pt-BR", "9 de 10 projetos", "1 de 1 projeto"],
        ["en", "9 of 10 projects", "1 of 1 project"],
        ["es", "9 de 10 proyectos", "1 de 1 proyecto"]
    ])("aplica a regra de plural da contagem em %s", async (language, plural, singular) => {
        const i18n = await loadPage({ path: `/${language}` })

        expect(i18n.t("projects:results.count", { count: 10, shown: 9 })).toBe(plural)
        expect(i18n.t("projects:results.count", { count: 1, shown: 1 })).toBe(singular)
    })

    it("registra o namespace contact", async () => {
        const i18n = await loadPage({ path: "/pt-BR" })

        expect(i18n.options.ns).toContain("contact")
    })

    it("tipa as chaves pelos textos de pt-BR e recusa chave inexistente", async () => {
        const i18n = await loadPage({ path: "/pt-BR" })

        // @ts-expect-error
        expect(i18n.t("common:missingKey")).toBe("missingKey")
        expect(i18n.t("common:loading")).toBe("Carregando...")
    })
})
