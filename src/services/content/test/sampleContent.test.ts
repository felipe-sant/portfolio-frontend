import { beforeAll, describe, expect, it } from "vitest"
import buildCurrentTimeline from "@/services/content/buildCurrentTimeline"
import buildTimeline from "@/services/content/buildTimeline"
import listProjects from "@/services/content/listProjects"
import validateProjectListParams from "@/services/content/validateProjectListParams"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"

const LANGUAGES: SupportedLanguage[] = ["pt-BR", "en", "es"]

let snapshot: ContentSnapshot

function projectsOf(lang: SupportedLanguage) {
    return snapshot.languages[lang].projects ?? []
}

function timelineOf(lang: SupportedLanguage) {
    return snapshot.languages[lang].timeline ?? []
}

function profileOf(lang: SupportedLanguage) {
    const profile = snapshot.languages[lang].profile

    if (!profile) {
        throw new Error("Perfil de exemplo ausente")
    }

    return profile
}

function listPage(lang: SupportedLanguage, params: Omit<ProjectListParams, "lang"> = {}) {
    return listProjects(projectsOf(lang), validateProjectListParams({ lang, ...params }))
}

beforeAll(async () => {
    snapshot = await readContentSnapshot()
})

describe("dados de exemplo de public/content (este teste valida só o exemplo e é removido pela #58)", () => {
    describe.each(LANGUAGES)("projetos em %s", (lang) => {
        it("tem 12 projetos, em dois lotes de nove mais três", () => {
            const first = listPage(lang)
            const second = listPage(lang, { offset: 9 })

            expect(first.total).toBe(12)
            expect(first.items).toHaveLength(9)
            expect(second.items).toHaveLength(3)
        })

        it("tem quatro destaques, dois com o mesmo mês, desempatados pelo título", () => {
            const records = projectsOf(lang).filter((project) => project.featured)
            const dates = records.map((project) => project.date)
            const page = listPage(lang, { featured: true, sort: "recent", limit: 4 })
            const tied = page.items.filter((item) => item.date === "2025-09")
            const collator = new Intl.Collator(lang, { sensitivity: "base", numeric: true })

            expect(records).toHaveLength(4)
            expect(new Set(dates).size).toBe(3)
            expect(page.items).toHaveLength(4)
            expect(tied).toHaveLength(2)
            expect(collator.compare(tied[0].title, tied[1].title)).toBeLessThan(0)
        })

        it("cobre tipos, categorias e situações, com tipos ausentes", () => {
            const records = projectsOf(lang)
            const page = listPage(lang)

            expect(page.availableTypes).toEqual(
                expect.arrayContaining(["web", "mobile", "api", "library", "cli", "data"])
            )
            expect(page.availableTypes.length).toBeLessThan(12)
            expect(records.some((project) => project.types.join() === "web,api")).toBe(true)
            expect(new Set(records.map((project) => project.category)).size).toBe(3)
            expect(new Set(records.map((project) => project.status)).size).toBe(3)
        })

        it("tem projetos com 0, 1, 2 e 5 imagens, todas com alt", () => {
            const records = projectsOf(lang)
            const counts = new Set(records.map((project) => project.images.length))

            expect([0, 1, 2, 5].every((count) => counts.has(count))).toBe(true)
            expect(
                records.every((project) => project.images.every((image) => image.alt.length > 0))
            ).toBe(true)
            expect(records.some((project) => project.images.some((image) => image.caption))).toBe(
                true
            )
        })

        it("combina demoUrl e repositoryUrl de quatro jeitos", () => {
            const combos = new Set(
                projectsOf(lang).map(
                    (project) => `${Boolean(project.demoUrl)}-${Boolean(project.repositoryUrl)}`
                )
            )

            expect([...combos].toSorted()).toEqual([
                "false-false",
                "false-true",
                "true-false",
                "true-true"
            ])
        })

        it("tem projetos com 0, 1 e 3 relacionados, stack de 1 a 3 grupos e chips de 1 a 3", () => {
            const records = projectsOf(lang)
            const related = new Set(records.map((project) => project.related.length))
            const groups = new Set(records.map((project) => project.stack.length))
            const chips = new Set(records.map((project) => project.cardTechnologies.length))

            expect([0, 1, 3].every((count) => related.has(count))).toBe(true)
            expect([1, 2, 3].every((count) => groups.has(count))).toBe(true)
            expect([1, 2, 3].every((count) => chips.has(count))).toBe(true)
            expect(
                records.some((project) =>
                    project.stack.some((group) =>
                        group.items.some((item) => item.isProgrammingLanguage)
                    )
                )
            ).toBe(true)
            expect(records.some((project) => project.updatedAt)).toBe(true)
        })

        it("tem documentos variados, com LICENSE neutro e documento de texto sem idioma", () => {
            const records = projectsOf(lang)
            const names = records.map((project) =>
                project.documents.map((document) => document.name)
            )
            const documents = records.flatMap((project) => project.documents)

            expect(names.some((list) => list.join() === "README.md")).toBe(true)
            expect(names.some((list) => list.join() === "README.md,SETUP.md,CHANGELOG.md")).toBe(
                true
            )
            expect(
                documents.some(
                    (document) =>
                        document.name === "LICENSE" &&
                        !document.translated &&
                        document.contentLanguage === "en"
                )
            ).toBe(true)
            expect(
                documents.some(
                    (document) =>
                        document.format === "text" &&
                        !document.translated &&
                        document.contentLanguage === undefined
                )
            ).toBe(true)
        })
    })

    describe.each(LANGUAGES)("trajetória em %s", (lang) => {
        it("tem itens em curso nos três tipos e curso sem organização", () => {
            const records = timelineOf(lang)
            const ongoing = records.filter((record) => record.end === undefined)

            expect(new Set(ongoing.map((record) => record.kind)).size).toBe(3)
            expect(
                records.some(
                    (record) => record.kind === "course" && record.organization === undefined
                )
            ).toBe(true)
            expect(
                records.some((record) => record.kind === "education" && record.stage && !record.end)
            ).toBe(true)
        })

        it("tem três cursos e a ordem final difere da ordem do conteúdo", () => {
            const records = timelineOf(lang)
            const timeline = buildTimeline(records, projectsOf(lang))
            const finalOrder = timeline.groups.flatMap((group) =>
                group.items.map((item) => item.id)
            )
            const contentOrder = ["experience", "education", "course"].flatMap((kind) =>
                records.filter((record) => record.kind === kind).map((record) => record.id)
            )

            expect(timeline.groups[2].items).toHaveLength(3)
            expect(finalOrder).not.toEqual(contentOrder)
        })

        it("repete um certificado em dois itens e lista cada um uma vez", () => {
            const records = timelineOf(lang)
            const timeline = buildTimeline(records, projectsOf(lang))
            const ids = records.flatMap((record) => record.certificates.map((item) => item.id))

            expect(new Set(ids).size).toBeLessThan(ids.length)
            expect(timeline.certificates).toHaveLength(new Set(ids).size)
        })

        it("tem itens com 0, 1 e 2 projetos e blocos conforme o tipo", () => {
            const records = timelineOf(lang)
            const projects = new Set(records.map((record) => record.projectIds.length))

            expect([0, 1, 2].every((count) => projects.has(count))).toBe(true)
            expect(
                records.some(
                    (record) => record.kind === "experience" && record.responsibilities.length > 0
                )
            ).toBe(true)
            expect(
                records.some(
                    (record) => record.kind !== "experience" && record.disciplines.length > 0
                )
            ).toBe(true)
            expect(records.some((record) => record.technologies.length > 0)).toBe(true)
        })

        it("devolve uma experiência e um curso ou formação em curso", () => {
            const current = buildCurrentTimeline(timelineOf(lang), projectsOf(lang))

            expect(current.items.map((item) => item.kind)).toEqual(["experience", "course"])
        })
    })

    describe.each(LANGUAGES)("perfil em %s", (lang) => {
        it("tem disponibilidade, localização, tempo de resposta, redes e princípios", () => {
            const profile = profileOf(lang)

            expect(profile.availability.isAvailable).toBe(true)
            expect(profile.location.detail).toBeDefined()
            expect(profile.contact.responseTime?.detail).toBeDefined()
            expect(profile.links.github).toBeDefined()
            expect(profile.links.linkedin).toBeDefined()
            expect(profile.workPrinciples.length).toBeGreaterThan(0)
        })

        it("tem a stack com os três grupos e um item principal", () => {
            const { stack } = profileOf(lang)
            const primary = stack.flatMap((group) => group.items).filter((item) => item.isPrimary)

            expect(stack.map((group) => group.category)).toEqual(["frontend", "backend", "tooling"])
            expect(primary).toHaveLength(1)
        })

        it("tem a foto 1:1 com 800 e 320 pixels", () => {
            const photo = profileOf(lang).photo

            expect(photo?.large).toMatchObject({ width: 800, height: 800 })
            expect(photo?.small).toMatchObject({ width: 320, height: 320 })
        })
    })
})
