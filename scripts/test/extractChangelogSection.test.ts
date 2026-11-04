import { describe, expect, it } from "vitest"
import extractChangelogSection from "@scripts/extractChangelogSection"

const changelog = [
    "# portfolio-frontend",
    "",
    "## 1.1.0",
    "",
    "### Minor Changes",
    "",
    "- Nova coisa",
    "",
    "## 1.0.0",
    "",
    "### Major Changes",
    "",
    "- Entrega da v1",
    ""
].join("\n")

describe("extractChangelogSection", () => {
    it("devolve o texto da versão sem o título e preserva os subtítulos", () => {
        expect(extractChangelogSection(changelog, "1.1.0")).toBe(
            "### Minor Changes\n\n- Nova coisa"
        )
    })

    it("extrai a última versão até o fim do arquivo", () => {
        expect(extractChangelogSection(changelog, "1.0.0")).toBe(
            "### Major Changes\n\n- Entrega da v1"
        )
    })

    it("falha em português quando a versão não está no CHANGELOG", () => {
        expect(() => extractChangelogSection(changelog, "2.0.0")).toThrow(
            /Seção da versão 2\.0\.0 não encontrada/
        )
    })
})
