import type ProjectDetail from "@/types/project/ProjectDetail.types"

function buildProjectDetailFixture(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
    return {
        id: "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
        title: "Maps",
        summary: "Mapa colaborativo de pontos de interesse da cidade.",
        date: "2026-03",
        types: ["web"],
        category: "personal",
        featured: false,
        technologies: ["React", "TypeScript"],
        cardTechnologies: ["React"],
        role: "Full stack",
        duration: "4 meses",
        team: "Sozinho",
        status: "completed",
        stack: [
            {
                category: "frontend",
                items: [{ name: "React" }, { name: "TypeScript", isProgrammingLanguage: true }]
            }
        ],
        images: [],
        documents: [
            {
                id: "0192f1d0-2b3c-7d4e-8f50-61728394a5b6",
                name: "README.md",
                format: "markdown",
                translated: true
            }
        ],
        related: [],
        ...overrides
    }
}

export default buildProjectDetailFixture
