import { expect, test } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import isRecord from "./support/isRecord"
import readProfile from "./support/readProfile"
import readRawProjects from "./support/readRawProjects"

const ORIGIN = "https://fatec-jacarei-dsm-portfolio.github.io"
const LANGUAGES = ["pt-BR", "en", "es"]
const STATIC_ROUTES = 4
const AI_CRAWLERS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot"
]
const FULL_FILES = ["llms-full.txt", "llms-full.en.txt", "llms-full.es.txt"]
const FULL_FILE_BY_LANGUAGE: Record<string, string> = {
    "pt-BR": "llms-full.txt",
    en: "llms-full.en.txt",
    es: "llms-full.es.txt"
}
const EMAIL_PATTERN = /[A-Za-z0-9._+-]+@[A-Za-z0-9-]+\.[a-z]{2,}/

function countDocumentsBesidesReadme(): number {
    return readRawProjects("pt-BR").reduce((total, project) => {
        const documents = Array.isArray(project.documents) ? project.documents : []
        return (
            total +
            documents.filter((document) => isRecord(document) && document.name !== "README.md")
                .length
        )
    }, 0)
}

function contactUrl(language: string): string {
    return `${ORIGIN}${FATEC_BASE_PATH}${language}/contact`
}

function toRelativePath(url: string): string {
    const parsed = new URL(url)
    expect(parsed.origin).toBe(ORIGIN)
    expect(parsed.pathname.startsWith(FATEC_BASE_PATH)).toBe(true)
    return parsed.pathname.slice(FATEC_BASE_PATH.length)
}

function extractLocs(xml: string): string[] {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
}

function extractMarkdownLinks(text: string): string[] {
    return [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1])
}

