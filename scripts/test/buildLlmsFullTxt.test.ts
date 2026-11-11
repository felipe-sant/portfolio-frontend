// @vitest-environment node
import { describe, expect, it } from "vitest"
import buildLlmsFullTxt from "@scripts/seo/buildLlmsFullTxt"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import readSeoContent from "@scripts/seo/readSeoContent"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type SeoContent from "@/types/seo/SeoContent.types"

const content = readSeoContent("public")
const EMAIL_PATTERN = /[A-Za-z0-9._+-]+@[A-Za-z0-9-]+\.[a-z]{2,}/

function build(language: SupportedLanguage, source: SeoContent = content): string {
    return buildLlmsFullTxt(language, source, FATEC_SITE_URL, FATEC_BASE_PATH)
}

function contactUrl(language: SupportedLanguage): string {
    return buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `/${language}/contact`)
}

function withResume(language: SupportedLanguage, resume: string): SeoContent {
    return { ...content, [language]: { ...content[language], resume } }
}

describe("buildLlmsFullTxt", () => {
    it.each(SUPPORTED_LANGUAGES)(
        "%s traz o resumo do próprio idioma e nenhum dos outros",
        (language) => {
            const text = build(language)

            expect(text).toContain(content[language].profile.summary)
            SUPPORTED_LANGUAGES.filter((other) => other !== language).forEach((other) =>
                expect(text).not.toContain(content[other].profile.summary)
            )
        }
    )

    it("usa rótulos de seção no idioma do arquivo", () => {
        expect(build("pt-BR")).toContain("## Perfil")
        expect(build("pt-BR")).not.toContain("## Profile")
        expect(build("en")).toContain("## Profile")
        expect(build("en")).not.toContain("## Perfil")
        expect(build("es")).toContain("## Perfil")
        expect(build("es")).toContain("## Trayectoria")
    })

    it.each(SUPPORTED_LANGUAGES)(
        "%s traz a trajetória completa, com o conteúdo do modal",
        (language) => {
            const text = build(language)

            content[language].timeline.forEach((item) => {
                const parts = [
                    item.title,
                    item.summary,
                    ...item.details,
                    ...item.responsibilities,
                    ...item.disciplines,
                    ...item.technologies,
                    ...item.certificates.map((certificate) => certificate.name)
                ]

                parts.forEach((part) => expect(text).toContain(part))
            })
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "%s traz ficha técnica, links, galeria e documentos de cada projeto",
        (language) => {
            const text = build(language)

            content[language].projects.forEach((project) => {
                const facts = [
                    project.title,
                    project.summary,
                    project.role,
                    project.duration,
                    project.team
                ]
                const stack = project.stack.flatMap((group) => group.items.map((item) => item.name))
                const links = [project.repositoryUrl, project.demoUrl].filter(
                    (link): link is string => link !== undefined
                )
                const images = project.images.flatMap((image) => [image.alt, image.caption ?? ""])
                const documents = project.documents
                    .filter((document) => document.format === "markdown")
                    .map((document) => document.text.trimEnd())

                ;[...facts, ...stack, ...links, ...images, ...documents].forEach((part) =>
                    expect(text).toContain(part)
                )
                expect(text).toContain(content[language].labels.projectStatus[project.status])
            })
        }
    )

    it("deixa fora os documentos de formato text, como o LICENSE", () => {
        const text = build("pt-BR")
        const licenses = content["pt-BR"].projects.flatMap((project) =>
            project.documents.filter((document) => document.format === "text")
        )

        expect(licenses.length).toBeGreaterThan(0)
        licenses.forEach((license) => {
            expect(text).not.toContain(`### ${license.name}`)
            expect(text).not.toContain(license.text.trimEnd())
        })
    })

    it.each(SUPPORTED_LANGUAGES)(
        "%s embute o currículo e liga o .md e o .pdf do idioma",
        (language) => {
            const text = build(language)

            expect(text).toContain(
                content[language].resume
                    .trimEnd()
                    .replaceAll(content[language].profile.contact.email, contactUrl(language))
            )
            ;["md", "pdf"].forEach((format) =>
                expect(text).toContain(
                    buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `cv/cv-${language}.${format}`)
                )
            )
        }
    )

    it("abre cada documento com cabeçalho ### do nome do arquivo, separado por ---", () => {
        const text = build("pt-BR")
        const [project] = content["pt-BR"].projects
        const readme = project.documents.find((document) => document.name === "README.md")

        expect(text).toContain(`### README.md\n\n${readme?.text.trimEnd()}\n\n---`)
    })

    it.each(SUPPORTED_LANGUAGES)("%s não traz e-mail de nenhum idioma", (language) => {
        const text = build(language)

        SUPPORTED_LANGUAGES.forEach((other) =>
            expect(text).not.toContain(content[other].profile.contact.email)
        )
        expect(text).not.toMatch(EMAIL_PATTERN)
    })

    it.each(SUPPORTED_LANGUAGES)(
        "%s traz no perfil a linha de Contato com a URL do idioma",
        (language) => {
            expect(build(language)).toContain(
                `\n- ${content[language].labels.navigation.contact}: ${contactUrl(language)}\n`
            )
        }
    )

    it("troca todas as ocorrências do e-mail no currículo pela URL de Contato", () => {
        const { email } = content.en.profile.contact
        const text = build("en", withResume("en", `# CV\n\n${email}\n\nEmail: ${email}\n`))

        expect(text).toContain(`# CV\n\n${contactUrl("en")}\n\nEmail: ${contactUrl("en")}`)
        expect(text).not.toContain(email)
    })

    it("embute o currículo sem mudança quando ele não traz o e-mail", () => {
        const resume = "# CV\n\nSem endereço aqui."

        expect(build("es", withResume("es", `${resume}\n`))).toContain(`\n\n${resume}\n`)
    })
})
