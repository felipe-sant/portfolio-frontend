import { ReadableStream } from "node:stream/web"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import listTargets from "@scripts/prerender/listTargets"
import render from "@/entry-server"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const FULL_ID = "0192f1a0-0000-7000-8000-000000000001"
const BARE_ID = "0192f1a0-0000-7000-8000-000000000002"
const README: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b0",
    name: "README.md",
    format: "markdown",
    translated: true
}
const SETUP: ProjectDocument = {
    ...README,
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b1",
    name: "SETUP.md"
}
const LICENSE: ProjectDocument = {
    id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b2",
    name: "LICENSE",
    format: "text",
    translated: false,
    contentLanguage: "en"
}
const TITLES = { "pt-BR": "Completo", en: "Complete", es: "Completo es" }

const README_TEXT = [
    "## Instalação",
    "",
    "Texto do readme",
    "",
    "```typescript",
    "const valor = 1",
    "```"
].join("\n")

function buildRecords(language: (typeof LANGUAGES)[number]): ProjectRecord[] {
    return [
        buildProjectRecord({
            id: FULL_ID,
            title: TITLES[language],
            repositoryUrl: "https://github.com/example/completo",
            images: [
                {
                    large: { src: "/images/c/1-large.webp", width: 1600, height: 900 },
                    small: { src: "/images/c/1-small.webp", width: 640, height: 360 },
                    alt: "Tela principal",
                    caption: "Legenda"
                }
            ],
            documents: [README, SETUP, LICENSE],
            related: [{ id: BARE_ID }]
        }),
        buildProjectRecord({ id: BARE_ID, title: `Simples ${language}`, documents: [README] })
    ]
}

function buildFiles() {
    const files: Record<string, unknown> = {}

    for (const language of LANGUAGES) {
        files[`content/${language}/profile.json`] = buildProfile()
        files[`content/${language}/projects.json`] = { items: buildRecords(language) }
        files[`content/${language}/projects/${FULL_ID}/docs/README.md`] = README_TEXT
        files[`content/${language}/projects/${FULL_ID}/docs/SETUP.md`] =
            "## Passos\n\nTexto do setup"
        files[`content/${language}/projects/${BARE_ID}/docs/README.md`] = "## Simples\n\nLeia-me"
    }
    files[`content/shared/projects/${FULL_ID}/docs/LICENSE`] = "MIT License\n\nCopyright"

    return files
}

function targetsOf() {
    return listTargets(routes, prerenderRoutes, {
        "pt-BR": buildRecords("pt-BR"),
        en: buildRecords("en"),
        es: buildRecords("es")
    }).targets
}

function findTarget(file: string): PrerenderTarget {
    const target = targetsOf().find((item) => item.file === file)

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

describe("render de projeto", { timeout: 20000 }, () => {
    it("lista o projeto e os documentos além do README como alvos, sem ignorar a rota", () => {
        const { ignored } = listTargets(routes, prerenderRoutes, {
            "pt-BR": buildRecords("pt-BR"),
            en: buildRecords("en"),
            es: buildRecords("es")
        })
        const files = targetsOf().map((target) => target.file)

        expect(ignored).not.toContain("projects/:id")
        expect(ignored).not.toContain("projects/:id/docs/:name")
        expect(files).toContain(`en/projects/${FULL_ID}.html`)
        expect(files).toContain(`es/projects/${FULL_ID}/docs/SETUP.md.html`)
        expect(files).toContain(`pt-BR/projects/${FULL_ID}/docs/LICENSE.html`)
    })

    it.each(LANGUAGES)(
        "traz h1, imagem, ficha, stack, links, nav, README renderizado e relacionados em %s",
        async (language) => {
            const result = await render(findTarget(`${language}/projects/${FULL_ID}.html`))

            expect(result.language).toBe(language)
            expect(result.html).toMatch(new RegExp(`<h1[^>]*>${TITLES[language]}</h1>`))
            expect(result.html).toContain("/images/c/1-small.webp")
            expect(result.html).toContain("Tela principal")
            expect(result.html).toContain("<h2")
            expect(result.html).toMatch(/<nav[^>]*aria-label/)
            expect(result.html).toContain("https://github.com/example/completo")
            expect(result.html).toMatch(/<h3[^>]*>Instalação<\/h3>/)
            expect(result.html).toContain("<pre")
            expect(result.html).toContain("Texto do readme")
            expect(result.html).toContain(`Simples ${language}`)
            expect(result.state).toContain("getProject")
            expect(result.state).toContain("Texto do readme")
            expect(result.state).not.toContain("getProjectsPages")
        }
    )

    it("traz o documento markdown com título de documento, canônica do nome exato e dois JSON-LD", async () => {
        const result = await render(findTarget(`en/projects/${FULL_ID}/docs/SETUP.md.html`))

        expect(result.html).toContain("<title>SETUP.md · Complete · Luiz Felipe dos Santos</title>")
        expect(result.html).toContain(
            `<link rel="canonical" href="http://localhost:5173/en/projects/${FULL_ID}/docs/SETUP.md"/>`
        )
        expect(result.html.match(/<script type="application\/ld\+json">/g)).toHaveLength(2)
        expect(result.html).toContain("TechArticle")
        expect(result.html).toMatch(/<h3[^>]*>Passos<\/h3>/)
    })

    it("traz o documento de texto num pre com o idioma do conteúdo", async () => {
        const result = await render(findTarget(`pt-BR/projects/${FULL_ID}/docs/LICENSE.html`))

        expect(result.html).toMatch(/<pre[^>]*lang="en"/)
        expect(result.html).toContain("MIT License")
        expect(result.html.match(/<script type="application\/ld\+json">/g)).toHaveLength(2)
    })

    it("pré-renderiza sem erro o projeto sem relacionados, sem imagem e só com README", async () => {
        const result = await render(findTarget(`es/projects/${BARE_ID}.html`))

        expect(result.html).toMatch(/<h1[^>]*>Simples es<\/h1>/)
        expect(result.html).toContain("Leia-me")
        expect(result.html).not.toContain("Projetos relacionados")
        expect(result.html.match(/<script type="application\/ld\+json">/g)).toHaveLength(1)
    })
})
