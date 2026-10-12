import { describe, expect, it } from "vitest"
import validateDocuments from "@/services/content/validation/validateDocuments"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import projectsOf from "@/testUtils/projectsOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const FIRST = "0192f1a0-0000-7000-8000-000000000001"
const SECOND = "0192f1a0-0000-7000-8000-000000000002"
const encoder = new TextEncoder()

function issuesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateDocuments(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateDocuments", () => {
    it("aceita documentos válidos, traduzidos e neutros", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova projeto sem README.md", () => {
        const issues = issuesAfter((snapshot) => {
            projectsOf(snapshot, "pt-BR")[1].documents = []
        })

        expect(issues.some((issue) => issue.includes("precisa do documento README.md"))).toBe(true)
    })

    it("reprova README.md que não é markdown traduzido", () => {
        const issues = issuesAfter((snapshot) => {
            const [readme] = projectsOf(snapshot, "pt-BR")[0].documents
            readme.format = "text"
            readme.translated = false
        })

        expect(issues[0]).toContain("deve ser markdown e traduzido")
    })

    it("reprova nome inválido e nome repetido sem diferenciar caixa", () => {
        const issues = issuesAfter((snapshot) => {
            const documents = projectsOf(snapshot, "pt-BR")[0].documents
            documents[1].name = "com espaço.md"
            documents[3].name = "LICENSE.JSON"
            documents[2].name = "license.json"
        })

        expect(issues.some((issue) => issue.includes("Nome de documento inválido"))).toBe(true)
        expect(issues.some((issue) => issue.includes("repetido"))).toBe(true)
    })

    it("reprova contentLanguage em documento traduzido ou com idioma inválido", () => {
        const issues = issuesAfter((snapshot) => {
            const documents = projectsOf(snapshot, "pt-BR")[0].documents
            Object.assign(documents[0], { contentLanguage: "en" })
            Object.assign(documents[2], { contentLanguage: "fr" })
        })

        expect(issues).toHaveLength(2)
        expect(issues[0]).toContain("contentLanguage")
    })

    it("reprova documento sem arquivo", () => {
        const issues = issuesAfter((snapshot) => {
            Reflect.deleteProperty(snapshot.files, `content/en/projects/${FIRST}/docs/SETUP.md`)
        })

        expect(issues).toEqual([expect.stringContaining("Arquivo do documento inexistente")])
    })

    it("reprova documento neutro sem o arquivo em shared", () => {
        const issues = issuesAfter((snapshot) => {
            Reflect.deleteProperty(snapshot.files, `content/shared/projects/${FIRST}/docs/LICENSE`)
        })

        expect(issues).toEqual([expect.stringContaining("Arquivo do documento inexistente")])
    })

    it("reprova arquivo fora de UTF-8 e arquivo vazio", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/es/projects/${FIRST}/docs/SETUP.md`] = Uint8Array.from([
                0xff, 0xfe
            ])
            snapshot.files[`content/shared/projects/${FIRST}/docs/LICENSE`] = encoder.encode("  \n")
        })

        expect(issues).toHaveLength(2)
        expect(issues.some((issue) => issue.includes("UTF-8"))).toBe(true)
        expect(issues.some((issue) => issue.includes("Documento vazio"))).toBe(true)
    })

    it("reprova Markdown fora das regras (HTML, imagem, título, código sem linguagem, link)", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/pt-BR/projects/${FIRST}/docs/SETUP.md`] = encoder.encode(
                "# Título\n\n<div>x</div>\n\n![a](b.png)\n\n```\ncode\n```\n\n[x](ftp://a)\n"
            )
        })

        expect(issues).toHaveLength(5)
    })

    it("não interpreta documento de texto", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/shared/projects/${FIRST}/docs/LICENSE`] = encoder.encode(
                "# <div>não é markdown</div>\n"
            )
        })

        expect(issues).toEqual([])
    })

    it("reprova README.md sem as seções do idioma", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/en/projects/${SECOND}/docs/README.md`] =
                encoder.encode("## Contexto\n\nTexto.\n")
        })

        expect(issues).toEqual([expect.stringContaining("deve ter as seções")])
    })

    it("valida o CHANGELOG.md quando ele existe", () => {
        const issues = issuesAfter((snapshot) => {
            for (const lang of ["pt-BR", "en", "es"] as const) {
                const [project] = projectsOf(snapshot, lang)
                project.documents.push({
                    id: "0192f1d0-0000-7000-8000-000000000006",
                    name: "CHANGELOG.md",
                    format: "markdown",
                    translated: true
                })
                snapshot.files[`content/${lang}/projects/${FIRST}/docs/CHANGELOG.md`] =
                    encoder.encode("## 1.0.0\n\n- Primeira versão.\n")
            }
        })

        expect(issues).toHaveLength(3)
        expect(issues[0]).toContain("vX.Y.Z · MM/AAAA")
    })

    it("reprova link para projeto ou documento inexistente", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/pt-BR/projects/${FIRST}/docs/SETUP.md`] = encoder.encode(
                `## A\n\n[x](project:${SECOND}/docs/NOPE.md) [y](project:0192f1a0-0000-7000-8000-0000000000ff)\n`
            )
        })

        expect(issues).toHaveLength(2)
    })

    it("aceita link para projeto e documento existentes", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/pt-BR/projects/${FIRST}/docs/SETUP.md`] = encoder.encode(
                `## A\n\n[x](project:${SECOND}/docs/README.md#contexto) [y](project:${FIRST})\n`
            )
        })

        expect(issues).toEqual([])
    })

    it("reprova arquivo órfão e arquivo de documento neutro copiado por idioma", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`content/pt-BR/projects/${FIRST}/docs/EXTRA.md`] =
                encoder.encode("## A\n")
            snapshot.files[`content/en/projects/${FIRST}/docs/LICENSE`] = encoder.encode("MIT")
        })

        expect(issues).toEqual([
            expect.stringContaining("sem declaração correspondente"),
            expect.stringContaining("sem declaração correspondente")
        ])
    })

    it("reprova campo desconhecido e translated que não é booleano", () => {
        const issues = issuesAfter((snapshot) => {
            const [readme] = projectsOf(snapshot, "es")[0].documents
            Object.assign(readme, { title: "Leia-me", translated: "sim" })
        })

        expect(issues.some((issue) => issue.includes("title Campo desconhecido"))).toBe(true)
        expect(issues.some((issue) => issue.includes("translated Deve ser verdadeiro"))).toBe(true)
    })
})
