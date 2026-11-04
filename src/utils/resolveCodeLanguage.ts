import type CodeLanguage from "@/types/project/CodeLanguage.types"
import CODE_LANGUAGE_ALIASES from "@/utils/codeLanguageAliases"
import CODE_LANGUAGES from "@/utils/codeLanguages"

function isCodeLanguage(value: string): value is CodeLanguage {
    return Object.hasOwn(CODE_LANGUAGES, value)
}

function resolveCodeLanguage(language: string | undefined): CodeLanguage | undefined {
    const name = language?.toLowerCase()

    if (!name) {
        return undefined
    }

    if (isCodeLanguage(name)) {
        return name
    }

    const entry = Object.entries(CODE_LANGUAGE_ALIASES).find(([, aliases]) =>
        aliases.includes(name)
    )

    return entry && isCodeLanguage(entry[0]) ? entry[0] : undefined
}

export default resolveCodeLanguage
