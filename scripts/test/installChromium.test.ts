import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("installChromium", () => {
    const source = readFileSync("scripts/installChromium.ts", "utf-8")

    it("instala só o navegador, sem as dependências do sistema", () => {
        expect(source).not.toContain("--with-deps")
    })

    it("roda npx playwright install chromium", () => {
        expect(source).toContain('["playwright", "install", "chromium"]')
    })
})
