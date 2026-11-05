// @vitest-environment node
import { execFile } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import readPdfDocument from "@scripts/test/support/readPdfDocument"

const CV_DIRECTORY = join(process.cwd(), "public", "cv")
const GENERATION_TIMEOUT = 60000
const run = promisify(execFile)

async function generateInIsolatedProcess(outputDirectory: string) {
    const source = `import generateResumePdfs from "./scripts/cv/generateResumePdfs.ts"; await generateResumePdfs(${JSON.stringify(CV_DIRECTORY)}, ${JSON.stringify(outputDirectory)})`

    await run(process.execPath, ["--import", "tsx", "--input-type=module", "-e", source], {
        cwd: process.cwd(),
        env: { ...process.env, TSX_TSCONFIG_PATH: "tsconfig.node.json" }
    })
}

describe("PDFs do currículo versionados", () => {
    let output: string

    beforeAll(async () => {
        output = mkdtempSync(join(tmpdir(), "resume-fresh-"))
        await generateInIsolatedProcess(output)
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
