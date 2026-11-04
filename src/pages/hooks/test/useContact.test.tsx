import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

describe("useContact", () => {
    it("lê o perfil só pelo endpoint do RTK Query, sem importar JSON de conteúdo", () => {
        const source = readFileSync(
            join(process.cwd(), "src", "pages", "hooks", "useContact.ts"),
            "utf-8"
        )

        expect(source).toContain("profileApi.useGetProfileQuery")
        expect(source).not.toMatch(/from\s+["'][^"']*\.json["']/)
        expect(source).not.toContain("services/content")
    })
})
