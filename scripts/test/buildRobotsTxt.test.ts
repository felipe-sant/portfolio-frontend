// @vitest-environment node
import { describe, expect, it } from "vitest"
import buildRobotsTxt from "@scripts/seo/buildRobotsTxt"

const SITEMAP_URL = "https://example.com/sitemap.xml"
const CRAWLERS = [
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

describe("buildRobotsTxt", () => {
    const text = buildRobotsTxt(SITEMAP_URL)

    it("libera todos os agentes", () => {
        expect(text).toContain("User-agent: *\nAllow: /\n")
    })

    it.each(CRAWLERS)("tem um grupo próprio liberado para %s", (crawler) => {
        expect(text).toContain(`User-agent: ${crawler}\nAllow: /\n`)
    })

    it("tem só o grupo curinga e os 11 crawlers", () => {
        expect(text.match(/^User-agent:/gm)).toHaveLength(CRAWLERS.length + 1)
    })

    it("termina com o Sitemap absoluto e quebra de linha, sem Disallow", () => {
        expect(text.trimEnd().split("\n").at(-1)).toBe(`Sitemap: ${SITEMAP_URL}`)
        expect(text.endsWith("\n")).toBe(true)
        expect(text).not.toContain("Disallow")
    })

    it("declara a política de IA uma vez por grupo, sem nenhum não", () => {
        expect(text.match(/^Content-Signal: /gm)).toHaveLength(CRAWLERS.length + 1)
        expect(text).not.toContain("=no")
    })

    it.each(["*", ...CRAWLERS])("declara buscar, responder e treinar sim para %s", (agent) => {
        expect(text).toContain(
            `User-agent: ${agent}\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n`
        )
    })
})
