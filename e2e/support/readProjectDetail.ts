import isRecord from "./isRecord"
import readRawProjects from "./readRawProjects"

type ProjectDocumentInfo = { name: string; format: string }
type ProjectImageInfo = { alt: string; caption: string; large: string; small: string }
type RelatedInfo = { id: string }

function readString(record: Record<string, unknown>, key: string): string {
    const value = record[key]
    if (typeof value !== "string") {
        throw new Error(`projects.json com ${key} inválido`)
    }
    return value
}

function readList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value) ? value.filter(isRecord) : []
}

function readSource(image: Record<string, unknown>, key: string): string {
    const variant = image[key]
    if (!isRecord(variant)) {
        throw new Error("projects.json com imagem inválida")
    }
    return readString(variant, "src")
}

function readProjectDetail(language: string, title: string) {
    const reference = readRawProjects("pt-BR").find((candidate) => candidate.title === title)
    const item = readRawProjects(language).find((candidate) => candidate.id === reference?.id)
    if (!item) {
        throw new Error(`projeto ${title} ausente de projects.json`)
    }
    const documents: ProjectDocumentInfo[] = readList(item.documents).map((document) => ({
        name: readString(document, "name"),
        format: readString(document, "format")
    }))
    const images: ProjectImageInfo[] = readList(item.images).map((image) => ({
        alt: readString(image, "alt"),
        caption: typeof image.caption === "string" ? image.caption : "",
        large: readSource(image, "large"),
        small: readSource(image, "small")
    }))
    const related: RelatedInfo[] = readList(item.related).map((entry) => ({
        id: readString(entry, "id")
    }))
    return {
        id: readString(item, "id"),
        title: readString(item, "title"),
        summary: readString(item, "summary"),
        date: readString(item, "date"),
        status: readString(item, "status"),
        featured: item.featured === true,
        documents,
        images,
        related,
        demoUrl: typeof item.demoUrl === "string" ? item.demoUrl : undefined,
        repositoryUrl: typeof item.repositoryUrl === "string" ? item.repositoryUrl : undefined
    }
}

export default readProjectDetail
