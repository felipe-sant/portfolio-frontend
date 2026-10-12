import buildProjectSummary from "@/services/content/buildProjectSummary"
import sortProjectDocuments from "@/services/content/sortProjectDocuments"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type RelatedProject from "@/types/project/RelatedProject.types"

function buildProjectDetail(record: ProjectRecord, records: ProjectRecord[]): ProjectDetail {
    const related = record.related.flatMap((item): RelatedProject[] => {
        const target = records.find((candidate) => candidate.id === item.id)
        return target ? [{ reason: item.reason, project: buildProjectSummary(target) }] : []
    })
    const detail: ProjectDetail = {
        ...buildProjectSummary(record),
        role: record.role,
        duration: record.duration,
        team: record.team,
        status: record.status,
        stack: record.stack,
        images: record.images,
        documents: sortProjectDocuments(record.documents),
        related
    }

    if (record.demoUrl) {
        detail.demoUrl = record.demoUrl
    }
    if (record.repositoryUrl) {
        detail.repositoryUrl = record.repositoryUrl
    }
    if (record.updatedAt) {
        detail.updatedAt = record.updatedAt
    }

    return detail
}

export default buildProjectDetail
