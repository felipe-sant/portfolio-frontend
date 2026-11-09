import { describe, expect, it } from "vitest"
import readmeScreenshotPath from "@scripts/readmeScreenshotPath"

describe("readmeScreenshotPath", () => {
    it("devolve o caminho da captura clara", () => {
        expect(readmeScreenshotPath("light")).toBe("docs/design/assets/readme/home-light.png")
    })

    it("devolve o caminho da captura escura", () => {
        expect(readmeScreenshotPath("dark")).toBe("docs/design/assets/readme/home-dark.png")
    })
})
