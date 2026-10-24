import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { RouteObject } from "react-router-dom"
import listTargets from "@scripts/prerender/listTargets"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ListResponse from "@/types/api/ListResponse.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

type RecordsByLanguage = Record<SupportedLanguage, ProjectRecord[]>

const FIRST_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const SECOND_ID = "0192f1b0-7c3e-7b21-8d4f-2a9e6c1b3f51"

function recordsOf(records: ProjectRecord[]): RecordsByLanguage {
    return { "pt-BR": records, en: records, es: records }
}

function readRecords(lang: SupportedLanguage): ProjectRecord[] {
    const content: ListResponse<ProjectRecord> = JSON.parse(
        readFileSync(`public/content/${lang}/projects.json`, "utf-8")
    )

    return content.items
}

function buildFixtureRoutes(): RouteObject[] {
    return SUPPORTED_LANGUAGES.map((language) => ({
        path: language,
        children: [
            { index: true },
            { path: "projects" },
            { path: "about" },
            { path: "contact" },
            { path: "projects/:id" },
            { path: "projects/:id/docs/:name" },
            { path: "*" }
        ]
    }))
}

describe("listTargets com as rotas atuais", () => {
    const { targets, ignored } = listTargets(routes, prerenderRoutes, recordsOf([]))

    it("lista a Início nos três idiomas e o 404.html", () => {
        expect(targets.map((target) => target.file)).toEqual([
            "pt-BR.html",
            "en.html",
            "es.html",
            "404.html"
        ])
    })

    it("emite o 404.html em inglês com status 404", () => {
        expect(targets.at(-1)).toEqual({
            path: "not-found",
            file: "404.html",
            lang: "en",
            status: 404
        })
    })

    it("ignora as rotas que ainda não têm tela", () => {
        expect(ignored).toEqual([
            "projects",
            "about",
            "contact",
            "projects/:id",
            "projects/:id/docs/:name"
        ])
    })

    it("nunca lista a raiz", () => {
        expect(targets.map((target) => target.path)).not.toContain("")
    })
})

describe("listTargets com rotas de fixture", () => {
    const record = buildProjectRecord({
        id: FIRST_ID,
        documents: [
            { id: "a", name: "README.md", format: "markdown", translated: true },
            { id: "b", name: "SETUP.md", format: "markdown", translated: true }
        ]
    })
    const other = buildProjectRecord({ id: SECOND_ID, documents: [] })
    const { targets, ignored } = listTargets(
        buildFixtureRoutes(),
        prerenderRoutes,
        recordsOf([record, other])
    )
    const files = targets.map((target) => target.file)

    it("não ignora nenhuma rota", () => {
        expect(ignored).toEqual([])
    })

    it("emite um arquivo por idioma para cada tela", () => {
        expect(files).toContain("en/projects.html")
        expect(files).toContain("es/about.html")
        expect(files).toContain("pt-BR/contact.html")
    })

    it("emite um arquivo por projeto", () => {
        expect(files).toContain(`en/projects/${FIRST_ID}.html`)
        expect(files).toContain(`en/projects/${SECOND_ID}.html`)
    })

    it("emite o documento com extensão e nunca em pasta", () => {
        expect(files).toContain(`pt-BR/projects/${FIRST_ID}/docs/SETUP.md.html`)
        expect(files.some((file) => file.endsWith("index.html"))).toBe(false)
    })

    it("não emite arquivo de documento para o README.md", () => {
        expect(files.some((file) => file.includes("README.md"))).toBe(false)
    })

    it("guarda o id do documento nos parâmetros do alvo", () => {
        const target = targets.find((candidate) => candidate.file.endsWith("SETUP.md.html"))

        expect(target?.path).toBe(`pt-BR/projects/${FIRST_ID}/docs/SETUP.md`)
    })
})

describe("listTargets com o conteúdo real", () => {
    const real: RecordsByLanguage = {
        "pt-BR": readRecords("pt-BR"),
        en: readRecords("en"),
        es: readRecords("es")
    }
    const { targets } = listTargets(buildFixtureRoutes(), prerenderRoutes, real)

    it("não repete arquivo", () => {
        const files = targets.map((target) => target.file)

        expect(new Set(files).size).toBe(files.length)
    })

    it("emite um arquivo de projeto por registro em cada idioma", () => {
        for (const lang of SUPPORTED_LANGUAGES) {
            for (const record of real[lang]) {
                expect(targets.map((target) => target.file)).toContain(
                    `${lang}/projects/${record.id}.html`
                )
            }
        }
    })

    it("nunca emite arquivo de README.md", () => {
        expect(targets.some((target) => target.file.includes("README.md"))).toBe(false)
    })
})
