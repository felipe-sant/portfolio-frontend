import { describe, expect, it } from "vitest"
import projectCaptureCrops from "@scripts/projectCaptureCrops"

const SOURCE_WIDTH = 1600
const SOURCE_HEIGHT = 900
const TOLERANCE = 0.01

describe("projectCaptureCrops", () => {
    it("cobre as cinco capturas, sem id repetido", () => {
        const ids = projectCaptureCrops().map((crop) => crop.id)

        expect(ids).toHaveLength(5)
        expect(new Set(ids).size).toBe(5)
    })

    it.each(projectCaptureCrops())(
        "a região de $id é 16:9, cabe em 1600x900 e tem largura múltipla de 16",
        ({ region }) => {
            expect(Math.abs(region.width / region.height - 16 / 9)).toBeLessThan(
                (16 / 9) * TOLERANCE
            )
            expect(region.x).toBeGreaterThanOrEqual(0)
            expect(region.y).toBeGreaterThanOrEqual(0)
            expect(region.x + region.width).toBeLessThanOrEqual(SOURCE_WIDTH)
            expect(region.y + region.height).toBeLessThanOrEqual(SOURCE_HEIGHT)
            expect(region.width % 16).toBe(0)
        }
    )

    it.each(projectCaptureCrops())(
        "large de $id tem a largura da região, no máximo 1600, e small é 640x360",
        ({ region, large, small }) => {
            expect(large.width).toBe(Math.min(region.width, SOURCE_WIDTH))
            expect(large.height).toBe(Math.round((large.width * 9) / 16))
            expect(small).toEqual({ width: 640, height: 360 })
        }
    )

    it("devolve cópias: alterar o resultado não muda a tabela", () => {
        const [first] = projectCaptureCrops()
        first.region.x = 999

        expect(projectCaptureCrops()[0].region.x).not.toBe(999)
    })
})
