import { describe, expect, it } from "vitest"
import validateChangelogVersions from "@/services/content/validation/validateChangelogVersions"

function changelog(titles: string[]) {
    return titles.map((title) => `## ${title}\n\n- Mudança.\n`).join("\n")
}

describe("validateChangelogVersions", () => {
    it("aceita versões no formato, da mais recente para a mais antiga", () => {
        const text = changelog(["v1.1.0 · 09/2026", "v1.0.1 · 06/2026", "v1.0.0 · 06/2026"])

        expect(validateChangelogVersions("CHANGELOG.md", text)).toEqual([])
    })

    it("rejeita versão fora do formato", () => {
        expect(validateChangelogVersions("CHANGELOG.md", changelog(["1.0.0"]))).toHaveLength(1)
        expect(
            validateChangelogVersions("CHANGELOG.md", changelog(["v1.0.0 · 13/2026"]))
        ).toHaveLength(1)
        expect(
            validateChangelogVersions("CHANGELOG.md", changelog(["v1.0.0 - 06/2026"]))
        ).toHaveLength(1)
    })

    it("rejeita a versão mais antiga antes da mais recente", () => {
        const text = changelog(["v1.0.0 · 06/2026", "v1.1.0 · 09/2026"])

        expect(validateChangelogVersions("CHANGELOG.md", text)).toHaveLength(1)
    })

    it("rejeita a data que volta a ficar mais nova", () => {
        const text = changelog(["v1.1.0 · 05/2026", "v1.0.0 · 09/2026"])

        expect(validateChangelogVersions("CHANGELOG.md", text)).toHaveLength(1)
    })
})
