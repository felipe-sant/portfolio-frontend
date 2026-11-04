import { describe, expect, it } from "vitest"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"

describe("loadMarkdownRenderer", () => {
    it("guarda a promessa e devolve o componente do documento", async () => {
        const first = loadMarkdownRenderer()
        const second = loadMarkdownRenderer()

        expect(second).toBe(first)
        expect(typeof (await first).default).toBe("function")
    })
})
