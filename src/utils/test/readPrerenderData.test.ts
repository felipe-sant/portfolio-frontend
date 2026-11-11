import { afterEach, describe, expect, it } from "vitest"
import readPrerenderData from "@/utils/readPrerenderData"

function appendBlock(content: string) {
    const block = document.createElement("script")
    block.type = "application/json"
    block.id = "prerender-data"
    block.textContent = content
    document.body.appendChild(block)
}

afterEach(() => {
    document.getElementById("prerender-data")?.remove()
})

describe("readPrerenderData", () => {
    it("devolve undefined quando o documento não tem o bloco", () => {
        expect(readPrerenderData(document)).toBeUndefined()
    })

    it("devolve undefined quando o bloco está vazio", () => {
        appendBlock("")

        expect(readPrerenderData(document)).toBeUndefined()
    })

    it("devolve o caminho, o estado e os dados do roteador gravados no bloco", () => {
        const data = {
            path: "/pt-BR/projects",
            state: { api: { queries: {} } },
            routerData: { loaderData: { root: null } }
        }
        appendBlock(JSON.stringify(data))

        expect(readPrerenderData(document)).toEqual(data)
    })

    it("devolve undefined quando o bloco não é JSON válido", () => {
        appendBlock("{path:")

        expect(readPrerenderData(document)).toBeUndefined()
    })

    it.each([
        ["sem path", { state: {}, routerData: {} }],
        ["com path que não é texto", { path: 1, state: {}, routerData: {} }],
        ["sem state", { path: "/en", routerData: {} }],
        ["com state nulo", { path: "/en", state: null, routerData: {} }],
        ["sem routerData", { path: "/en", state: {} }],
        ["com routerData que não é objeto", { path: "/en", state: {}, routerData: "x" }]
    ])("devolve undefined quando o bloco tem forma errada (%s)", (_name, value) => {
        appendBlock(JSON.stringify(value))

        expect(readPrerenderData(document)).toBeUndefined()
    })

    it("devolve undefined quando o bloco é um valor que não é objeto", () => {
        appendBlock("null")

        expect(readPrerenderData(document)).toBeUndefined()
    })
})
