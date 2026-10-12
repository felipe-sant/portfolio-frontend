import { describe, expect, it } from "vitest"
import buildProjectSummary from "@/services/content/buildProjectSummary"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

const image = {
    large: { src: "images/projects/x/1-large.webp", width: 1600, height: 900 },
    small: { src: "images/projects/x/1-small.webp", width: 640, height: 360 },
    alt: "Mapa da cidade",
    caption: "Visão geral"
}

describe("buildProjectSummary", () => {
    it("projeta os campos de ProjectSummary e achata as tecnologias da stack", () => {
        const summary = buildProjectSummary(
            buildProjectRecord({
                stack: [
                    { category: "frontend", items: [{ name: "React" }, { name: "TypeScript" }] },
                    { category: "backend", items: [{ name: "Node.js" }] }
                ],
                cardTechnologies: ["React", "Node.js"]
            })
        )

        expect(summary.technologies).toEqual(["React", "TypeScript", "Node.js"])
        expect(summary.cardTechnologies).toEqual(["React", "Node.js"])
        expect(Object.keys(summary)).not.toContain("role")
        expect(Object.keys(summary)).not.toContain("images")
    })

    it("monta a capa de images[0] sem alt", () => {
        const summary = buildProjectSummary(buildProjectRecord({ images: [image] }))

        expect(summary.cover).toEqual({ large: image.large, small: image.small })
    })

    it("não tem cover quando não há imagem", () => {
        const summary = buildProjectSummary(buildProjectRecord({ images: [] }))

        expect("cover" in summary).toBe(false)
    })
})
