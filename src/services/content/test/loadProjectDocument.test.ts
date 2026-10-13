import { afterEach, describe, expect, it, vi } from "vitest"
import loadProjectDocument from "@/services/content/loadProjectDocument"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("loadProjectDocument", () => {
    it("lê o documento traduzido da pasta do idioma", async () => {
        const fetchMock = stubContentFetch({ "content/en/projects/p1/docs/SETUP.md": "## Setup" })

        const text = await loadProjectDocument("en", "p1", {
            id: "d1",
            name: "SETUP.md",
            format: "markdown",
            translated: true
        })

        expect(text).toBe("## Setup")
        expect(fetchMock).toHaveBeenCalledWith("/content/en/projects/p1/docs/SETUP.md")
    })

    it("lê o documento neutro da pasta shared para qualquer idioma", async () => {
        const fetchMock = stubContentFetch({ "content/shared/projects/p1/docs/LICENSE": "MIT" })

        const text = await loadProjectDocument("es", "p1", {
            id: "d2",
            name: "LICENSE",
            format: "text",
            translated: false,
            contentLanguage: "en"
        })

        expect(text).toBe("MIT")
        expect(fetchMock).toHaveBeenCalledWith("/content/shared/projects/p1/docs/LICENSE")
    })
})
