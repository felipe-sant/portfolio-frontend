import type { Nodes } from "mdast"

function walkMarkdown(node: Nodes, visit: (current: Nodes) => void): void {
    visit(node)

    if ("children" in node) {
        for (const child of node.children) {
            walkMarkdown(child, visit)
        }
    }
}

export default walkMarkdown
