import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import isHttpsUrl from "@/services/content/validation/isHttpsUrl"
import isRecord from "@/services/content/validation/isRecord"
import requireBoolean from "@/services/content/validation/requireBoolean"
import requireList from "@/services/content/validation/requireList"
import requireText from "@/services/content/validation/requireText"
import validateStack from "@/services/content/validation/validateStack"
import validateStringList from "@/services/content/validation/validateStringList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const REQUIRED_KEYS = [
    "id",
    "title",
    "summary",
    "date",
    "types",
    "category",
    "featured",
    "cardTechnologies",
    "role",
    "duration",
    "team",
    "status",
    "stack",
    "images",
    "documents",
    "related"
]
const OPTIONAL_KEYS = ["demoUrl", "repositoryUrl", "updatedAt"]
const MAX_FEATURED = 4
const MAX_SUMMARY_LENGTH = 160
const MAX_RELATED = 3
const MAX_CARD_TECHNOLOGIES = 3
const GITHUB_PREFIX = "https://github.com/"

function collectTechnologies(stack: unknown): string[] {
    if (!Array.isArray(stack)) {
        return []
    }

    return stack.flatMap((group) =>
        isRecord(group) && Array.isArray(group.items)
            ? group.items.flatMap((item) =>
                  isRecord(item) && typeof item.name === "string" ? [item.name] : []
              )
            : []
    )
}

function validateRelated(related: unknown, path: string, issues: ContentIssue[]): void {
    const items = requireList(related, path, issues)

    if (items.length > MAX_RELATED) {
        issues.push({ path, message: `No máximo ${MAX_RELATED} relacionados` })
    }

    items.forEach((item, index) => {
        const itemPath = `${path}[${index}]`
        if (checkObjectKeys(item, itemPath, ["id", "reason"], [], issues)) {
            requireText(item, "reason", itemPath, issues)
        }
    })
}

function validateProjects(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const projects = snapshot.languages[lang].projects ?? []
        const featured = projects.filter((project) => project.featured === true).length

        if (featured > MAX_FEATURED) {
            issues.push({
                path: `content/${lang}/projects.json#items`,
                message: `${featured} projetos em destaque; o máximo é ${MAX_FEATURED}`
            })
        }

        projects.forEach((project, index) => {
            const path = `content/${lang}/projects.json#items[${index}]`

            if (!checkObjectKeys(project, path, REQUIRED_KEYS, OPTIONAL_KEYS, issues)) {
                return
            }
            for (const key of ["title", "role", "duration", "team"]) {
                requireText(project, key, path, issues)
            }
            requireText(project, "summary", path, issues, MAX_SUMMARY_LENGTH)
            requireBoolean(project, "featured", path, issues)
            validateStack(project.stack, `${path}.stack`, 1, issues)
            validateRelated(project.related, `${path}.related`, issues)

            const cardTechnologies = validateStringList(
                project.cardTechnologies,
                `${path}.cardTechnologies`,
                issues
            )
            const technologies = collectTechnologies(project.stack)
            if (cardTechnologies.length < 1 || cardTechnologies.length > MAX_CARD_TECHNOLOGIES) {
                issues.push({
                    path: `${path}.cardTechnologies`,
                    message: `Informe de 1 a ${MAX_CARD_TECHNOLOGIES} tecnologias do card`
                })
            }
            for (const name of cardTechnologies.filter((item) => !technologies.includes(item))) {
                issues.push({
                    path: `${path}.cardTechnologies`,
                    message: `A tecnologia ${name} do card não está na stack`
                })
            }
            if ("demoUrl" in project && !isHttpsUrl(project.demoUrl)) {
                issues.push({
                    path: `${path}.demoUrl`,
                    message: "Deve ser uma URL https: absoluta"
                })
            }
            if ("repositoryUrl" in project && !isHttpsUrl(project.repositoryUrl, GITHUB_PREFIX)) {
                issues.push({
                    path: `${path}.repositoryUrl`,
                    message: `Deve ser uma URL ${GITHUB_PREFIX}...`
                })
            }
        })
    }

    return issues
}

export default validateProjects
