import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const config = JSON.parse(readFileSync(".changeset/config.json", "utf-8"))
const packageJson = JSON.parse(readFileSync("package.json", "utf-8"))

describe("configuração do Changesets", () => {
    it("versiona e marca tag do pacote privado", () => {
        expect(config.privatePackages).toEqual({ version: true, tag: true })
    })

    it("usa a staging como base, o changelog padrão e não commita sozinho", () => {
        expect(config.baseBranch).toBe("staging")
        expect(config.changelog).toBe("@changesets/cli/changelog")
        expect(config.commit).toBe(false)
    })

    it("expõe os scripts changeset e changeset:version e a dependência de desenvolvimento", () => {
        expect(packageJson.scripts.changeset).toBe("changeset")
        expect(packageJson.scripts["changeset:version"]).toBe(
            "changeset version && npm install --package-lock-only --ignore-scripts"
        )
        expect(packageJson.devDependencies["@changesets/cli"]).toBeDefined()
    })
})
