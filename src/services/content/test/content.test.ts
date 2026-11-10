import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import validateContent from "@/services/content/validation/validateContent"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import relaxAsyncUtilTimeout from "@/testUtils/relaxAsyncUtilTimeout"
import type ContentIssue from "@/types/content/ContentIssue.types"

relaxAsyncUtilTimeout()

const PUBLIC_ROOT = join(process.cwd(), "public")
let copyRoot = ""

function describeIssues(issues: ContentIssue[]) {
    return issues.map((issue) => `${issue.path}: ${issue.message}`)
}

afterEach(async () => {
    if (copyRoot) {
        await rm(copyRoot, { recursive: true, force: true })
        copyRoot = ""
    }
})

describe("conteúdo de public/", () => {
    it("segue o contrato de dados em todos os idiomas", async () => {
        const issues = validateContent(await readContentSnapshot(PUBLIC_ROOT))

        expect(describeIssues(issues)).toEqual([])
    })

    it.each(SUPPORTED_LANGUAGES)("todo projeto de %s tem ao menos uma imagem", async (lang) => {
        const snapshot = await readContentSnapshot(PUBLIC_ROOT)
        const projects = snapshot.languages[lang].projects ?? []

        expect(projects.length).toBeGreaterThan(0)
        expect(projects.filter((project) => project.images.length < 1)).toEqual([])
    })

    it.each(SUPPORTED_LANGUAGES)("o perfil de %s tem a foto", async (lang) => {
        const snapshot = await readContentSnapshot(PUBLIC_ROOT)

        expect(snapshot.languages[lang].profile?.photo).toBeDefined()
    })

    it("reprova uma cópia com um JSON quebrado", async () => {
        copyRoot = await mkdtemp(join(tmpdir(), "content-copy-"))
        await cp(join(PUBLIC_ROOT, "content"), join(copyRoot, "content"), { recursive: true })
        await cp(join(PUBLIC_ROOT, "images"), join(copyRoot, "images"), { recursive: true })
        const target = join(copyRoot, "content", "en", "projects.json")
        const original = await readFile(target, "utf-8")
        await writeFile(target, original.replace(/"date": "\d{4}-\d{2}"/, '"date": "2026-13"'))

        const issues = validateContent(await readContentSnapshot(copyRoot))

        expect(describeIssues(issues)).toContain(
            'content/en/projects.json#items[0].date: Data fora do formato AAAA-MM: "2026-13"'
        )
    })
})
