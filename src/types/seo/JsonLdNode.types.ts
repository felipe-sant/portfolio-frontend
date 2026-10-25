type JsonLdValue = string | number | boolean | null | JsonLdNode | JsonLdValue[]

interface JsonLdNode {
    [key: string]: JsonLdValue | undefined
}

export default JsonLdNode
