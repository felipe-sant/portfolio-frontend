import type { Root, RootContent } from "hast"

function numberTables(nodes: RootContent[], counter: { value: number }) {
    for (const node of nodes) {
        if (node.type !== "element") {
            continue
        }

        if (node.tagName === "table") {
            counter.value += 1
            node.properties.dataTableIndex = counter.value
        }

        numberTables(node.children, counter)
    }
}

function rehypeNumberTables() {
    return (tree: Root) => {
        numberTables(tree.children, { value: 0 })
    }
}

export default rehypeNumberTables
