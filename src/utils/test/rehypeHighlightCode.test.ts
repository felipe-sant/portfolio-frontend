import { describe, expect, it } from "vitest"
import type { Element, Root, RootContent } from "hast"
import rehypeHighlightCode from "@/utils/rehypeHighlightCode"

function buildTree(className: string[] | undefined, text: string, wrapper = "pre"): Root {
    const code: Element = {
        type: "element",
        tagName: "code",
        properties: className ? { className } : {},
        children: [{ type: "text", value: text }]
    }

    return {
        type: "root",
        children: [{ type: "element", tagName: wrapper, properties: {}, children: [code] }]
    }
}

function codeOf(tree: Root): Element {
    const wrapper = tree.children[0]

    if (wrapper.type !== "element" || wrapper.children[0].type !== "element") {
        throw new Error("Árvore inesperada")
    }

    return wrapper.children[0]
}

function classesOf(node: RootContent): string[] {
    return node.type === "element" && Array.isArray(node.properties.className)
        ? node.properties.className.map(String)
        : []
}

function tokenClasses(code: Element): string[] {
    return code.children.flatMap(classesOf)
}

function highlight(tree: Root) {
    rehypeHighlightCode()(tree)

    return codeOf(tree)
}

describe("rehypeHighlightCode", () => {
    it("realça a linguagem do bloco e põe hljs à frente das classes", () => {
        const code = highlight(buildTree(["language-typescript"], "const valor = 1"))

        expect(classesOf(code)).toEqual(["hljs", "language-typescript"])
        expect(tokenClasses(code)).toContain("hljs-keyword")
    })

    it.each([
        ["ts", "const valor = 1", "hljs-keyword"],
        ["js", "const valor = 1", "hljs-keyword"],
        ["tsx", "const valor = 1", "hljs-keyword"],
        ["sh", "echo $HOME", "hljs-variable"],
        ["py", "def soma(a): return a", "hljs-keyword"],
        ["env", "CHAVE=valor", "hljs-attr"],
        ["json", '{"a": 1}', "hljs-attr"],
        ["java", "public class A {}", "hljs-keyword"]
    ])("realça o apelido ou a linguagem %s", (language, source, token) => {
        const code = highlight(buildTree([`language-${language}`], source))

        expect(tokenClasses(code)).toContain(token)
    })

    it("deixa sem mudança o bloco sem linguagem", () => {
        const tree = buildTree(undefined, "texto qualquer")

        const code = highlight(tree)

        expect(classesOf(code)).toEqual([])
        expect(code.children).toEqual([{ type: "text", value: "texto qualquer" }])
    })

    it("deixa mermaid como texto puro", () => {
        const code = highlight(buildTree(["language-mermaid"], "graph TD"))

        expect(classesOf(code)).toEqual(["language-mermaid"])
        expect(code.children).toEqual([{ type: "text", value: "graph TD" }])
    })

    it("deixa sem realce, sem erro, uma linguagem fora do registro", () => {
        const code = highlight(buildTree(["language-rust"], "fn main() {}"))

        expect(code.children).toEqual([{ type: "text", value: "fn main() {}" }])
        expect(classesOf(code)).toEqual(["hljs", "language-rust"])
    })

    it("não mexe em código em linha, fora de pre", () => {
        const tree = buildTree(["language-bash"], "echo oi", "p")

        const code = highlight(tree)

        expect(classesOf(code)).toEqual(["language-bash"])
        expect(code.children).toEqual([{ type: "text", value: "echo oi" }])
    })

    it("junta os textos filhos antes de realçar", () => {
        const tree = buildTree(["language-bash"], "echo ")
        const code = codeOf(tree)
        code.children.push({ type: "text", value: "oi" })

        highlight(tree)

        expect(JSON.stringify(code.children)).toContain("echo")
        expect(JSON.stringify(code.children)).toContain("oi")
    })

    it("lê o texto de elementos filhos e ignora nós que não são texto nem elemento", () => {
        const tree = buildTree(["language-bash"], "echo ")
        const code = codeOf(tree)
        code.children.push(
            {
                type: "element",
                tagName: "span",
                properties: {},
                children: [{ type: "text", value: "oi" }]
            },
            { type: "comment", value: "ignorado" }
        )

        highlight(tree)

        const text = JSON.stringify(code.children)
        expect(text).toContain("echo")
        expect(text).toContain("oi")
        expect(text).not.toContain("ignorado")
    })
})
