import type { Element, Root, RootContent } from "hast"
import parseCodeFenceTitle from "@/utils/parseCodeFenceTitle"
import resolveCodeLanguage from "@/utils/resolveCodeLanguage"

const LANGUAGE_PREFIX = "language-"

function collectBlocks(nodes: RootContent[], blocks: Element[]) {
    for (const node of nodes) {
        if (node.type !== "element") {
            continue
        }

        if (node.tagName === "pre") {
            blocks.push(node)
        }

        collectBlocks(node.children, blocks)
    }
}

function getBlockName(block: Element) {
    const code = block.children[0]

    if (code?.type !== "element") {
        return ""
    }

    const classNames = code.properties.className
    const languageName = Array.isArray(classNames)
        ? classNames
              .map(String)
              .find((name) => name.startsWith(LANGUAGE_PREFIX))
              ?.slice(LANGUAGE_PREFIX.length)
        : undefined
    const language = resolveCodeLanguage(languageName) ?? languageName ?? ""
    const file = parseCodeFenceTitle(code.data?.meta) ?? ""

    return `${file}\n${language}`
}

function rehypeNumberCodeBlocks() {
    return (tree: Root) => {
        const blocks: Element[] = []
        collectBlocks(tree.children, blocks)
        const names = blocks.map(getBlockName)
        const seen = new Map<string, number>()

        blocks.forEach((block, position) => {
            const name = names[position]
            const count = (seen.get(name) ?? 0) + 1
            seen.set(name, count)

            if (names.filter((other) => other === name).length > 1) {
                block.properties.dataCodeBlockIndex = count
            }
        })
    }
}

export default rehypeNumberCodeBlocks
