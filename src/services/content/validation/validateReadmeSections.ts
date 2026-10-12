import getMarkdownText from "@/services/content/validation/getMarkdownText"
import parseMarkdown from "@/services/content/validation/parseMarkdown"
import README_SECTION_TITLES from "@/services/content/validation/readmeSectionTitles"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function validateReadmeSections(
    path: string,
    text: string,
    lang: SupportedLanguage
): ContentIssue[] {
    const expected = README_SECTION_TITLES[lang]
    const required = expected.slice(0, -1)
    const found = parseMarkdown(text)
        .children.filter((node) => node.type === "heading" && node.depth === 2)
        .map((node) => getMarkdownText(node).trim())
    const isValid =
        found.length >= required.length &&
        found.length <= expected.length &&
        found.every((title, index) => title === expected[index])

    if (isValid) {
        return []
    }

    return [
        {
            path,
            message: `O README.md deve ter as seções ${required.join(", ")} e, opcionalmente, ${expected.at(-1)}, nessa ordem (em ##). Encontrado: ${found.join(", ") || "nenhuma"}`
        }
    ]
}

export default validateReadmeSections
