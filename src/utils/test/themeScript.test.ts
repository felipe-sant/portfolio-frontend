import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import applyTheme from "@/utils/applyTheme"
import getSystemTheme from "@/utils/getSystemTheme"
import readStoredTheme from "@/utils/readStoredTheme"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

interface Scenario {
    saved?: string | null
    systemDark?: boolean
    hasMatchMedia?: boolean
    storageThrows?: boolean
}

const html = readFileSync("index.html", "utf-8")
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
const themeScript = inlineScripts[1] ?? ""

let requestedKeys: string[] = []

function runScript({
    saved = null,
    systemDark = false,
    hasMatchMedia = true,
    storageThrows = false
}: Scenario = {}) {
    requestedKeys = []
    const fakeStorage = {
        getItem: (key: string) => {
            requestedKeys.push(key)
            if (storageThrows) {
                throw new Error("storage bloqueado")
            }
            return saved
        }
    }
    const fakeMatchMedia = hasMatchMedia
        ? (query: string) => ({ matches: systemDark && query === "(prefers-color-scheme: dark)" })
        : undefined
    const run = new Function("localStorage", "matchMedia", themeScript)

    run(fakeStorage, fakeMatchMedia)
}

function readAppliedState() {
    return {
        dataTheme: document.documentElement.getAttribute("data-theme"),
        metas: [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) => ({
            content: meta.getAttribute("content"),
            media: meta.getAttribute("media")
        }))
    }
}

beforeEach(() => {
    document.head.innerHTML = `
        <meta name="theme-color" content="#fbf9f5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#141210" media="(prefers-color-scheme: dark)" />
    `
})

afterEach(() => {
    vi.unstubAllGlobals()
    document.head.innerHTML = ""
    document.documentElement.removeAttribute("data-theme")
    localStorage.removeItem(THEME_STORAGE_KEY)
})

describe("script de tema", () => {
    it("existe no index.html depois do script de redirecionamento", () => {
        expect(inlineScripts).toHaveLength(2)
        expect(inlineScripts[0]).toContain("%BASE_URL%")
        expect(themeScript).not.toContain("%BASE_URL%")
    })

    it("lê a mesma chave de THEME_STORAGE_KEY", () => {
        runScript()

        expect(requestedKeys).toEqual([THEME_STORAGE_KEY])
    })

    it("aplica a escolha salva escura com o sistema em claro", () => {
        runScript({ saved: "dark", systemDark: false })

        expect(readAppliedState()).toEqual({
            dataTheme: "dark",
            metas: [
                { content: "#141210", media: null },
                { content: "#141210", media: null }
            ]
        })
    })

    it("aplica a escolha salva clara com o sistema em escuro", () => {
        runScript({ saved: "light", systemDark: true })

        expect(readAppliedState()).toEqual({
            dataTheme: "light",
            metas: [
                { content: "#fbf9f5", media: null },
                { content: "#fbf9f5", media: null }
            ]
        })
    })

    it("segue o sistema em escuro sem escolha salva", () => {
        runScript({ systemDark: true })

        expect(readAppliedState().dataTheme).toBe("dark")
    })

    it("ignora o valor salvo inválido", () => {
        runScript({ saved: "blue", systemDark: true })

        expect(readAppliedState().dataTheme).toBe("dark")
    })

    it("segue o sistema quando o localStorage lança", () => {
        expect(() => runScript({ storageThrows: true, systemDark: true })).not.toThrow()

        expect(readAppliedState().dataTheme).toBe("dark")
    })

    it("cai em light sem matchMedia", () => {
        expect(() => runScript({ hasMatchMedia: false })).not.toThrow()

        expect(readAppliedState().dataTheme).toBe("light")
    })

    it.each([
        [null, true, true],
        [null, false, true],
        ["dark", false, true],
        ["light", true, true],
        ["blue", true, true],
        [null, true, false],
        [null, false, false]
    ])(
        "chega ao mesmo resultado que o hook com salvo %s, sistema escuro %s e matchMedia %s",
        (saved, systemDark, hasMatchMedia) => {
            if (saved) {
                localStorage.setItem(THEME_STORAGE_KEY, saved)
            }
            vi.stubGlobal(
                "matchMedia",
                hasMatchMedia ? () => ({ matches: systemDark }) : undefined
            )
            applyTheme(readStoredTheme() ?? getSystemTheme())
            const expected = readAppliedState()
            document.documentElement.removeAttribute("data-theme")
            document.head.innerHTML = `
                <meta name="theme-color" content="#fbf9f5" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#141210" media="(prefers-color-scheme: dark)" />
            `

            runScript({ saved, systemDark, hasMatchMedia })

            expect(readAppliedState()).toEqual(expected)
        }
    )
})
