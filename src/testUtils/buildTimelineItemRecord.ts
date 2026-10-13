import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function buildTimelineItemRecord(overrides: Partial<TimelineItemRecord> = {}): TimelineItemRecord {
    return {
        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c6",
        kind: "experience",
        title: "Desenvolvedor frontend",
        organization: "Empresa Exemplo",
        details: [],
        start: "2024-06",
        summary: "Desenvolvo e mantenho a interface do produto principal.",
        responsibilities: [],
        disciplines: [],
        technologies: [],
        certificates: [],
        projectIds: [],
        ...overrides
    }
}

export default buildTimelineItemRecord
