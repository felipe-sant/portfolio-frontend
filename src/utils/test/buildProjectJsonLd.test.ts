import { describe, expect, it } from "vitest"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import buildPersonId from "@/utils/buildPersonId"
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

const LANGUAGES: SupportedLanguage[] = ["pt-BR", "en", "es"]
const REPOSITORY = "https://github.com/felipe-sant/maps"

describe.each(LANGUAGES)("buildProjectJsonLd em %s", (language) => {
    it("projeto sem repositório continua CreativeWork, sem codeRepository nem programmingLanguage", () => {
        const node = buildProjectJsonLd(language, buildProjectDetailFixture(), ["Web"])

        expect(node["@type"]).toBe("CreativeWork")
        expect(node.codeRepository).toBeUndefined()
        expect(node.programmingLanguage).toBeUndefined()
    })

    it("programmingLanguage vazio com repositório e sem linguagem na stack sai undefined", () => {
        const node = buildProjectJsonLd(
            language,
            buildProjectDetailFixture({
                repositoryUrl: REPOSITORY,
                stack: [{ category: "frontend", items: [{ name: "React" }] }]
            }),
            ["Web"]
        )

        expect(node["@type"]).toBe("SoftwareSourceCode")
        expect(node.programmingLanguage).toBeUndefined()
    })

    it("name e description são o título e o resumo recebidos", () => {
        const node = buildProjectJsonLd(
            language,
            buildProjectDetailFixture({
                title: `Título ${language}`,
                summary: `Resumo ${language}`,
                repositoryUrl: REPOSITORY
            }),
            ["Web"]
        )

        expect(node.name).toBe(`Título ${language}`)
        expect(node.description).toBe(`Resumo ${language}`)
    })

    it("url e @id são absolutos com o idioma da página", () => {
        const node = buildProjectJsonLd(
            language,
            buildProjectDetailFixture({ repositoryUrl: REPOSITORY }),
            ["Web"]
        )

        expect(node.url).toBe(`${SITE_URL}/${language}/projects/${ID}`)
        expect(node["@id"]).toBe(`${SITE_URL}/${language}/projects/${ID}#project`)
        expect(node.inLanguage).toBe(language)
    })

    it("author é { @id: buildPersonId() }", () => {
        const node = buildProjectJsonLd(
            language,
            buildProjectDetailFixture({ repositoryUrl: REPOSITORY }),
            ["Web"]
        )

        expect(node.author).toEqual({ "@id": buildPersonId() })
    })

    it("codeRepository é o repositoryUrl e programmingLanguage só traz linguagens, sem repetição", () => {
        const node = buildProjectJsonLd(
            language,
            buildProjectDetailFixture({
                repositoryUrl: REPOSITORY,
                stack: [
                    {
                        category: "frontend",
                        items: [
                            { name: "React" },
                            { name: "TypeScript", isProgrammingLanguage: true }
                        ]
                    },
                    {
                        category: "backend",
                        items: [
                            { name: "TypeScript", isProgrammingLanguage: true },
                            { name: "Python", isProgrammingLanguage: true }
                        ]
                    }
                ]
            }),
            ["Web"]
        )

        expect(node["@type"]).toBe("SoftwareSourceCode")
        expect(node.codeRepository).toBe(REPOSITORY)
        expect(node.programmingLanguage).toEqual(["TypeScript", "Python"])
    })
})

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
        expect(node.keywords).toEqual(["React"])
        expect(
            ["React", "TypeScript"].filter(
                (name) =>
                    Array.isArray(node.keywords) &&
                    node.keywords.includes(name) &&
                    Array.isArray(node.programmingLanguage) &&
                    node.programmingLanguage.includes(name)
            )
        ).toEqual([])
        expect(node.dateModified).toBe("2026-04-10")
    })

    it("omite keywords com repositório e stack só de linguagens", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({
                repositoryUrl: "https://github.com/felipe-sant/maps",
                stack: [
                    {
                        category: "frontend",
                        items: [{ name: "TypeScript", isProgrammingLanguage: true }]
                    }
                ]
            }),
            ["Web"]
        )

        expect(node.keywords).toBeUndefined()
        expect(node.programmingLanguage).toEqual(["TypeScript"])
    })

    it("não repete a linguagem marcada em dois grupos com repositório", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({
                repositoryUrl: "https://github.com/felipe-sant/maps",
                stack: [
                    {
                        category: "frontend",
                        items: [
                            { name: "React" },
                            { name: "TypeScript", isProgrammingLanguage: true }
                        ]
                    },
                    {
                        category: "backend",
                        items: [{ name: "TypeScript", isProgrammingLanguage: true }]
                    }
                ]
            }),
            ["Web"]
        )

        expect(node.programmingLanguage).toEqual(["TypeScript"])
        expect(node.keywords).toEqual(["React"])
    })

    it("não repete em keywords o nome presente em dois grupos sem repositório", () => {
        const node = buildProjectJsonLd(
            "pt-BR",
            buildProjectDetailFixture({
                stack: [
                    { category: "frontend", items: [{ name: "React" }] },
                    { category: "tooling", items: [{ name: "React" }] }
                ]
            }),
            ["Web"]
        )

        expect(node.keywords).toEqual(["React"])
    })

    it("monta @id, url, autor, idioma e data de criação", () => {
        const node = buildProjectJsonLd("en", buildProjectDetailFixture(), ["Web"])

        expect(node).toMatchObject({
            "@context": "https://schema.org",
            "@id": `${SITE_URL}/en/projects/${ID}#project`,
            url: `${SITE_URL}/en/projects/${ID}`,
            name: "Maps",
            description: "Mapa colaborativo de pontos de interesse da cidade.",
            author: { "@id": `${SITE_URL}/#person` },
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
