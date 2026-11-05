import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import resources from "@/i18n/resources"

const NEW_KEYS = ["loading", "pagesLabel", "pageLabel", "canvasHint", "noViewer"] as const
const SOURCE_ROOT = join(process.cwd(), "src")

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return entry.name === "test" || entry.name === "locales" ? [] : listSources(path)
        }

        return /\.tsx?$/.test(entry.name) ? [path] : []
    })
}

describe("textos do modal do currículo", () => {
    it.each(NEW_KEYS)("%s existe em pt-BR, en e es", (key) => {
        for (const language of ["pt-BR", "en", "es"] as const) {
            expect(resources[language].common.resume.modal[key].length, language).toBeGreaterThan(0)
        }
    })

    it.each(["pt-BR", "en", "es"] as const)("%s guarda page e total em pageLabel", (language) => {
        const label = resources[language].common.resume.modal.pageLabel

        expect(label).toContain("{{page}}")
        expect(label).toContain("{{total}}")
    })

    it.each(NEW_KEYS)("%s em en e es difere do pt-BR", (key) => {
        const reference = resources["pt-BR"].common.resume.modal[key]

        expect(resources.en.common.resume.modal[key]).not.toBe(reference)
        expect(resources.es.common.resume.modal[key]).not.toBe(reference)
    })

    it("noViewer descreve só a falha, sem culpar o navegador", () => {
        expect(resources["pt-BR"].common.resume.modal.noViewer).toBe(
            "Não foi possível exibir o currículo aqui. Baixe o PDF ou leia a versão em texto."
        )
    })

    it("nenhuma chave de resume.modal fica sem uso em src", () => {
        const source = listSources(SOURCE_ROOT)
            .map((path) => readFileSync(path, "utf-8"))
            .join("\n")

        for (const key of Object.keys(resources["pt-BR"].common.resume.modal)) {
            expect(source, key).toContain(`resume.modal.${key}`)
        }
    })
})
