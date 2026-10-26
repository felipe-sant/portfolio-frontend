import { describe, expect, it } from "vitest"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import buildProjectJsonLd from "@/utils/buildProjectJsonLd"
import serializeJsonLd from "@/utils/serializeJsonLd"

const SITE_URL = "http://localhost:5173"
const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

function image(name: string) {
    return {
        large: { src: `/images/projects/${name}-large.webp`, width: 1600, height: 900 },
        small: { src: `/images/projects/${name}-small.webp`, width: 640, height: 360 },
        alt: `Captura ${name}`
    }
}

describe("buildProjectJsonLd", () => {
    it("vira CreativeWork sem repositório, sem imagens e sem data de atualização", () => {
        const node = buildProjectJsonLd("pt-BR", buildProjectDetailFixture(), ["Web"])

        expect(node["@type"]).toBe("CreativeWork")
        expect(node.codeRepository).toBeUndefined()
        expect(node.programmingLanguage).toBeUndefined()
        expect(node.dateModified).toBeUndefined()
        expect(node.image).toBeUndefined()
    })

    it("vira SoftwareSourceCode com repositório e só as linguagens de programação", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({
                repositoryUrl: "https://github.com/felipe-sant/maps",
                updatedAt: "2026-04-10"
            }),
            ["Web"]
        )

        expect(node["@type"]).toBe("SoftwareSourceCode")
        expect(node.codeRepository).toBe("https://github.com/felipe-sant/maps")
        expect(node.programmingLanguage).toEqual(["TypeScript"])
        expect(node.dateModified).toBe("2026-04-10")
    })

    it("monta @id, url, autor, idioma e data de criação", () => {
        const node = buildProjectJsonLd("en", buildProjectDetailFixture(), ["Web"])

        expect(node).toMatchObject({
            "@context": "https://schema.org",
            "@id": `${SITE_URL}/en/projects/${ID}#project`,
            url: `${SITE_URL}/en/projects/${ID}`,
            name: "Maps",
            description: "Mapa colaborativo de pontos de interesse da cidade.",
            author: { "@id": `${SITE_URL}/en#person` },
            inLanguage: "en",
            dateCreated: "2026-03"
        })
    })

    it("traz as imagens grandes absolutas, o gênero e as palavras-chave da stack", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({ images: [image("a"), image("b")] }),
            ["Web", "API"]
        )

        expect(node.image).toEqual([
            `${SITE_URL}/images/projects/a-large.webp`,
            `${SITE_URL}/images/projects/b-large.webp`
        ])
        expect(node.genre).toEqual(["Web", "API"])
        expect(node.keywords).toEqual(["React", "TypeScript"])
    })

    it("escapa < ao serializar um título com </script>", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({ title: "</script><b>" }),
            ["Web"]
        )

        expect(serializeJsonLd(node)).not.toContain("</script>")
        expect(serializeJsonLd(node)).toContain("\\u003c/script>")
    })
})
