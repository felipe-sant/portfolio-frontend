import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import buildCurrentTimeline from "@/services/content/buildCurrentTimeline"
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

const INTERNSHIP_TERMS = /estagi|internship|\bintern\b|pasante|pasant[ií]a/i

describe("cargo Júnior no conteúdo", () => {
    it.each(SUPPORTED_LANGUAGES)(
        "profile.json e timeline.json de %s não falam de estágio",
        async (lang) => {
            const folder = join(PUBLIC_ROOT, "content", lang)
            const profile = await readFile(join(folder, "profile.json"), "utf-8")
            const timeline = await readFile(join(folder, "timeline.json"), "utf-8")

            expect(profile).not.toMatch(INTERNSHIP_TERMS)
            expect(timeline).not.toMatch(INTERNSHIP_TERMS)
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "o currículo %s não fala de estágio e declara o cargo",
        async (lang) => {
            const resume = await readFile(join(PUBLIC_ROOT, "cv", `cv-${lang}.md`), "utf-8")
            const role = JSON.parse(
                await readFile(join(PUBLIC_ROOT, "content", lang, "profile.json"), "utf-8")
            ).role

            expect(resume).not.toMatch(INTERNSHIP_TERMS)
            expect(resume.toLowerCase()).toContain(`incicle — ${role.toLowerCase()}`)
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "o heading da Início, o role do perfil e o título da experiência atual de %s são iguais",
        async (lang) => {
            const snapshot = await readContentSnapshot(PUBLIC_ROOT)
            const home = JSON.parse(
                await readFile(join(process.cwd(), "src", "locales", lang, "home.json"), "utf-8")
            )
            const current = buildCurrentTimeline(snapshot.languages[lang].timeline ?? [], [])
                .items[0]

            expect(snapshot.languages[lang].profile?.role).toBe(home.heading)
            expect(current.title).toBe(home.heading)
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "a experiência atual de %s é a da InCicle desde 2026-05",
        async (lang) => {
            const snapshot = await readContentSnapshot(PUBLIC_ROOT)
            const current = buildCurrentTimeline(snapshot.languages[lang].timeline ?? [], [])
                .items[0]

            expect(current.organization).toBe("InCicle")
            expect(current.start).toBe("2026-05")
        }
    )
})
