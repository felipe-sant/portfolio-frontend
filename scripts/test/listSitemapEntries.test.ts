// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import listSitemapEntries from "@scripts/seo/listSitemapEntries"
import listTargets from "@scripts/prerender/listTargets"
import readProjectRecords from "@scripts/prerender/readProjectRecords"
import readSeoContent from "@scripts/seo/readSeoContent"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import appRoutes from "@/routers/routes"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import isLicenseDocument from "@/utils/isLicenseDocument"
import buildProfile from "@/testUtils/buildProfile"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"
import type SeoContent from "@/types/seo/SeoContent.types"
import type SeoProject from "@/types/seo/SeoProject.types"
import type SeoProjectDocument from "@/types/seo/SeoProjectDocument.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const content = readSeoContent("public")
const recordsByLanguage = {
    "pt-BR": await readProjectRecords("pt-BR"),
    en: await readProjectRecords("en"),
    es: await readProjectRecords("es")
}
const { targets } = listTargets(appRoutes, prerenderRoutes, recordsByLanguage)
const entries = listSitemapEntries(targets, content)
const licenseTargets = targets.filter(
    (target) => target.params?.name !== undefined && isLicenseDocument(target.params.name)
)

const FIRST_PROJECT = "0192f1a0-0000-7000-8000-000000000001"
const SECOND_PROJECT = "0192f1a0-0000-7000-8000-000000000002"
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function buildDocument(
    id: number,
    name: string,
    updatedAt: string | undefined
): SeoProjectDocument {
    return {
        id: `0192f1d0-0000-7000-8000-00000000000${id}`,
        name,
        format: "markdown",
        translated: true,
        text: "Texto.",
        ...(updatedAt === undefined ? {} : { updatedAt })
    }
}

function buildFixtureProject(
    base: SeoProject,
    id: string,
    updatedAt: string | undefined,
    documents: SeoProjectDocument[]
): SeoProject {
    const project: SeoProject = { ...base, id, documents }

    Reflect.deleteProperty(project, "updatedAt")

    return updatedAt === undefined ? project : { ...project, updatedAt }
}

function buildFixtureContent(profileDay: string, secondProjectDay: string | undefined): SeoContent {
    const build = (language: SupportedLanguage) => {
        const base = content[language]

        return {
            ...base,
            profile: buildProfile({ updatedAt: profileDay }),
            projects: [
                buildFixtureProject(base.projects[0], FIRST_PROJECT, "2026-03-01", [
                    buildDocument(1, "README.md", "2026-03-01"),
                    buildDocument(2, "LICENSE", "2026-02-01"),
                    buildDocument(3, "SETUP.md", "2026-01-15")
                ]),
                buildFixtureProject(base.projects[0], SECOND_PROJECT, secondProjectDay, [
                    buildDocument(4, "README.md", undefined),
                    buildDocument(5, "license.md", "2026-04-04")
                ])
            ]
        }
    }

    return { "pt-BR": build("pt-BR"), en: build("en"), es: build("es") }
}

function buildFixtureTargets(fixture: SeoContent): PrerenderTarget[] {
    return SUPPORTED_LANGUAGES.flatMap((lang) => {
        const pages = ["", "projects", "about", "contact"].map((pattern) => ({
            path: [lang, pattern].filter(Boolean).join("/"),
            file: "",
            lang,
            pattern,
            params: {}
        }))
        const projectTargets = fixture[lang].projects.flatMap((project) => [
            {
                path: `${lang}/projects/${project.id}`,
                file: "",
                lang,
                pattern: "projects/:id",
                params: { id: project.id }
            },
            ...project.documents
                .filter((document) => document.name !== "README.md")
                .map((document) => ({
                    path: `${lang}/projects/${project.id}/docs/${document.name}`,
                    file: "",
                    lang,
                    pattern: "projects/:id/docs/:name",
                    params: { id: project.id, name: document.name }
                }))
        ])

        return [...pages, ...projectTargets]
    })
}

function lastmodOf(list: ReturnType<typeof listSitemapEntries>, path: string): string | undefined {
    return list.find((entry) => entry.path === path)?.lastmod
}

