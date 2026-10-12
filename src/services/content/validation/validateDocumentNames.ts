import type ContentIssue from "@/types/content/ContentIssue.types"

const DOCUMENT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

function validateDocumentNames(path: string, names: string[]): ContentIssue[] {
    const issues: ContentIssue[] = []
    const seen = new Set<string>()

    for (const name of names) {
        if (!DOCUMENT_NAME_PATTERN.test(name)) {
            issues.push({
                path,
                message: `Nome de documento inválido: ${name}. Use de 1 a 64 caracteres entre A-Z, a-z, 0-9, ".", "_" e "-", começando por letra ou dígito`
            })
        }

        const key = name.toLowerCase()

        if (seen.has(key)) {
            issues.push({
                path,
                message: `Nome de documento repetido (sem diferenciar caixa): ${name}`
            })
        }
        seen.add(key)
    }

    return issues
}

export default validateDocumentNames