test.describe("arquivos para buscadores e IA", () => {
    test("NF-IA-12: robots.txt é servido com o sitemap absoluto da Fatec", async ({ request }) => {
        const response = await request.get("robots.txt")
        expect(response.status()).toBe(200)
        const body = await response.text()
        expect(body).toContain(`Sitemap: ${ORIGIN}${FATEC_BASE_PATH}sitemap.xml`)
    })

    test("NF-IA-12: robots.txt libera todos os crawlers e os 11 de IA", async ({ request }) => {
        const body = await (await request.get("robots.txt")).text()
        expect(body).toMatch(/User-agent: \*\nAllow: \//)
        for (const crawler of AI_CRAWLERS) {
            expect(body).toContain(`User-agent: ${crawler}\nAllow: /`)
        }
    })

    test("NF-IA-12: robots.txt declara a política de IA com Content-Signal em cada grupo", async ({
        request
    }) => {
        const body = await (await request.get("robots.txt")).text()
        const signal = "Content-Signal: search=yes, ai-input=yes, ai-train=yes\n"
        for (const agent of ["*", ...AI_CRAWLERS]) {
            expect(body).toContain(`User-agent: ${agent}\nAllow: /\n${signal}`)
        }
        expect(body.match(/^Content-Signal: /gm)).toHaveLength(AI_CRAWLERS.length + 1)
    })

    test("NF-IA-15: sitemap.xml é servido como XML", async ({ request }) => {
        const response = await request.get("sitemap.xml")
        expect(response.status()).toBe(200)
        const body = await response.text()
        expect(body.startsWith("<?xml")).toBe(true)
        expect(body).toContain("<urlset")
    })

    test("NF-IA-15: a contagem de loc do sitemap bate com a fórmula calculada dos JSONs", async ({
        request
    }) => {
        const projects = readRawProjects("pt-BR").length
        expect(projects).toBeGreaterThan(0)
        const expected = (STATIC_ROUTES + projects + countDocumentsBesidesReadme()) * 3
        const locs = extractLocs(await (await request.get("sitemap.xml")).text())
        expect(locs).toHaveLength(expected)
        expect(new Set(locs).size).toBe(expected)
    })

    test("NF-IA-15, NF-IA-11: cada loc é absoluto sob o base e tem hreflang recíproco com x-default em en", async ({
        request
    }) => {
        const xml = await (await request.get("sitemap.xml")).text()
        const blocks = xml.split("<url>").slice(1)
        expect(blocks.length).toBeGreaterThan(0)
        for (const block of blocks) {
            const loc = extractLocs(block)[0]
            expect(loc.startsWith(`${ORIGIN}${FATEC_BASE_PATH}`)).toBe(true)
            expect(loc).not.toMatch(/[?#]/)
            expect(loc.endsWith("/")).toBe(false)
            const hreflangs = [...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)]
            expect(hreflangs.map((match) => match[1])).toEqual(["pt-BR", "en", "es", "x-default"])
            const targets = hreflangs.map((match) => match[2])
            expect(targets).toContain(loc)
            expect(targets[3]).toBe(targets[1])
        }
    })

    test("NF-IA-15: o sitemap não lista a raiz nem o 404", async ({ request }) => {
        const locs = extractLocs(await (await request.get("sitemap.xml")).text())
        expect(locs).not.toContain(`${ORIGIN}${FATEC_BASE_PATH}`)
        expect(locs.some((loc) => loc.includes("404"))).toBe(false)
    })

    test("NF-IA-15: toda loc do sitemap responde 200 no servidor", async ({ request }) => {
        const locs = extractLocs(await (await request.get("sitemap.xml")).text())
        for (const loc of locs) {
            const response = await request.get(toRelativePath(loc))
            expect(response.status(), loc).toBe(200)
        }
    })

    test("NF-IA-05: llms.txt é servido nos três idiomas no formato llmstxt.org", async ({
        request
    }) => {
        const response = await request.get("llms.txt")
        expect(response.status()).toBe(200)
        const body = await response.text()
        expect(body).toMatch(/^# \S/)
        expect(body).toContain(`\n> ${readProfile("pt-BR").summary}\n`)
        expect(body).toContain(`\nEnglish: ${readProfile("en").summary}\n`)
        expect(body).toContain(`\nEspañol: ${readProfile("es").summary}\n`)
        expect(body.match(/^## \S/gm)).toHaveLength(12)
        expect(body).toMatch(/\n- \[[^\]]+\]\(https:\/\/[^)]+\)/)
    })

    test("NF-IA-05: llms.txt lista as páginas, todos os projetos, o CV e os llms-full", async ({
        request
    }) => {
        const body = await (await request.get("llms.txt")).text()
        const links = extractMarkdownLinks(body)
        for (const language of LANGUAGES) {
            for (const route of ["", "/projects", "/about", "/contact"]) {
                expect(links).toContain(`${ORIGIN}${FATEC_BASE_PATH}${language}${route}`)
            }
            for (const extension of ["md", "pdf"]) {
                expect(links).toContain(`${ORIGIN}${FATEC_BASE_PATH}cv/cv-${language}.${extension}`)
            }
        }
        for (const project of readRawProjects("pt-BR")) {
            for (const language of LANGUAGES) {
                expect(links).toContain(
                    `${ORIGIN}${FATEC_BASE_PATH}${language}/projects/${String(project.id)}`
                )
            }
        }
        for (const file of FULL_FILES) {
            expect(links).toContain(`${ORIGIN}${FATEC_BASE_PATH}${file}`)
        }
    })

    test("NF-IA-05, NF-IA-07: toda URL do llms.txt responde 200, inclusive CV em md e pdf", async ({
        request
    }) => {
        const body = await (await request.get("llms.txt")).text()
        const links = [...new Set(extractMarkdownLinks(body))]
        expect(links.length).toBeGreaterThan(0)
        for (const link of links) {
            const response = await request.get(toRelativePath(link))
            expect(response.status(), link).toBe(200)
        }
    })

    for (const file of FULL_FILES) {
        test(`NF-IA-06: ${file} é servido com conteúdo`, async ({ request }) => {
            const response = await request.get(file)
            expect(response.status()).toBe(200)
            const body = await response.text()
            expect(body.length).toBeGreaterThan(1000)
            expect(body).toMatch(/^# \S/)
        })
    }

    test("NF-IA-06, NF-IA-07: cada llms-full está no idioma do arquivo e traz o CV e todos os projetos", async ({
        request
    }) => {
        for (const language of LANGUAGES) {
            const body = await (await request.get(FULL_FILE_BY_LANGUAGE[language])).text()
            for (const extension of ["md", "pdf"]) {
                expect(body).toContain(`${ORIGIN}${FATEC_BASE_PATH}cv/cv-${language}.${extension}`)
            }
            const resume = await (await request.get(`cv/cv-${language}.md`)).text()
            expect(body).toContain(
                resume.trim().replaceAll(readProfile(language).email, contactUrl(language))
            )
            for (const project of readRawProjects(language)) {
                expect(body).toContain(String(project.title))
                expect(body).toContain(String(project.summary))
            }
        }
        const portuguese = readRawProjects("pt-BR")
        const english = await (await request.get("llms-full.en.txt")).text()
        for (const project of portuguese) {
            expect(english).not.toContain(String(project.summary))
        }
    })

    test("NF-IA-06: nenhum llms*.txt traz o e-mail, e cada llms-full liga a Contato do idioma", async ({
        request
    }) => {
        const emails = LANGUAGES.map((language) => readProfile(language).email)
        for (const file of ["llms.txt", ...FULL_FILES]) {
            const body = await (await request.get(file)).text()
            expect(body, file).not.toMatch(EMAIL_PATTERN)
            for (const email of emails) {
                expect(body, file).not.toContain(email)
            }
        }
        for (const language of LANGUAGES) {
            const body = await (await request.get(FULL_FILE_BY_LANGUAGE[language])).text()
            expect(body).toContain(contactUrl(language))
        }
    })
})
