import { describe, expect, it } from "vitest"
import selectStylesheets from "@scripts/prerender/selectStylesheets"

const MAIN = { href: "/assets/index-1.css", content: "._layout_a1b2c_1{display:flex}" }
const NOT_FOUND = { href: "/assets/NotFound-2.css", content: "._page_d3e4f_1{flex:1}" }
const HOME = { href: "/assets/Home-3.css", content: "._hero_g5h6i_1{padding:0}" }
const CANDIDATES = [MAIN, HOME, NOT_FOUND]

describe("selectStylesheets", () => {
    it("escolhe só o CSS cujas classes aparecem no HTML da rota", () => {
        const html = '<div class="_layout_a1b2c_1"><main class="_page_d3e4f_1 other"></main></div>'

        expect(selectStylesheets(html, CANDIDATES, [MAIN.href])).toEqual([NOT_FOUND.href])
    })

    it("não repete o CSS que o index.html já linka", () => {
        const html = '<div class="_layout_a1b2c_1"></div>'

        expect(selectStylesheets(html, CANDIDATES, [MAIN.href])).toEqual([])
    })

    it("devolve vários arquivos na ordem recebida", () => {
        const html = '<p class="_hero_g5h6i_1"></p><p class="_page_d3e4f_1"></p>'

        expect(selectStylesheets(html, CANDIDATES, [MAIN.href])).toEqual([
            HOME.href,
            NOT_FOUND.href
        ])
    })

    it("não confunde nome de classe com texto fora do atributo class", () => {
        const html = "<p>_page_d3e4f_1</p>"

        expect(selectStylesheets(html, CANDIDATES, [MAIN.href])).toEqual([])
    })
})
