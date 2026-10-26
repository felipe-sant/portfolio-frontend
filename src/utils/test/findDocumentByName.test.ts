import { describe, expect, it } from "vitest"
import findDocumentByName from "@/utils/findDocumentByName"
import type ProjectDocument from "@/types/project/ProjectDocument.types"

const DOCUMENTS: ProjectDocument[] = ["README.md", "SETUP.md", "LICENSE"].map((name, index) => ({
    id: `0192f1d0-2b3c-7d4e-8f50-61728394a5b${index}`,
    name,
    format: name === "LICENSE" ? "text" : "markdown",
    translated: name !== "LICENSE"
}))

describe("findDocumentByName", () => {
    it("acha pelo nome sem diferenciar caixa", () => {
        expect(findDocumentByName(DOCUMENTS, "setup.md")?.name).toBe("SETUP.md")
        expect(findDocumentByName(DOCUMENTS, "LICENSE")?.name).toBe("LICENSE")
        expect(findDocumentByName(DOCUMENTS, "license")?.name).toBe("LICENSE")
    })

    it("não aceita o README.md como nome de /docs/", () => {
        expect(findDocumentByName(DOCUMENTS, "README.md")).toBeUndefined()
        expect(findDocumentByName(DOCUMENTS, "readme.md")).toBeUndefined()
    })

    it("devolve undefined para nome ausente", () => {
        expect(findDocumentByName(DOCUMENTS, "OUTRO.md")).toBeUndefined()
    })

    it("sem nome, devolve o README.md da lista", () => {
        expect(findDocumentByName(DOCUMENTS)?.name).toBe("README.md")
        expect(findDocumentByName(DOCUMENTS.slice(1))).toBeUndefined()
    })
})
