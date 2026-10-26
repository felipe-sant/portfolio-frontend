import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import validateContent from "@/services/content/validation/validateContent"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import relaxTimeoutsForLoad from "@/testUtils/relaxTimeoutsForLoad"
import type ContentIssue from "@/types/content/ContentIssue.types"

relaxTimeoutsForLoad()

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
