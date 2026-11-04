import { describe, expect, it } from "vitest"
import buildProfile from "@/testUtils/buildProfile"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import buildContactJsonLd from "@/utils/buildContactJsonLd"
import ROUTES from "@/routers/paths"

const LABELS = {
    title: "Contato · Luiz Felipe dos Santos",
    description: "Como falar com Luiz Felipe dos Santos: e-mail e currículo.",
    name: "Luiz Felipe dos Santos"
}
const SITE_URL = "http://localhost:5173"

describe("buildContactJsonLd", () => {
    it("monta ContactPage com nome, descrição, url e idioma", () => {
        const jsonLd = buildContactJsonLd("pt-BR", LABELS, buildProfile())

        expect(jsonLd).toMatchObject({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: LABELS.title,
            description: LABELS.description,
            url: `${SITE_URL}/pt-BR/contact`,
            inLanguage: "pt-BR"
        })
    })

    it("usa o mesmo @id da Person da Início e o e-mail em mailto", () => {
        const profile = buildProfile()
        const jsonLd = buildContactJsonLd("en", LABELS, profile)

        expect(jsonLd.mainEntity).toMatchObject({
            "@type": "Person",
            "@id": `${buildAbsoluteUrl(ROUTES.home, "en")}#person`,
            name: LABELS.name,
            email: `mailto:${profile.contact.email}`
        })
    })

    it("lista em sameAs só as redes presentes", () => {
        const profile = buildProfile({ links: { github: "https://github.com/example" } })
        const jsonLd = buildContactJsonLd("es", LABELS, profile)

        expect(jsonLd.mainEntity).toMatchObject({ sameAs: ["https://github.com/example"] })
    })

    it("omite sameAs sem nenhuma rede", () => {
        const profile = buildProfile({ links: {} })
        const jsonLd = buildContactJsonLd("pt-BR", LABELS, profile)

        expect(jsonLd.mainEntity).toEqual({
            "@type": "Person",
            "@id": `${SITE_URL}/pt-BR#person`,
            name: LABELS.name,
            email: `mailto:${profile.contact.email}`
        })
    })

    it("sem perfil não lança e omite email e sameAs", () => {
        const jsonLd = buildContactJsonLd("pt-BR", LABELS)

        expect(jsonLd.mainEntity).toEqual({
            "@type": "Person",
            "@id": `${SITE_URL}/pt-BR#person`,
            name: LABELS.name
        })
    })
})
