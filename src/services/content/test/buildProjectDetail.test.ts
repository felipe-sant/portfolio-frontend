import { describe, expect, it } from "vitest"
import buildProjectDetail from "@/services/content/buildProjectDetail"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

const target = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000002",
    title: "Check-in de eventos",
    featured: true
})
const other = buildProjectRecord({ id: "0192f1a0-0000-7000-8000-000000000003", title: "Outro" })

describe("buildProjectDetail", () => {
    it("expande related com ProjectSummary na ordem do conteúdo", () => {
        const record = buildProjectRecord({
            related: [
                { id: other.id, reason: "Mesma stack" },
                { id: target.id, reason: "Mesmo tema" }
            ]
        })

        const detail = buildProjectDetail(record, [record, target, other])

        expect(detail.related.map((item) => [item.reason, item.project.title])).toEqual([
            ["Mesma stack", "Outro"],
            ["Mesmo tema", "Check-in de eventos"]
        ])
        expect("related" in detail.related[0].project).toBe(false)
    })

    it("ignora relacionado que não existe", () => {
        const record = buildProjectRecord({ related: [{ id: other.id, reason: "x" }] })

        expect(buildProjectDetail(record, [record]).related).toEqual([])
    })

    it("não traz opcionais ausentes e traz os presentes", () => {
        const bare = buildProjectDetail(buildProjectRecord(), [])
        const full = buildProjectDetail(
            buildProjectRecord({
                demoUrl: "https://maps.example.com",
                repositoryUrl: "https://github.com/example/maps",
                updatedAt: "2026-09-30"
            }),
            []
        )

        expect(Object.keys(bare)).not.toContain("demoUrl")
        expect(Object.keys(bare)).not.toContain("repositoryUrl")
        expect(Object.keys(bare)).not.toContain("updatedAt")
        expect(full.demoUrl).toBe("https://maps.example.com")
        expect(full.repositoryUrl).toBe("https://github.com/example/maps")
        expect(full.updatedAt).toBe("2026-09-30")
    })

    it("coloca o README.md primeiro e mantém a ordem dos outros documentos", () => {
        const detail = buildProjectDetail(
            buildProjectRecord({
                documents: [
                    {
                        id: "0192f1d0-0000-7000-8000-000000000001",
                        name: "SETUP.md",
                        format: "markdown",
                        translated: true
                    },
                    {
                        id: "0192f1d0-0000-7000-8000-000000000002",
                        name: "README.md",
                        format: "markdown",
                        translated: true
                    },
                    {
                        id: "0192f1d0-0000-7000-8000-000000000003",
                        name: "LICENSE",
                        format: "text",
                        translated: false
                    }
                ]
            }),
            []
        )

        expect(detail.documents.map((document) => document.name)).toEqual([
            "README.md",
            "SETUP.md",
            "LICENSE"
        ])
    })

    it("monta technologies e cover como no resumo", () => {
        const record = buildProjectRecord({
            images: [
                {
                    large: { src: "a-large.webp", width: 1600, height: 900 },
                    small: { src: "a-small.webp", width: 640, height: 360 },
                    alt: "Captura"
                }
            ]
        })

        const detail = buildProjectDetail(record, [])

        expect(detail.technologies).toEqual(["React", "TypeScript"])
        expect(detail.cover?.small.src).toBe("a-small.webp")
    })
})
