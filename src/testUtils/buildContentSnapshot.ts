import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import createSolidWebp from "@/services/content/createSolidWebp"
import README_SECTION_TITLES from "@/services/content/validation/readmeSectionTitles"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type LanguageContent from "@/types/content/LanguageContent.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const FIRST_PROJECT = "0192f1a0-0000-7000-8000-000000000001"
const SECOND_PROJECT = "0192f1a0-0000-7000-8000-000000000002"
const CERTIFICATE = "0192f1c4-0000-7000-8000-000000000001"
const GREY = "#bdbdbd"

function imageFor(project: string, index: number, lang: SupportedLanguage) {
    return {
        large: { src: `images/projects/${project}/${index}-large.webp`, width: 1600, height: 900 },
        small: { src: `images/projects/${project}/${index}-small.webp`, width: 640, height: 360 },
        alt: `Captura ${index} (${lang})`,
        caption: `Legenda ${index} (${lang})`
    }
}

function buildProjects(lang: SupportedLanguage): ProjectRecord[] {
    return [
        {
            id: FIRST_PROJECT,
            title: `Maps (${lang})`,
            summary: `Mapa colaborativo (${lang})`,
            date: "2026-03",
            types: ["web", "api"],
            category: "personal",
            featured: true,
            cardTechnologies: ["React", "PostGIS"],
            role: `Full stack (${lang})`,
            duration: `4 meses (${lang})`,
            team: `Sozinho (${lang})`,
            status: "completed",
            stack: [
                {
                    category: "frontend",
                    items: [{ name: "React" }, { name: "TypeScript", isProgrammingLanguage: true }]
                },
                { category: "backend", items: [{ name: "PostGIS" }] }
            ],
            demoUrl: "https://maps.example.com",
            repositoryUrl: "https://github.com/example/maps",
            images: [imageFor(FIRST_PROJECT, 1, lang), imageFor(FIRST_PROJECT, 2, lang)],
            documents: [
                {
                    id: "0192f1d0-0000-7000-8000-000000000001",
                    name: "README.md",
                    format: "markdown",
                    translated: true,
                    updatedAt: "2026-09-30"
                },
                {
                    id: "0192f1d0-0000-7000-8000-000000000002",
                    name: "SETUP.md",
                    format: "markdown",
                    translated: true
                },
                {
                    id: "0192f1d0-0000-7000-8000-000000000003",
                    name: "LICENSE",
                    format: "text",
                    translated: false,
                    contentLanguage: "en"
                },
                {
                    id: "0192f1d0-0000-7000-8000-000000000005",
                    name: "config.json",
                    format: "text",
                    translated: false
                }
            ],
            related: [{ id: SECOND_PROJECT, reason: `Mesma stack (${lang})` }],
            updatedAt: "2026-09-30"
        },
        {
            id: SECOND_PROJECT,
            title: `Catálogo (${lang})`,
            summary: `Biblioteca de componentes (${lang})`,
            date: "2025-11",
            types: ["library"],
            category: "academic",
            featured: false,
            cardTechnologies: ["React"],
            role: `Frontend (${lang})`,
            duration: `2 meses (${lang})`,
            team: `Dupla (${lang})`,
            status: "inDevelopment",
            stack: [{ category: "frontend", items: [{ name: "React" }] }],
            images: [],
            documents: [
                {
                    id: "0192f1d0-0000-7000-8000-000000000004",
                    name: "README.md",
                    format: "markdown",
                    translated: true
                }
            ],
            related: []
        }
    ]
}

