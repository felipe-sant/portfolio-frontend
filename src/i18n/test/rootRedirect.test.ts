import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import getPreferredLanguage from "@/i18n/getPreferredLanguage"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"

interface Scenario {
    saved?: string | null
    browserLanguages?: string[]
    pathname?: string
    search?: string
    hash?: string
    base?: string
    storageThrows?: boolean
}

let requestedKeys: string[] = []

const html = readFileSync("index.html", "utf-8")
const inlineScript = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? ""

function runScript({
    saved = null,
    browserLanguages = [],
    pathname = "/",
    search = "",
    hash = "",
    base = "/",
    storageThrows = false
}: Scenario = {}): string | undefined {
    const replace = vi.fn()
    requestedKeys = []
    const fakeLocation = { pathname, search, hash, replace }
    const fakeStorage = {
        getItem: (key: string) => {
            requestedKeys.push(key)
            if (storageThrows) {
                throw new Error("storage bloqueado")
            }
            return saved
        }
    }
    const fakeNavigator = { languages: browserLanguages, language: browserLanguages[0] }
    const run = new Function(
        "location",
        "localStorage",
        "navigator",
        inlineScript.replace("%BASE_URL%", base)
    )

    run(fakeLocation, fakeStorage, fakeNavigator)

    return replace.mock.calls[0]?.[0]
}

afterEach(() => {
    vi.restoreAllMocks()
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

describe("script de redirecionamento da raiz", () => {
    it("existe no index.html com o marcador de base", () => {
        expect(inlineScript).toContain("%BASE_URL%")
    })

    it("lê a mesma chave de LANGUAGE_STORAGE_KEY", () => {
        runScript()

        expect(requestedKeys).toEqual([LANGUAGE_STORAGE_KEY])
    })

    it.each([
        ["es", "/es"],
        ["pt-BR", "/pt-BR"],
        ["en", "/en"]
    ])("redireciona para o idioma salvo %s", (saved, expected) => {
        expect(runScript({ saved, browserLanguages: ["fr-FR"] })).toBe(expected)
    })

    it.each([
        ["pt-PT", "/pt-BR"],
        ["es-MX", "/es"],
        ["en-US", "/en"]
    ])("segue o navegador %s sem escolha salva", (browserLanguage, expected) => {
        expect(runScript({ browserLanguages: [browserLanguage] })).toBe(expected)
    })

    it("faz a escolha salva vencer o navegador", () => {
        expect(runScript({ saved: "es", browserLanguages: ["en-US"] })).toBe("/es")
    })

    it("cai em /en sem nenhum sinal", () => {
        expect(runScript()).toBe("/en")
    })

    it("cai em /en com o navegador em fr", () => {
        expect(runScript({ browserLanguages: ["fr-FR"] })).toBe("/en")
    })

    it.each([["xx"], ["constructor"], ["__proto__"]])(
        "ignora o valor salvo inválido %s",
        (saved) => {
            expect(runScript({ saved, browserLanguages: ["es"] })).toBe("/es")
        }
    )

    it("preserva query e hash", () => {
        expect(runScript({ browserLanguages: ["en"], search: "?utm=x", hash: "#contato" })).toBe(
            "/en?utm=x#contato"
        )
    })

    it("segue o navegador quando o localStorage lança", () => {
        expect(runScript({ storageThrows: true, browserLanguages: ["es"] })).toBe("/es")
    })

    it.each([["/en"], ["/projects"], ["/pt-BR"]])("não redireciona em %s", (pathname) => {
        expect(runScript({ pathname })).toBeUndefined()
    })

    it("respeita a base do GitHub Pages", () => {
        expect(
            runScript({
                base: "/ra2581392423047/",
                pathname: "/ra2581392423047/",
                browserLanguages: ["es"]
            })
        ).toBe("/ra2581392423047/es")
    })

    it("não redireciona dentro da base quando o caminho não é a raiz", () => {
        expect(
            runScript({ base: "/ra2581392423047/", pathname: "/ra2581392423047/en" })
        ).toBeUndefined()
    })

    it.each([
        [null, ["pt-PT"]],
        ["es", ["en-US"]],
        [null, ["fr-FR", "es-AR"]],
        [null, []],
        ["xx", ["pt"]],
        ["constructor", ["fr"]],
        ["pt-BR", ["es"]]
    ])(
        "chega ao mesmo destino que getPreferredLanguage com salvo %s e navegador %j",
        (saved, browserLanguages) => {
            vi.spyOn(navigator, "languages", "get").mockReturnValue(browserLanguages)
            vi.spyOn(navigator, "language", "get").mockReturnValue(browserLanguages[0] ?? "")
            if (saved) {
                localStorage.setItem(LANGUAGE_STORAGE_KEY, saved)
            }

            expect(runScript({ saved, browserLanguages })).toBe(`/${getPreferredLanguage()}`)
        }
    )
})
