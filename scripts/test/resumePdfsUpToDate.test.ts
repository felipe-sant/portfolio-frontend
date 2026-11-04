// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import generateResumePdfs from "@scripts/cv/generateResumePdfs"
import readPdfDocument from "@scripts/test/support/readPdfDocument"

const CV_DIRECTORY = join(process.cwd(), "public", "cv")
const GENERATION_TIMEOUT = 60000

describe("PDFs do currículo versionados", () => {
    let output: string

    beforeAll(async () => {
        output = mkdtempSync(join(tmpdir(), "resume-fresh-"))
        await generateResumePdfs(CV_DIRECTORY, output)
    }, GENERATION_TIMEOUT)

    afterAll(() => {
        rmSync(output, { recursive: true, force: true })
    })

    it.each(SUPPORTED_LANGUAGES)(
        "cv-%s.pdf tem o mesmo texto do PDF gerado agora do Markdown; rode npm run cv:pdf e commite",
        async (language) => {
            const versioned = await readPdfDocument(join(CV_DIRECTORY, `cv-${language}.pdf`))
            const fresh = await readPdfDocument(join(output, `cv-${language}.pdf`))

            expect(versioned.text).toBe(fresh.text)
        },
        GENERATION_TIMEOUT
    )
})
