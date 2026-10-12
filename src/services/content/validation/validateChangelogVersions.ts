import getMarkdownText from "@/services/content/validation/getMarkdownText"
import parseMarkdown from "@/services/content/validation/parseMarkdown"
import type ContentIssue from "@/types/content/ContentIssue.types"

const VERSION_PATTERN = /^v(\d+)\.(\d+)\.(\d+) · (0[1-9]|1[0-2])\/(\d{4})$/

type Release = { version: number[]; period: number }

function parseRelease(title: string): Release | undefined {
    const match = VERSION_PATTERN.exec(title)

    if (!match) {
        return undefined
    }

    return {
        version: [Number(match[1]), Number(match[2]), Number(match[3])],
        period: Number(match[5]) * 100 + Number(match[4])
    }
}

function isNewer(first: number[], second: number[]): boolean {
    for (let index = 0; index < first.length; index += 1) {
        if (first[index] !== second[index]) {
            return first[index] > second[index]
        }
    }
    return false
}

function validateChangelogVersions(path: string, text: string): ContentIssue[] {
    const issues: ContentIssue[] = []
    const titles = parseMarkdown(text)
        .children.filter((node) => node.type === "heading" && node.depth === 2)
        .map((node) => getMarkdownText(node).trim())
    let previous: Release | undefined

    for (const title of titles) {
        const release = parseRelease(title)

        if (!release) {
            issues.push({ path, message: `Versão fora do formato vX.Y.Z · MM/AAAA: ${title}` })
            continue
        }
        if (
            previous &&
            (!isNewer(previous.version, release.version) || release.period > previous.period)
        ) {
            issues.push({
                path,
                message: `Versão fora de ordem, a mais recente vem primeiro: ${title}`
            })
        }
        previous = release
    }

    return issues
}

export default validateChangelogVersions
