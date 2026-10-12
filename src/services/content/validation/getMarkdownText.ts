import type { Nodes } from "mdast"

function getMarkdownText(node: Nodes): string {
    if ("children" in node) {
        return node.children.map(getMarkdownText).join("")
    }

    return "value" in node && typeof node.value === "string" ? node.value : ""
}

export default getMarkdownText
