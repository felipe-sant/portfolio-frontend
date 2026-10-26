import buildProjectRecord from "@/testUtils/buildProjectRecord"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function buildProjectRecords(
    count: number,
    overridesOf: (index: number) => Partial<ProjectRecord> = () => ({})
): ProjectRecord[] {
    return Array.from({ length: count }, (_value, index) =>
        buildProjectRecord({
            id: `0192f1a0-0000-7000-8000-${String(index + 1).padStart(12, "0")}`,
            title: `Projeto ${index + 1}`,
            date: `${2000 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
            types: index % 2 === 0 ? ["web"] : ["api"],
            category: index % 3 === 0 ? "academic" : "personal",
            ...overridesOf(index)
        })
    )
}

export default buildProjectRecords
