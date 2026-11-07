// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import resolveSeoOrigin from "@scripts/seo/resolveSeoOrigin"

describe("resolveSeoOrigin", () => {
    let directory: string

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), "seo-origin-"))
    })

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true })
        vi.unstubAllEnvs()
    })

    it("falha com o erro de resolveSiteUrl quando a origem está ausente", () => {
        vi.stubEnv("VITE_SITE_URL", "")

        expect(() => resolveSeoOrigin(directory)).toThrow("VITE_SITE_URL ausente ou vazia")
    })

    it("falha quando a origem é inválida", () => {
        vi.stubEnv("VITE_SITE_URL", "https://example.com/caminho")

        expect(() => resolveSeoOrigin(directory)).toThrow("VITE_SITE_URL inválida")
    })

    it("lê a origem do ambiente do processo", () => {
        vi.stubEnv("VITE_SITE_URL", "https://example.com")

        expect(resolveSeoOrigin(directory)).toBe("https://example.com")
    })

    it("lê a origem do arquivo .env de produção", () => {
        vi.stubEnv("VITE_SITE_URL", undefined)
        writeFileSync(join(directory, ".env.production"), "VITE_SITE_URL=https://from-file.dev\n")

        expect(resolveSeoOrigin(directory)).toBe("https://from-file.dev")
    })
})
