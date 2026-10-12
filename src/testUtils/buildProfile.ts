import type Profile from "@/types/profile/Profile.types"

function buildProfile(overrides: Partial<Profile> = {}): Profile {
    return {
        role: "Desenvolvedor full stack",
        homeIntro: "Trabalho em produtos web de ponta a ponta.",
        summary: "Desenvolvedor full stack em TypeScript.",
        location: { city: "São José dos Campos", region: "SP", countryCode: "BR" },
        availability: { isAvailable: true, label: "Disponível para projetos" },
        aboutParagraphs: ["Comecei a programar no curso técnico."],
        workPrinciples: ["Escrevo o teste junto com o código"],
        stack: [{ category: "frontend", items: [{ name: "TypeScript", isPrimary: true }] }],
        contact: { email: "contato@example.com" },
        links: { github: "https://github.com/example" },
        ...overrides
    }
}

export default buildProfile
