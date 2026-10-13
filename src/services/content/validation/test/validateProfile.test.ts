import { describe, expect, it } from "vitest"
import validateProfile from "@/services/content/validation/validateProfile"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type Profile from "@/types/profile/Profile.types"

function issuesAfter(mutate: (profile: Profile, snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(profileOf(snapshot, "pt-BR"), snapshot)
    return validateProfile(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateProfile", () => {
    it("aceita o perfil válido", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova aboutParagraphs vazio", () => {
        expect(
            issuesAfter((profile) => {
                profile.aboutParagraphs = []
            })[0]
        ).toContain("pelo menos um parágrafo")
    })

    it("reprova summary, homeIntro e role vazios ou longos", () => {
        const issues = issuesAfter((profile) => {
            profile.summary = ""
            profile.homeIntro = "a".repeat(301)
            Reflect.deleteProperty(profile, "role")
        })

        expect(issues.some((issue) => issue.includes("role Campo obrigatório ausente"))).toBe(true)
        expect(issues.some((issue) => issue.includes("#summary"))).toBe(true)
        expect(issues.some((issue) => issue.includes("301 caracteres"))).toBe(true)
    })

    it("reprova mais de um isPrimary na stack do site", () => {
        const issues = issuesAfter((profile) => {
            profile.stack[1].items[0].isPrimary = true
        })

        expect(issues[0]).toContain("No máximo um item da stack do site pode ter isPrimary")
    })

    it("reprova e-mail inválido ou longo demais", () => {
        expect(
            issuesAfter((profile) => {
                profile.contact.email = "contato"
            })[0]
        ).toContain("E-mail inválido")
        expect(
            issuesAfter((profile) => {
                profile.contact.email = `${"a".repeat(250)}@example.com`
            })[0]
        ).toContain("E-mail inválido")
    })

    it("reprova links que não são https absolutos", () => {
        const issues = issuesAfter((profile) => {
            profile.links.github = "http://github.com/example"
            profile.links.linkedin = "linkedin.com/in/example"
        })

        expect(issues).toHaveLength(2)
    })

    it("reprova countryCode fora de ISO alfa-2 em maiúsculas", () => {
        expect(
            issuesAfter((profile) => {
                profile.location.countryCode = "br"
            })[0]
        ).toContain("ISO 3166-1")
    })

    it("reprova campo desconhecido, availability inválida e responseTime sem label", () => {
        const issues = issuesAfter((profile) => {
            Object.assign(profile, { languages: ["pt-BR"] })
            Object.assign(profile.availability, { isAvailable: "sim" })
            Object.assign(profile.contact, { responseTime: { detail: "Fuso" } })
        })

        expect(issues.some((issue) => issue.includes("languages Campo desconhecido"))).toBe(true)
        expect(issues.some((issue) => issue.includes("isAvailable Deve ser verdadeiro"))).toBe(true)
        expect(issues.some((issue) => issue.includes("responseTime.label Campo obrigatório"))).toBe(
            true
        )
    })

    it("ignora perfil ausente (o retrato já registra o arquivo)", () => {
        const snapshot = buildContentSnapshot()
        snapshot.languages.es.profile = undefined

        expect(validateProfile(snapshot)).toEqual([])
    })
})