function buildLanguage(lang: SupportedLanguage): LanguageContent {
    return {
        profile: {
            role: `Desenvolvedor full stack (${lang})`,
            homeIntro: `Trabalho em produtos web (${lang})`,
            summary: `Desenvolvedor em TypeScript (${lang})`,
            location: {
                city: `São José dos Campos (${lang})`,
                region: "SP",
                countryCode: "BR",
                detail: `Remoto ou híbrido (${lang})`
            },
            availability: { isAvailable: true, label: `Disponível (${lang})` },
            photo: {
                large: { src: "images/profile/photo-large.webp", width: 800, height: 800 },
                small: { src: "images/profile/photo-small.webp", width: 320, height: 320 }
            },
            aboutParagraphs: [`Comecei a programar cedo (${lang})`],
            workPrinciples: [`Escrevo o teste junto com o código (${lang})`],
            stack: [
                { category: "frontend", items: [{ name: "TypeScript", isPrimary: true }] },
                { category: "backend", items: [{ name: "Node.js" }] }
            ],
            contact: {
                email: "contato@example.com",
                responseTime: {
                    label: `Em até 1 dia útil (${lang})`,
                    detail: `Fuso GMT-3 (${lang})`
                }
            },
            links: {
                github: "https://github.com/example",
                linkedin: "https://www.linkedin.com/in/example"
            }
        },
        timeline: [
            {
                id: "0192f1b2-0000-7000-8000-000000000001",
                kind: "experience",
                title: `Desenvolvedor frontend (${lang})`,
                organization: `Empresa Exemplo (${lang})`,
                details: [`CLT (${lang})`],
                start: "2024-06",
                summary: `Mantenho a interface (${lang})`,
                responsibilities: [`Implementar telas (${lang})`],
                disciplines: [],
                technologies: ["React"],
                certificates: [],
                projectIds: [FIRST_PROJECT]
            },
            {
                id: "0192f1b2-0000-7000-8000-000000000002",
                kind: "education",
                title: `Análise e Desenvolvimento de Sistemas (${lang})`,
                organization: `Faculdade Exemplo (${lang})`,
                stage: `6º semestre (${lang})`,
                details: [],
                start: "2023-02",
                end: "2026-12",
                summary: `Graduação tecnológica (${lang})`,
                responsibilities: [],
                disciplines: [`Banco de dados (${lang})`],
                technologies: [],
                certificates: [
                    { id: CERTIFICATE, name: `Diploma (${lang})`, issuer: `Faculdade (${lang})` }
                ],
                projectIds: []
            },
            {
                id: "0192f1b2-0000-7000-8000-000000000003",
                kind: "course",
                title: `Curso de React (${lang})`,
                details: [],
                start: "2025-01",
                summary: `Curso online (${lang})`,
                responsibilities: [],
                disciplines: [`Hooks (${lang})`],
                technologies: ["React"],
                certificates: [],
                projectIds: [FIRST_PROJECT, SECOND_PROJECT]
            }
        ],
        projects: buildProjects(lang)
    }
}

function documentTexts(lang: SupportedLanguage): Record<string, string> {
    const titles = README_SECTION_TITLES[lang].slice(0, -1)
    const readme = titles.map((title) => `## ${title}\n\nTexto.\n`).join("\n")

    return {
        [`content/${lang}/projects/${FIRST_PROJECT}/docs/README.md`]: readme,
        [`content/${lang}/projects/${FIRST_PROJECT}/docs/SETUP.md`]:
            "## Instalação\n\nPasso a passo.\n",
        [`content/${lang}/projects/${SECOND_PROJECT}/docs/README.md`]: readme
    }
}

function buildContentSnapshot(): ContentSnapshot {
    const encoder = new TextEncoder()
    const files: Record<string, Uint8Array> = {
        [`content/shared/projects/${FIRST_PROJECT}/docs/LICENSE`]: encoder.encode("MIT License\n"),
        [`content/shared/projects/${FIRST_PROJECT}/docs/config.json`]: encoder.encode('{"a": 1}\n'),
        "images/profile/photo-large.webp": createSolidWebp(800, 800, GREY),
        "images/profile/photo-small.webp": createSolidWebp(320, 320, GREY)
    }

    for (const index of [1, 2]) {
        files[`images/projects/${FIRST_PROJECT}/${index}-large.webp`] = createSolidWebp(
            1600,
            900,
            GREY
        )
        files[`images/projects/${FIRST_PROJECT}/${index}-small.webp`] = createSolidWebp(
            640,
            360,
            GREY
        )
    }
    for (const lang of SUPPORTED_LANGUAGES) {
        for (const [path, text] of Object.entries(documentTexts(lang))) {
            files[path] = encoder.encode(text)
        }
    }

    return {
        languages: {
            "pt-BR": buildLanguage("pt-BR"),
            en: buildLanguage("en"),
            es: buildLanguage("es")
        },
        files,
        issues: []
    }
}

export default buildContentSnapshot
