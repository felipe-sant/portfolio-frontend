import { describe, expect, it } from "vitest"
import buildProfile from "@/testUtils/buildProfile"
import buildHomeJsonLd from "@/utils/buildHomeJsonLd"

const LABELS = { name: "Luiz Felipe dos Santos", jobTitle: "Desenvolvedor full stack" }
const SITE_URL = "http://localhost:5173"

describe("buildHomeJsonLd", () => {
    it("monta WebSite e Person ligados pelo @id", () => {
        const profile = buildProfile({
            links: { github: "https://github.com/example", linkedin: "https://linkedin.com/in/x" },
            stack: [
                {
                    category: "frontend",
                    items: [{ name: "TypeScript" }, { name: "React" }]
                },
                { category: "backend", items: [{ name: "TypeScript" }, { name: "Node.js" }] }
            ]
        })

        expect(buildHomeJsonLd("pt-BR", LABELS, profile)).toEqual({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    name: "Luiz Felipe dos Santos",
                    url: `${SITE_URL}/pt-BR`,
                    inLanguage: "pt-BR",
                    publisher: { "@id": `${SITE_URL}/pt-BR#person` }
                },
                {
                    "@type": "Person",
                    "@id": `${SITE_URL}/pt-BR#person`,
                    name: "Luiz Felipe dos Santos",
                    jobTitle: "Desenvolvedor full stack",
                    url: `${SITE_URL}/pt-BR`,
                    sameAs: ["https://github.com/example", "https://linkedin.com/in/x"],
                    knowsAbout: ["TypeScript", "React", "Node.js"]
                }
            ]
        })
    })

    it("inclui em sameAs só as redes existentes", () => {
        const profile = buildProfile({ links: { linkedin: "https://linkedin.com/in/x" } })
        const graph = buildHomeJsonLd("en", LABELS, profile)["@graph"]

        expect(Array.isArray(graph) && graph[1]).toMatchObject({
            sameAs: ["https://linkedin.com/in/x"]
        })
    })

    it("omite sameAs e knowsAbout sem perfil", () => {
        const serialized = JSON.stringify(buildHomeJsonLd("es", LABELS))

        expect(serialized).not.toContain("sameAs")
        expect(serialized).not.toContain("knowsAbout")
        expect(serialized).toContain(`${SITE_URL}/es#person`)
    })

    it("usa o idioma na URL e em inLanguage", () => {
        const serialized = JSON.stringify(buildHomeJsonLd("en", LABELS, buildProfile()))

        expect(serialized).toContain(`"url":"${SITE_URL}/en"`)
        expect(serialized).toContain('"inLanguage":"en"')
    })
})
