import { readdirSync, readFileSync } from "node:fs"
import { join, sep } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"

const SOURCE_ROOT = join(process.cwd(), "src")
const VARIABLE = "VITE_CONTACT_FORM_ENABLED"

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return entry.name === "test" ? [] : listSources(path)
        }

        return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [path] : []
    })
}

async function readFlag(value: string | undefined): Promise<boolean> {
    vi.resetModules()
    vi.stubEnv(VARIABLE, value)

    return (await import("@/utils/contactFormEnabled")).default
}

describe("contactFormEnabled", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it("liga só com o valor true", async () => {
        expect(await readFlag("true")).toBe(true)
    })

    it.each(["TRUE", "1", " true", "", "false"])("desliga com %j", async (value) => {
        expect(await readFlag(value)).toBe(false)
    })

    it("desliga com a variável ausente", async () => {
        expect(await readFlag(undefined)).toBe(false)
    })

    it("é lida num único arquivo de src", () => {
        const readers = listSources(SOURCE_ROOT)
            .filter((path) => readFileSync(path, "utf-8").includes(VARIABLE))
            .map((path) => path.slice(SOURCE_ROOT.length + 1))

        expect(readers).toEqual([["utils", "contactFormEnabled.ts"].join(sep)])
    })
})
