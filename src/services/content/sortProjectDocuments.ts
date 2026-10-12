import type ProjectDocument from "@/types/project/ProjectDocument.types"

const README_NAME = "README.md"

function sortProjectDocuments(documents: ProjectDocument[]): ProjectDocument[] {
    return [
        ...documents.filter((document) => document.name === README_NAME),
        ...documents.filter((document) => document.name !== README_NAME)
    ]
}

export default sortProjectDocuments
