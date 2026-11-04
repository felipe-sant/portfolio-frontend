import { describe, expect, it } from "vitest"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import buildDocumentJsonLd from "@/utils/buildDocumentJsonLd"
import serializeJsonLd from "@/utils/serializeJsonLd"

const SITE_URL = "http://localhost:5173"
const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const PROJECT = buildProjectDetailFixture()

function setupDocument(overrides = {}) {
    return {
        id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b7",
        name: "SETUP.md",
        format: "markdown" as const,
        translated: true,
        ...overrides
    }
}

describe("buildDocumentJsonLd", () => {
    it("omite dateModified sem updatedAt e o inclui com updatedAt", () => {
        const without = buildDocumentJsonLd("pt-BR", PROJECT, setupDocument())
        const withDate = buildDocumentJsonLd(
            "pt-BR",
            PROJECT,
            setupDocument({ updatedAt: "2026-05-01" })
        )

        expect(without.dateModified).toBeUndefined()
        expect(withDate.dateModified).toBe("2026-05-01")
    })

    it("monta headline, url do documento, autor e about", () => {
        const node = buildDocumentJsonLd("en", PROJECT, setupDocument())

        expect(node).toMatchObject({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "SETUP.md · Maps",
            url: `${SITE_URL}/en/projects/${ID}/docs/SETUP.md`,
            author: { "@id": `${SITE_URL}/en#person` },
            about: { "@id": `${SITE_URL}/en/projects/${ID}#project` }
        })
    })

    it("usa o idioma da página em documento traduzido e o contentLanguage em documento neutro", () => {
        const translated = buildDocumentJsonLd("es", PROJECT, setupDocument())
        const neutral = buildDocumentJsonLd(
            "es",
            PROJECT,
            setupDocument({ name: "LICENSE", translated: false, contentLanguage: "en" })
        )
        const neutralWithout = buildDocumentJsonLd(
            "es",
            PROJECT,
            setupDocument({ name: "LICENSE", translated: false })
        )

        expect(translated.inLanguage).toBe("es")
        expect(neutral.inLanguage).toBe("en")
        expect(neutralWithout.inLanguage).toBe("es")
    })

    it("escapa < ao serializar", () => {
        const node = buildDocumentJsonLd(
            "pt-BR",
            buildProjectDetailFixture({ title: "</script>" }),
            setupDocument()
        )

        expect(serializeJsonLd(node)).not.toContain("</script>")
    })
})
