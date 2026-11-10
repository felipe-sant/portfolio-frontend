import { ReadableStream } from "node:stream/web"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import installPublicFetch from "@scripts/prerender/installPublicFetch"
import listTargets from "@scripts/prerender/listTargets"
import readProjectRecords from "@scripts/prerender/readProjectRecords"
import render from "@/entry-server"
import i18n from "@/i18n/i18n"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import clearContentCache from "@/services/content/clearContentCache"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

vi.mock("@/utils/loadMarkdownRenderer", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/utils/loadMarkdownRenderer")>()

    return { default: vi.fn(original.default) }
})

let restoreFetch = () => {}
let recordsByLanguage: Record<SupportedLanguage, ProjectRecord[]>
let targets: ReturnType<typeof listTargets>["targets"]

function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
}

function readDocumentsNav(html: string, language: SupportedLanguage) {
    const label = i18n.getFixedT(language, "project")("documents.label")

    return new RegExp(`<nav[^>]*aria-label="${label}"[^>]*>[\\s\\S]*?</nav>`).exec(html)?.[0] ?? ""
}

function projectCases() {
    return SUPPORTED_LANGUAGES.flatMap((language) =>
        recordsByLanguage[language].map((record) => ({ language, record }))
    )
}

function findTarget(file: string) {
    const target = targets.find((item) => item.file === file)

    if (!target) {
        throw new Error(`Alvo ${file} não encontrado`)
    }

    return target
}

beforeAll(async () => {
    restoreFetch = installPublicFetch("/")
    recordsByLanguage = {
        "pt-BR": await readProjectRecords("pt-BR"),
        en: await readProjectRecords("en"),
        es: await readProjectRecords("es")
    }
    targets = listTargets(routes, prerenderRoutes, recordsByLanguage).targets
})

afterAll(() => {
    restoreFetch()
})

beforeEach(() => {
    vi.stubGlobal("ReadableStream", ReadableStream)
    clearContentCache()
    vi.mocked(loadMarkdownRenderer).mockClear()
})

describe("pré-renderização do conteúdo real dos projetos", { timeout: 60000 }, () => {
    it("traz h1, imagem principal com alt, ficha, stack e nav completa de cada projeto em cada idioma", async () => {
        for (const { language, record } of projectCases()) {
            const { html } = await render(findTarget(`${language}/projects/${record.id}.html`))
            const nav = readDocumentsNav(html, language)

            expect(nav).not.toBe("")
            expect(html).toMatch(new RegExp(`<h1[^>]*>${escapeHtml(record.title)}</h1>`))
            expect(html).toContain(`alt="${escapeHtml(record.images[0].alt)}"`)
            expect(html).toContain(escapeHtml(record.role))
            expect(html).toContain(escapeHtml(record.duration))
            for (const item of record.stack.flatMap((group) => group.items)) {
                expect(html).toContain(escapeHtml(item.name))
            }
            for (const document of record.documents) {
                const path =
                    document.name === "README.md"
                        ? `/${language}/projects/${record.id}"`
                        : `/${language}/projects/${record.id}/docs/${document.name}"`

                expect(nav).toContain(`href="${path}`)
            }
        }
    })

    it("renderiza a licença de cada projeto que a declara num pre com lang=en e sem puxar o chunk do markdown", async () => {
        for (const { language, record } of projectCases()) {
            const license = record.documents.find((document) => document.name === "LICENSE")
            if (!license) {
                continue
            }
            vi.mocked(loadMarkdownRenderer).mockClear()

            const { html } = await render(
                findTarget(`${language}/projects/${record.id}/docs/LICENSE.html`)
            )

            expect(html).toMatch(/<pre[^>]*lang="en"/)
            expect(loadMarkdownRenderer).not.toHaveBeenCalled()
        }
    })

    it("mostra a seção de relacionados só nos projetos que declaram relacionados, com o título de cada um", async () => {
        for (const { language, record } of projectCases()) {
            const { html } = await render(findTarget(`${language}/projects/${record.id}.html`))
            const heading = i18n.getFixedT(language, "project")("related.heading")
            const relatedTitles = record.related.flatMap((item) => {
                const target = recordsByLanguage[language].find(
                    (candidate) => candidate.id === item.id
                )
                return target ? [target.title] : []
            })

            if (relatedTitles.length > 0) {
                expect(html).toContain(`>${heading}</h2>`)
                for (const title of relatedTitles) {
                    expect(html).toContain(escapeHtml(title))
                }
            } else {
                expect(html).not.toContain(heading)
            }
        }
    })
})
