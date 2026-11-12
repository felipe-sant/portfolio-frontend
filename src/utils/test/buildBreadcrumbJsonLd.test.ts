import { afterEach, describe, expect, it, vi } from "vitest"
import buildBreadcrumbJsonLd from "@/utils/buildBreadcrumbJsonLd"
import serializeJsonLd from "@/utils/serializeJsonLd"

const SITE_URL = "http://localhost:5173"
const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("buildBreadcrumbJsonLd", () => {
    it("lista vazia devolve BreadcrumbList com itemListElement vazio", () => {
        const node = buildBreadcrumbJsonLd("pt-BR", [])

        expect(node).toEqual({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: []
        })
    })

    it("um item por entrada, na ordem recebida, com position a partir de 1", () => {
        const node = buildBreadcrumbJsonLd("en", [
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: "Maps", path: "/projects/:id", params: { id: ID } }
        ])

        expect(node.itemListElement).toEqual([
            expect.objectContaining({ position: 1, name: "Home" }),
            expect.objectContaining({ position: 2, name: "Projects" }),
            expect.objectContaining({ position: 3, name: "Maps" })
        ])
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "cada item é ListItem com name e item absoluto com o idioma %s",
        (language) => {
            const node = buildBreadcrumbJsonLd(language, [
                { name: "Início", path: "/" },
                { name: "Projetos", path: "/projects" }
            ])

            expect(node.itemListElement).toEqual([
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Início",
                    item: `${SITE_URL}/${language}`
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Projetos",
                    item: `${SITE_URL}/${language}/projects`
                }
            ])
        }
    )

    it("item com params (id, name) monta /<idioma>/projects/<id>/docs/<name>", () => {
        const node = buildBreadcrumbJsonLd("es", [
            {
                name: "SETUP.md",
                path: "/projects/:id/docs/:name",
                params: { id: ID, name: "SETUP.md" }
            }
        ])

        expect(node.itemListElement).toEqual([
            expect.objectContaining({ item: `${SITE_URL}/es/projects/${ID}/docs/SETUP.md` })
        ])
    })

    it("a URL respeita o prefixo de BASE_URL", async () => {
        vi.stubEnv("BASE_URL", "/portfolio/")
        vi.resetModules()
        const { default: build } = await import("@/utils/buildBreadcrumbJsonLd")

        const node = build("en", [{ name: "Projects", path: "/projects" }])

        expect(node.itemListElement).toEqual([
            expect.objectContaining({ item: `${SITE_URL}/portfolio/en/projects` })
        ])
    })

    it("escapa < ao serializar um nome com </script>", () => {
        const node = buildBreadcrumbJsonLd("pt-BR", [{ name: "</script><b>", path: "/projects" }])

        expect(serializeJsonLd(node)).not.toContain("</script>")
        expect(serializeJsonLd(node)).toContain("\\u003c/script>")
    })
})
