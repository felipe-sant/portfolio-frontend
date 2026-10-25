import { describe, expect, it } from "vitest"
import flattenStack from "@/utils/flattenStack"

describe("flattenStack", () => {
    it("devolve vazio sem grupos", () => {
        expect(flattenStack([])).toEqual([])
    })

    it("achata os grupos na ordem frontend, backend e tooling, mantendo a ordem dos itens", () => {
        const result = flattenStack([
            { category: "tooling", items: [{ name: "Git" }] },
            { category: "backend", items: [{ name: "Node.js" }, { name: "PostgreSQL" }] },
            {
                category: "frontend",
                items: [{ name: "TypeScript", isPrimary: true }, { name: "React" }]
            }
        ])

        expect(result.map((item) => item.name)).toEqual([
            "TypeScript",
            "React",
            "Node.js",
            "PostgreSQL",
            "Git"
        ])
    })

    it("marca o item principal e trata a ausência da marcação como falso", () => {
        const result = flattenStack([
            {
                category: "frontend",
                items: [{ name: "TypeScript", isPrimary: true }, { name: "React" }]
            }
        ])

        expect(result).toEqual([
            { name: "TypeScript", isPrimary: true },
            { name: "React", isPrimary: false }
        ])
    })
})
