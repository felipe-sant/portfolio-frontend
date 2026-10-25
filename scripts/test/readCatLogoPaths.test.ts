import { join } from "node:path"
import { describe, expect, it } from "vitest"
import readCatLogoPaths from "@scripts/readCatLogoPaths"

const CAT_LOGO = join(process.cwd(), "src", "components", "CatLogo.tsx")

describe("readCatLogoPaths", () => {
    it("extrai os quatro paths do gato sem duplicação", () => {
        const paths = readCatLogoPaths(CAT_LOGO)

        expect(paths).toHaveLength(4)
        expect(new Set(paths.map((path) => path.d)).size).toBe(4)
    })

    it("separa o corpo do detalhe", () => {
        const paths = readCatLogoPaths(CAT_LOGO)

        expect(paths.filter((path) => path.role === "body")).toHaveLength(3)
        expect(paths.filter((path) => path.role === "detail")).toHaveLength(1)
    })

    it("devolve só o desenho, sem aspas nem marcação", () => {
        const [first] = readCatLogoPaths(CAT_LOGO)

        expect(first.d).toMatch(/^M[\d. ACLZ-]+$/)
    })
})
