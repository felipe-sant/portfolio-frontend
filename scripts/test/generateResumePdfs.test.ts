// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import generateResumePdfs from "@scripts/cv/generateResumePdfs"
import readPdfDocument from "@scripts/test/support/readPdfDocument"

const CV_DIRECTORY = join(process.cwd(), "public", "cv")
const GENERATION_TIMEOUT = 60000

describe("generateResumePdfs", () => {
    let output: string

    beforeAll(async () => {
        output = mkdtempSync(join(tmpdir(), "resume-pdf-"))
        await generateResumePdfs(CV_DIRECTORY, output)
    }, GENERATION_TIMEOUT)

    afterAll(() => {
        rmSync(output, { recursive: true, force: true })
    })

    it.each(SUPPORTED_LANGUAGES)("grava cv-%s.pdf começando por %PDF-", (language) => {
        const file = join(output, `cv-${language}.pdf`)

        expect(existsSync(file)).toBe(true)
        expect(readFileSync(file).subarray(0, 5).toString("ascii")).toBe("%PDF-")
    })

    it.each(SUPPORTED_LANGUAGES)(
        "marca o PDF %s com o idioma e a estrutura do documento",
        async (language) => {
            const snapshot = await readPdfDocument(join(output, `cv-${language}.pdf`))

            expect(snapshot.language).toBe(language)
            expect(snapshot.roles.has("Document")).toBe(true)
            expect(snapshot.roles.has("H1")).toBe(true)
            expect(snapshot.roles.has("H2")).toBe(true)
        },
        GENERATION_TIMEOUT
    )

    it.each(SUPPORTED_LANGUAGES)(
        "tem texto selecionável com o nome do autor em %s",
        async (language) => {
            const snapshot = await readPdfDocument(join(output, `cv-${language}.pdf`))

            expect(snapshot.text).toContain("Luiz Felipe dos Santos")
        },
        GENERATION_TIMEOUT
    )

    it("interrompe antes de gravar qualquer PDF quando falta um Markdown", async () => {
        const partial = mkdtempSync(join(tmpdir(), "resume-partial-"))
        const target = mkdtempSync(join(tmpdir(), "resume-target-"))

        try {
            await expect(generateResumePdfs(partial, target)).rejects.toThrow(
                "Markdown do currículo ausente para o idioma pt-BR"
            )
            expect(readdirSync(target)).toEqual([])
        } finally {
            rmSync(partial, { recursive: true, force: true })
            rmSync(target, { recursive: true, force: true })
        }
    })
})
