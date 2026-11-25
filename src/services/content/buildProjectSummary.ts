import getProjectTechnologies from "@/services/content/getProjectTechnologies"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function buildProjectSummary(record: ProjectRecord): ProjectSummary {
    const summary: ProjectSummary = {
        id: record.id,
        title: record.title,
        summary: record.summary,
        date: record.date,
        types: record.types,
        category: record.category,
        featured: record.featured,
        technologies: getProjectTechnologies(record.stack),
        cardTechnologies: record.cardTechnologies
    }
    const [firstImage] = record.images

    if (firstImage) {
        summary.cover = { large: firstImage.large, small: firstImage.small }
    }

    return summary
}

export default buildProjectSummary
