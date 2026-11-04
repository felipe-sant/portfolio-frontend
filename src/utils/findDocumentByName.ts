import type ProjectDocument from "@/types/project/ProjectDocument.types"

const README_NAME = "readme.md"

function findDocumentByName(
    documents: ProjectDocument[],
    name?: string
): ProjectDocument | undefined {
    if (name === undefined) {
        return documents.find((document) => document.name.toLowerCase() === README_NAME)
    }

    const wanted = name.toLowerCase()

    if (wanted === README_NAME) {
        return undefined
    }

    return documents.find((document) => document.name.toLowerCase() === wanted)
}

export default findDocumentByName
