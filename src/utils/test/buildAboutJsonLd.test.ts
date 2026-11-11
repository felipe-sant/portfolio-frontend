import { describe, expect, it } from "vitest"
import buildProfile from "@/testUtils/buildProfile"
import buildTimeline from "@/testUtils/buildTimeline"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import buildAboutJsonLd from "@/utils/buildAboutJsonLd"
import serializeJsonLd from "@/utils/serializeJsonLd"

const LABELS = { name: "Luiz Felipe dos Santos" }
const SITE_URL = "http://localhost:5173"

function mainEntity(node: ReturnType<typeof buildAboutJsonLd>) {
    return JSON.parse(serializeJsonLd(node)).mainEntity
}

describe("buildAboutJsonLd", () => {
    it("sem perfil e sem trajetória traz só id, nome e url da Person, sem lista vazia", () => {
        const node = buildAboutJsonLd("pt-BR", LABELS)

        expect(JSON.parse(serializeJsonLd(node))).toEqual({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `${SITE_URL}/pt-BR/about`,
            inLanguage: "pt-BR",
            mainEntity: {
                "@type": "Person",
                "@id": `${SITE_URL}/#person`,
                name: "Luiz Felipe dos Santos",
                url: `${SITE_URL}/pt-BR`
            }
        })
    })

    it("usa a canônica de about no idioma, o cargo e o resumo do perfil", () => {
        const node = buildAboutJsonLd("en", LABELS, buildProfile(), buildTimeline())
        const person = mainEntity(node)

        expect(node.url).toBe(`${SITE_URL}/en/about`)
        expect(node.inLanguage).toBe("en")
        expect(person["@id"]).toBe(`${SITE_URL}/#person`)
        expect(person.url).toBe(`${SITE_URL}/en`)
        expect(person.jobTitle).toBe("Desenvolvedor full stack")
        expect(person.description).toBe("Desenvolvedor full stack em TypeScript.")
    })

    it("inclui a imagem absoluta da variante grande só quando há foto", () => {
        const photo = {
            large: { src: "/images/profile/photo-large.webp", width: 800, height: 800 },
            small: { src: "/images/profile/photo-small.webp", width: 400, height: 400 }
        }

        expect(mainEntity(buildAboutJsonLd("pt-BR", LABELS, buildProfile({ photo }))).image).toBe(
            `${SITE_URL}/images/profile/photo-large.webp`
        )
        expect(mainEntity(buildAboutJsonLd("pt-BR", LABELS, buildProfile())).image).toBeUndefined()
    })

    it("lista sameAs de GitHub e LinkedIn e knowsAbout sem repetir", () => {
        const profile = buildProfile({
            links: { github: "https://github.com/example", linkedin: "https://linkedin.com/in/x" },
            stack: [
                { category: "frontend", items: [{ name: "TypeScript" }, { name: "React" }] },
                { category: "backend", items: [{ name: "TypeScript" }] }
            ]
        })
        const person = mainEntity(buildAboutJsonLd("pt-BR", LABELS, profile))

        expect(person.sameAs).toEqual(["https://github.com/example", "https://linkedin.com/in/x"])
        expect(person.knowsAbout).toEqual(["TypeScript", "React"])
    })

    it("descreve a localização como Place com PostalAddress", () => {
        const person = mainEntity(buildAboutJsonLd("pt-BR", LABELS, buildProfile()))

        expect(person.homeLocation).toEqual({
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressLocality: "São José dos Campos",
                addressRegion: "SP",
                addressCountry: "BR"
            }
        })
    })

    it("deriva alumniOf, worksFor, hasOccupation e hasCredential da trajetória", () => {
        const timeline = buildTimeline({
            groups: [
                {
                    kind: "experience",
                    items: [
                        buildTimelineItem({
                            title: "Desenvolvedor",
                            organization: "Empresa Atual",
                            summary: "Cuido da interface."
                        }),
                        buildTimelineItem({
                            title: "Estagiário",
                            organization: "Empresa Antiga",
                            end: "2023-12",
                            summary: "Ajudei no suporte."
                        })
                    ]
                },
                {
                    kind: "education",
                    items: [
                        buildTimelineItem({ kind: "education", organization: "Fatec" }),
                        buildTimelineItem({ kind: "education", organization: "Fatec" })
                    ]
                },
                {
                    kind: "course",
                    items: [buildTimelineItem({ kind: "course", organization: "Alura" })]
                }
            ],
            certificates: [
                { id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d1", name: "AWS Cloud Practitioner" },
                { id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d2", name: "React avançado" }
            ]
        })
        const person = mainEntity(buildAboutJsonLd("pt-BR", LABELS, buildProfile(), timeline))

        expect(person.alumniOf).toEqual([{ "@type": "EducationalOrganization", name: "Fatec" }])
        expect(person.worksFor).toEqual([{ "@type": "Organization", name: "Empresa Atual" }])
        expect(person.hasOccupation).toEqual([
            { "@type": "Occupation", name: "Desenvolvedor", description: "Cuido da interface." },
            { "@type": "Occupation", name: "Estagiário", description: "Ajudei no suporte." }
        ])
        expect(person.hasCredential).toEqual([
            { "@type": "EducationalOccupationalCredential", name: "AWS Cloud Practitioner" },
            { "@type": "EducationalOccupationalCredential", name: "React avançado" }
        ])
    })

    it("omite as listas vazias e nunca inclui dateModified", () => {
        const person = mainEntity(
            buildAboutJsonLd(
                "pt-BR",
                LABELS,
                buildProfile(),
                buildTimeline({ groups: [], certificates: [] })
            )
        )

        expect(person).not.toHaveProperty("alumniOf")
        expect(person).not.toHaveProperty("worksFor")
        expect(person).not.toHaveProperty("hasOccupation")
        expect(person).not.toHaveProperty("hasCredential")
        expect(person).not.toHaveProperty("dateModified")
    })

    it("escapa o < de um valor ao serializar", () => {
        const profile = buildProfile({ summary: "Texto </script><script>alert(1)</script>" })
        const serialized = serializeJsonLd(buildAboutJsonLd("pt-BR", LABELS, profile))

        expect(serialized).not.toContain("</script>")
        expect(serialized).toContain("\\u003c/script>")
    })
})
