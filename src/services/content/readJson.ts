import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import readText from "@/services/content/readText"
import type ContentSchema from "@/types/content/ContentSchema.types"

const MAX_FIELDS = 10

function parseText(text: string, path: string): unknown {
    try {
        return JSON.parse(text)
    } catch {
        throw new ContentException(
            createContentError(500, "INVALID_CONTENT", `O arquivo ${path} não é um JSON válido`)
        )
    }
}

async function readJson<T>(path: string, loadSchema: () => Promise<ContentSchema<T>>): Promise<T> {
    const [text, schema] = await Promise.all([readText(path), loadSchema()])
    const result = schema.safeParse(parseText(text, path))

    if (result.success) {
        return result.data
    }

    const fields = result.error.issues.slice(0, MAX_FIELDS).map((issue) => ({
        field: issue.path.map(String).join("."),
        code: issue.code,
        message: issue.message
    }))
    const [first] = fields

    throw new ContentException(
        createContentError(
            500,
            "INVALID_CONTENT",
            `O arquivo ${path} não segue o contrato: ${first?.field ?? ""}: ${first?.message ?? ""}`,
            fields
        )
    )
}

export default readJson
