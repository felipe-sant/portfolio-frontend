import { ReadableStream } from "node:stream/web"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import listTargets from "@scripts/prerender/listTargets"
import render from "@/entry-server"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const SITE_URL = "http://localhost:5173"
const LANGUAGE_URL = { "pt-BR": "pt-BR", en: "en", es: "es" }
const PROJECT_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

function buildFiles() {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/profile.json`] = buildProfile({
            summary: `Resumo do perfil ${language}`,
            aboutParagraphs: [`Parágrafo sobre mim ${language}`],
            stack: [{ category: "frontend", items: [{ name: "TypeScript" }] }]
        })
        files[`content/${language}/projects.json`] = {
            items: [buildProjectRecord({ id: PROJECT_ID })]
        }
        files[`content/${language}/timeline.json`] = {
            items: [
                buildTimelineItemRecord({
                    id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1",
                    kind: "experience",
                    title: `Cargo ${language}`,
                    summary: `Resumo do cargo ${language}`,
                    responsibilities: [`Responsabilidade ${language}`],
                    technologies: ["React"],
                    projectIds: [PROJECT_ID]
                }),
                buildTimelineItemRecord({
                    id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2",
                    kind: "education",
                    title: `Curso superior ${language}`,
                    organization: "Fatec",
                    start: "2023-02",
                    end: "2026-12",
                    summary: `Resumo da formação ${language}`,
                    disciplines: [`Disciplina ${language}`]
                })
            ]
        }
    }

    return files
}

function findTarget(file: string): PrerenderTarget {
    const { targets } = listTargets(routes, prerenderRoutes, {
        "pt-BR": [],
        en: [],
        es: []
    })
    const target = targets.find((item) => item.file === file)

    if (!target) {
        throw new Error(`Alvo ${file} não encontrado`)
    }

    return target
}

beforeEach(() => {
    vi.stubGlobal("ReadableStream", ReadableStream)
    stubContentFetch(buildFiles())
})

afterEach(() => {
    vi.unstubAllGlobals()
    window.history.pushState({}, "", "/")
})

describe("render de Informações", { timeout: 20000 }, () => {
    it.each(LANGUAGES)("traz h1, apresentação e as seções principais em %s", async (language) => {
        const result = await render(findTarget(`${language}/about.html`))

        expect(result.language).toBe(language)
        expect(result.html).toMatch(/<h1[^>]*>Luiz Felipe dos Santos<\/h1>/)
        expect(result.html).toContain(`Resumo do perfil ${language}`)
        expect(result.html).toContain(`Parágrafo sobre mim ${language}`)
        expect(result.html).toContain("TypeScript")
        expect(result.html).toContain(`Cargo ${language}`)
        expect(result.html.match(/<section/g)).toHaveLength(5)
        expect(result.html).not.toMatch(/data-reveal="hidden"/)
        expect(result.html).not.toContain('role="dialog"')
    })

    it.each(LANGUAGES)(
        "traz o detalhe de todo item de trajetória em contêiner hidden em %s",
        async (language) => {
            const result = await render(findTarget(`${language}/about.html`))
            const hidden = result.html.match(/<div hidden="">.*?<\/div><\/div><\/li>/g) ?? []

            expect(hidden).toHaveLength(2)
            expect(hidden[0]).toContain(`Resumo do cargo ${language}`)
            expect(hidden[0]).toContain(`Responsabilidade ${language}`)
            expect(hidden[0]).toContain("React")
            expect(hidden[1]).toContain(`Resumo da formação ${language}`)
            expect(hidden[1]).toContain(`Disciplina ${language}`)
        }
    )

    it.each(LANGUAGES)(
        "serializa perfil e trajetória na store e declara os metadados em %s",
        async (language) => {
            const result = await render(findTarget(`${language}/about.html`))

            expect(result.state).toContain("getProfile")
            expect(result.state).toContain("getTimeline")
            expect(result.state).toContain(`Resumo do cargo ${language}`)
            expect(result.html).toContain(
                `<link rel="canonical" href="${SITE_URL}/${LANGUAGE_URL[language]}/about"/>`
            )
            expect(result.html).toContain('hrefLang="x-default"')
            expect(result.html).toContain('<meta property="og:type" content="profile"/>')
            expect(result.html).toContain("ProfilePage")
            expect(result.html).toContain('"@type":"Person"')
        }
    )
})
