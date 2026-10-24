import type Stylesheet from "@/types/prerender/Stylesheet.types"

const CLASS_ATTRIBUTE = /\sclass="([^"]*)"/g
const CLASS_SELECTOR = /\.(-?[_a-zA-Z][\w-]*)/g

function collectClassNames(html: string): Set<string> {
    const names = new Set<string>()

    for (const [, value] of html.matchAll(CLASS_ATTRIBUTE)) {
        value.split(/\s+/).forEach((name) => name && names.add(name))
    }

    return names
}

function selectStylesheets(
    html: string,
    candidates: Stylesheet[],
    alreadyLinked: string[]
): string[] {
    const usedClasses = collectClassNames(html)

    return candidates
        .filter(({ href }) => !alreadyLinked.includes(href))
        .filter(({ content }) =>
            Array.from(content.matchAll(CLASS_SELECTOR)).some(([, name]) => usedClasses.has(name))
        )
        .map(({ href }) => href)
}

export default selectStylesheets
