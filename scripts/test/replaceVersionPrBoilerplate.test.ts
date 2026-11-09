import replaceVersionPrBoilerplate from "@scripts/replaceVersionPrBoilerplate"
import { describe, expect, it } from "vitest"

const PHRASE =
    "PR de versão gerado pelo changesets. Ao mesclar, a versão e o CHANGELOG entram na `staging` e a promoção para `main` segue o fluxo de `docs/setup/environments.md`. Enquanto ele estiver aberto, a promoção fica bloqueada (PR em draft)."

const BOILERPLATE =
    "This PR was opened by the [Changesets release](https://github.com/changesets/action) GitHub action. When you're ready to do a release, you can merge this and publish to npm yourself or [setup this action to publish automatically](https://github.com/changesets/action#with-publishing). If you're not ready to do a release yet, that's fine, whenever you add more changesets to staging, this PR will be updated."

const RELEASES = [
    "# Releases",
    "## portfolio-frontend@1.2.1",
    "",
    "### Patch Changes",
    "",
    "- [#184](https://github.com/felipe-sant/portfolio-frontend/pull/184) Corrige o deslocamento do cabeçalho"
].join("\n")

describe("replaceVersionPrBoilerplate", () => {
    it("devolve idêntico o corpo sem o parágrafo padrão", () => {
        const body = "Texto qualquer\n\n# Releases\n\n- item"

        expect(replaceVersionPrBoilerplate(body)).toBe(body)
    })

    it("devolve vazio para corpo vazio", () => {
        expect(replaceVersionPrBoilerplate("")).toBe("")
    })

    it("não muda corpo que já tem a frase do projeto e é idempotente", () => {
        const body = `${PHRASE}\n\n${RELEASES}`
        const once = replaceVersionPrBoilerplate(`${BOILERPLATE}\n\n${RELEASES}`)

        expect(replaceVersionPrBoilerplate(body)).toBe(body)
        expect(replaceVersionPrBoilerplate(once)).toBe(once)
    })

    it("troca o parágrafo padrão pela frase e mantém Releases idêntico", () => {
        const result = replaceVersionPrBoilerplate(`${BOILERPLATE}\n\n${RELEASES}`)

        expect(result).toBe(`${PHRASE}\n\n${RELEASES}`)
        expect(result).not.toContain("publish to npm")
    })

    it("troca o parágrafo sozinho, sem Releases", () => {
        expect(replaceVersionPrBoilerplate(BOILERPLATE)).toBe(PHRASE)
    })
})
