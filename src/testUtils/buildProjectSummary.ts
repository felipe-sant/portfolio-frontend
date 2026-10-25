import type ProjectSummary from "@/types/project/ProjectSummary.types"

function buildProjectSummary(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
    return {
        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c7",
        title: "Projeto Exemplo",
        summary: "Resumo curto do projeto de exemplo.",
        date: "2026-03",
        types: ["web", "api"],
        category: "personal",
        featured: true,
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        cardTechnologies: ["TypeScript", "React", "Node.js"],
        cover: {
            large: { src: "/images/projects/exemplo/cover-large.webp", width: 1280, height: 720 },
            small: { src: "/images/projects/exemplo/cover-small.webp", width: 640, height: 360 }
        },
        ...overrides
    }
}

export default buildProjectSummary
