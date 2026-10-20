import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it } from "vitest"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

interface Scenario {
    saved?: string | null
    systemReduced?: boolean
    hasMatchMedia?: boolean
    storageThrows?: boolean
}

const html = readFileSync("index.html", "utf-8")
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
const motionScript = inlineScripts[2] ?? ""

let requestedKeys: string[] = []

function runScript({
    saved = null,
    systemReduced = false,
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
        ? (query: string) => ({
              matches: systemReduced && query === "(prefers-reduced-motion: reduce)"
          })
        : undefined
    const run = new Function("localStorage", "matchMedia", motionScript)

    run(fakeStorage, fakeMatchMedia)
}

afterEach(() => {
    document.documentElement.removeAttribute("data-motion")
})

describe("script de movimento", () => {
    it("lê a mesma chave de MOTION_STORAGE_KEY", () => {
        runScript()

        expect(requestedKeys).toEqual([MOTION_STORAGE_KEY])
    })

    it("aplica a escolha salva de movimento completo com o sistema pedindo menos", () => {
        runScript({ saved: "full", systemReduced: true })

        expect(document.documentElement).toHaveAttribute("data-motion", "full")
    })

    it("aplica a escolha salva de movimento reduzido com o sistema sem preferência", () => {
        runScript({ saved: "reduced", systemReduced: false })

        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
    })

    it("segue o sistema sem escolha salva", () => {
        runScript({ systemReduced: true })

        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
    })

    it("ignora o valor salvo inválido", () => {
        runScript({ saved: "none", systemReduced: true })

        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
    })

    it("usa movimento completo quando o localStorage lança e o sistema não pede menos", () => {
        expect(() => runScript({ storageThrows: true })).not.toThrow()

        expect(document.documentElement).toHaveAttribute("data-motion", "full")
    })

    it("usa movimento completo sem matchMedia", () => {
        runScript({ hasMatchMedia: false })

        expect(document.documentElement).toHaveAttribute("data-motion", "full")
    })
})
