import { afterEach, describe, expect, it, vi } from "vitest"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import saveLanguage from "@/i18n/saveLanguage"

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
    it("abre no idioma do navegador na primeira visita sem gravar nada", async () => {
        const i18n = await loadPage({ browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("en")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("acompanha a troca de idioma do navegador entre cargas quando não há escolha salva", async () => {
        const firstLoad = await loadPage({ browserLanguages: ["en"] })
        expect(firstLoad.resolvedLanguage).toBe("en")

        const secondLoad = await loadPage({ browserLanguages: ["es"] })

        expect(secondLoad.resolvedLanguage).toBe("es")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("mantém a escolha feita por setLanguage acima do idioma do navegador", async () => {
        await loadPage({ browserLanguages: ["en"] })
        const { default: setLanguage } = await import("@/i18n/setLanguage")
        await setLanguage("en")

        const i18n = await loadPage({ browserLanguages: ["es"] })

        expect(i18n.resolvedLanguage).toBe("en")
    })

    it("ativa e grava o idioma de um ?lng= válido", async () => {
        const i18n = await loadPage({ search: "?lng=es", browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("es")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es")
    })

    it("ignora um ?lng= inválido sem gravar nada e segue o navegador", async () => {
        const i18n = await loadPage({ search: "?lng=xx", browserLanguages: ["es-MX"] })

        expect(i18n.resolvedLanguage).toBe("es")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("faz o ?lng= vencer e substituir a escolha salva", async () => {
        saveLanguage("en")

        const i18n = await loadPage({ search: "?lng=es", browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("es")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es")
    })

    it("ativa e grava pt-BR para ?lng=pt-PT", async () => {
        const i18n = await loadPage({ search: "?lng=pt-PT", browserLanguages: ["en"] })

        expect(i18n.resolvedLanguage).toBe("pt-BR")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pt-BR")
    })

    it.each([["fr-FR"], ["de-DE"]])(
        "abre no fallback en com o navegador em %s e nada salvo",
        async (browserLanguage) => {
            const i18n = await loadPage({ browserLanguages: [browserLanguage] })

            expect(i18n.resolvedLanguage).toBe("en")
            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
        }
    )

    it("abre no fallback en quando o navegador não informa idioma", async () => {
        const i18n = await loadPage({ browserLanguages: [] })

        expect(i18n.resolvedLanguage).toBe("en")
    })

    it("ignora um valor salvo que não é idioma suportado", async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, "xx")

        const i18n = await loadPage({ browserLanguages: ["es"] })

        expect(i18n.resolvedLanguage).toBe("es")
    })

    it("mantém o lang do html igual ao idioma ativo", async () => {
        const i18n = await loadPage({ browserLanguages: ["es"] })
        expect(document.documentElement.lang).toBe("es")

        await i18n.changeLanguage("pt-BR")

        expect(document.documentElement.lang).toBe("pt-BR")
    })

    it("mostra o valor de en quando a chave falta em es", async () => {
        const i18n = await loadPage({ browserLanguages: ["es"] })
        i18n.removeResourceBundle("es", "common")
        i18n.addResourceBundle("es", "common", { loading: "Cargando..." })

        expect(i18n.t("loading")).toBe("Cargando...")
        expect(i18n.t("backHome")).toBe("Back to home")
    })
})
