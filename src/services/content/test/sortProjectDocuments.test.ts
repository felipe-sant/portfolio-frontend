import { describe, expect, it } from "vitest"
import sortProjectDocuments from "@/services/content/sortProjectDocuments"

describe("sortProjectDocuments", () => {
    it("coloca o README.md primeiro e mantém a ordem dos outros", () => {
        const documents = ["SETUP.md", "README.md", "LICENSE"].map((name, index) => ({
            id: `0192f1d0-0000-7000-8000-00000000000${index}`,
            name,
            format: "text" as const,
            translated: true
        }))

        expect(sortProjectDocuments(documents).map((document) => document.name)).toEqual([
            "README.md",
            "SETUP.md",
            "LICENSE"
        ])
    })
})
