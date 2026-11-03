import buildTimelineItem from "@/testUtils/buildTimelineItem"
import type Timeline from "@/types/timeline/Timeline.types"

function buildTimeline(overrides: Partial<Timeline> = {}): Timeline {
    const certificate = {
        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d1",
        name: "AWS Cloud Practitioner"
    }

    return {
        groups: [
            {
                kind: "experience",
                items: [
                    buildTimelineItem({
                        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1",
                        title: "Desenvolvedor frontend",
                        organization: "Empresa Exemplo",
                        details: ["CLT"],
                        start: "2024-06",
                        responsibilities: ["Mantenho a interface do produto"],
                        technologies: ["React", "TypeScript"],
                        projects: [{ id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5e1", title: "Maps" }]
                    })
                ]
            },
            {
                kind: "education",
                items: [
                    buildTimelineItem({
                        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2",
                        kind: "education",
                        title: "Análise e Desenvolvimento de Sistemas",
                        organization: "Fatec",
                        stage: "6º semestre",
                        start: "2023-02",
                        end: "2026-12",
                        summary: "Tecnólogo com ênfase em desenvolvimento web.",
                        disciplines: ["Banco de dados"]
                    })
                ]
            },
            {
                kind: "course",
                items: [
                    buildTimelineItem({
                        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c3",
                        kind: "course",
                        title: "AWS Cloud Practitioner",
                        organization: "AWS",
                        start: "2025-01",
                        end: "2025-03",
                        summary: "Fundamentos de nuvem.",
                        disciplines: ["Computação em nuvem"],
                        certificates: [certificate]
                    })
                ]
            }
        ],
        certificates: [certificate],
        ...overrides
    }
}

export default buildTimeline