describe("listSitemapEntries", () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it("não inclui o 404.html nem a raiz", () => {
        expect(entries.some((entry) => entry.path === "" || entry.path.includes("not-found"))).toBe(
            false
        )
        expect(targets.length).toBe(entries.length + licenseTargets.length + 1)
    })

    it("tem quatro páginas fixas, projetos e documentos que não são README nem LICENSE em cada idioma", () => {
        const projects = content["pt-BR"].projects
        const documents = projects.flatMap((project) =>
            project.documents.filter(
                (document) => document.name !== "README.md" && !isLicenseDocument(document.name)
            )
        )

        expect(entries).toHaveLength((4 + projects.length + documents.length) * 3)
        expect(entries).toHaveLength(48)
        expect(entries.some((entry) => isLicenseDocument(entry.path.split("/").at(-1) ?? ""))).toBe(
            false
        )
        expect(entries.every((entry) => DAY_PATTERN.test(entry.lastmod ?? ""))).toBe(true)
    })

    it("liga cada entrada às três versões de idioma", () => {
        entries.forEach((entry) => {
            SUPPORTED_LANGUAGES.forEach((language) => {
                expect(entry.alternates[language].split("/")[0]).toBe(language)
            })
            expect(Object.values(entry.alternates)).toContain(entry.path)
        })
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

    describe("com conteúdo de teste", () => {
        const fixture = buildFixtureContent("2026-04-02", "2026-05-10")
        const fixtureEntries = listSitemapEntries(buildFixtureTargets(fixture), fixture)

        it("deixa a LICENSE fora do sitemap e mantém SETUP.md e os alternates completos", () => {
            const paths = fixtureEntries.map((entry) => entry.path)

            expect(paths.some((path) => /\/docs\/license/i.test(path))).toBe(false)
            expect(paths).toContain(`pt-BR/projects/${FIRST_PROJECT}/docs/SETUP.md`)
            expect(fixtureEntries).toHaveLength((4 + 2 + 1) * 3)
            fixtureEntries.forEach((entry) => {
                expect(Object.keys(entry.alternates).toSorted()).toEqual(["en", "es", "pt-BR"])
            })
            expect(
                fixtureEntries.find(
                    (entry) => entry.path === `en/projects/${FIRST_PROJECT}/docs/SETUP.md`
                )?.alternates
            ).toEqual({
                "pt-BR": `pt-BR/projects/${FIRST_PROJECT}/docs/SETUP.md`,
                en: `en/projects/${FIRST_PROJECT}/docs/SETUP.md`,
                es: `es/projects/${FIRST_PROJECT}/docs/SETUP.md`
            })
        })

        it.each(SUPPORTED_LANGUAGES)(
            "usa profile.updatedAt em Informações e Contato, o maior dos projetos em Projetos e o maior dos dois no Início em %s",
            (language) => {
                expect(lastmodOf(fixtureEntries, `${language}/about`)).toBe("2026-04-02")
                expect(lastmodOf(fixtureEntries, `${language}/contact`)).toBe("2026-04-02")
                expect(lastmodOf(fixtureEntries, `${language}/projects`)).toBe("2026-05-10")
                expect(lastmodOf(fixtureEntries, language)).toBe("2026-05-10")
            }
        )

        it("usa o profile.updatedAt no Início quando ele é o maior", () => {
            const later = buildFixtureContent("2026-08-20", "2026-05-10")
            const laterEntries = listSitemapEntries(buildFixtureTargets(later), later)

            expect(lastmodOf(laterEntries, "pt-BR")).toBe("2026-08-20")
            expect(lastmodOf(laterEntries, "pt-BR/projects")).toBe("2026-05-10")
        })

        it("usa o updatedAt do projeto e do documento", () => {
            expect(lastmodOf(fixtureEntries, `pt-BR/projects/${FIRST_PROJECT}`)).toBe("2026-03-01")
            expect(lastmodOf(fixtureEntries, `pt-BR/projects/${FIRST_PROJECT}/docs/SETUP.md`)).toBe(
                "2026-01-15"
            )
        })

        it("não inventa o lastmod de projeto sem updatedAt", () => {
            const incomplete = buildFixtureContent("2026-04-02", undefined)
            const incompleteEntries = listSitemapEntries(
                buildFixtureTargets(incomplete),
                incomplete
            )

            expect(lastmodOf(incompleteEntries, `pt-BR/projects/${SECOND_PROJECT}`)).toBeUndefined()
            expect(lastmodOf(incompleteEntries, "pt-BR/projects")).toBe("2026-03-01")
        })

        it("não usa a data de hoje em nenhum lastmod", () => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date("2031-12-25T12:00:00Z"))
            const fakeEntries = listSitemapEntries(buildFixtureTargets(fixture), fixture)

            expect(fakeEntries.length).toBeGreaterThan(0)
            expect(fakeEntries.some((entry) => entry.lastmod === "2031-12-25")).toBe(false)
            expect(fakeEntries.map((entry) => entry.lastmod)).toEqual(
                fixtureEntries.map((entry) => entry.lastmod)
            )
        })
    })
})
