// @vitest-environment node
import { describe, expect, it } from "vitest"
import listSitemapEntries from "@scripts/seo/listSitemapEntries"
import listTargets from "@scripts/prerender/listTargets"
import readProjectRecords from "@scripts/prerender/readProjectRecords"
import readSeoContent from "@scripts/seo/readSeoContent"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

const content = readSeoContent("public")
const recordsByLanguage = {
    "pt-BR": await readProjectRecords("pt-BR"),
    en: await readProjectRecords("en"),
    es: await readProjectRecords("es")
}
const { targets } = listTargets(routes, prerenderRoutes, recordsByLanguage)
const entries = listSitemapEntries(targets, content)

describe("listSitemapEntries", () => {
    it("não inclui o 404.html nem a raiz", () => {
        expect(entries.some((entry) => entry.path === "" || entry.path.includes("not-found"))).toBe(
            false
        )
        expect(targets.length).toBe(entries.length + 1)
    })

    it("tem quatro páginas fixas, projetos e documentos além do README em cada idioma", () => {
        const projects = content["pt-BR"].projects
        const documents = projects.flatMap((project) =>
            project.documents.filter((document) => document.name !== "README.md")
        )

        expect(entries).toHaveLength((4 + projects.length + documents.length) * 3)
    })

    it("liga cada entrada às três versões de idioma", () => {
        entries.forEach((entry) => {
            SUPPORTED_LANGUAGES.forEach((language) => {
                expect(entry.alternates[language].split("/")[0]).toBe(language)
            })
            expect(Object.values(entry.alternates)).toContain(entry.path)
        })
    })

    it("usa updatedAt só em projeto e documento que o têm", () => {
        const project = content["pt-BR"].projects[0]
        const readme = project.documents.find((document) => document.name === "README.md")
        const projectEntry = entries.find((entry) => entry.path === `pt-BR/projects/${project.id}`)
        const home = entries.find((entry) => entry.path === "pt-BR")

        expect(projectEntry?.lastmod).toBe(project.updatedAt)
        expect(readme?.updatedAt).toBeDefined()
        expect(home?.lastmod).toBeUndefined()
        expect(
            entries
                .filter((entry) => !entry.path.includes("projects/"))
                .every((entry) => entry.lastmod === undefined)
        ).toBe(true)
    })

    it("usa o updatedAt do documento nas rotas de documento", () => {
        const project = content["pt-BR"].projects[0]
        const document = project.documents.find((candidate) => candidate.name === "SETUP.md")
        const entry = entries.find(
            (candidate) => candidate.path === `pt-BR/projects/${project.id}/docs/SETUP.md`
        )

        expect(document?.updatedAt).toBeDefined()
        expect(entry?.lastmod).toBe(document?.updatedAt)
    })
})
