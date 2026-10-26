import { describe, expect, it } from "vitest"
import type { Element, Root } from "hast"
import rehypeNumberCodeBlocks from "@/utils/rehypeNumberCodeBlocks"

function block(language: string | undefined, meta?: string): Element {
    const code: Element = {
        type: "element",
        tagName: "code",
        properties: language ? { className: [`language-${language}`] } : {},
        data: meta ? { meta } : undefined,
        children: [{ type: "text", value: "x" }]
    }

    return { type: "element", tagName: "pre", properties: {}, children: [code] }
}

function run(blocks: Element[]) {
    const tree: Root = { type: "root", children: blocks }
    rehypeNumberCodeBlocks()(tree)

    return blocks.map((item) => item.properties.dataCodeBlockIndex)
}

describe("rehypeNumberCodeBlocks", () => {
    it("não numera blocos com nomes diferentes", () => {
        expect(run([block("bash"), block("ts"), block(undefined)])).toEqual([
            undefined,
            undefined,
            undefined
        ])
    })

    it("numera em ordem os blocos da mesma linguagem", () => {
        expect(run([block("bash"), block("ts"), block("bash"), block("bash")])).toEqual([
            1,
            undefined,
            2,
            3
        ])
    })

    it("trata apelido e nome da linguagem como o mesmo nome", () => {
        expect(run([block("sh"), block("bash")])).toEqual([1, 2])
    })

    it("numera blocos sem linguagem nem arquivo", () => {
        expect(run([block(undefined), block(undefined)])).toEqual([1, 2])
    })

    it("separa blocos da mesma linguagem por arquivo", () => {
        expect(
            run([
                block("ts", 'title="a.ts"'),
                block("ts", 'title="b.ts"'),
                block("ts", 'title="a.ts"')
            ])
        ).toEqual([1, undefined, 2])
    })

    it("numera blocos aninhados fora de pre ou dentro de outros elementos", () => {
        const first = block("bash")
        const second = block("bash")
        const wrapper: Element = {
            type: "element",
            tagName: "li",
            properties: {},
            children: [second]
        }
        const tree: Root = { type: "root", children: [first, wrapper] }
        rehypeNumberCodeBlocks()(tree)

        expect([first, second].map((item) => item.properties.dataCodeBlockIndex)).toEqual([1, 2])
    })
})
