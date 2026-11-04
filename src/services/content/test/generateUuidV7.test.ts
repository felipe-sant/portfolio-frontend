import { afterEach, describe, expect, it, vi } from "vitest"
import generateUuidV7 from "@/services/content/generateUuidV7"
import isUuidV7 from "@/utils/isUuidV7"

afterEach(() => {
    vi.useRealTimers()
})

describe("generateUuidV7", () => {
    it("gera um UUID v7 canônico aceito por isUuidV7", () => {
        const id = generateUuidV7()

        expect(isUuidV7(id)).toBe(true)
        expect(id[14]).toBe("7")
        expect("89ab").toContain(id[19])
    })

    it("grava o timestamp em milissegundos nos 48 bits altos", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-10-12T12:00:00.000Z"))

        const id = generateUuidV7()
        const timestamp = parseInt(id.replace(/-/g, "").slice(0, 12), 16)

        expect(timestamp).toBe(new Date("2026-10-12T12:00:00.000Z").getTime())
    })

    it("gera ids em ordem crescente quando o tempo avança", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-10-12T12:00:00.000Z"))
        const ids: string[] = []

        for (let index = 0; index < 5; index += 1) {
            ids.push(generateUuidV7())
            vi.advanceTimersByTime(5)
        }

        expect(ids.toSorted()).toEqual(ids)
    })

    it("não repete ids em mil gerações", () => {
        const ids = new Set(Array.from({ length: 1000 }, () => generateUuidV7()))

        expect(ids.size).toBe(1000)
    })
})
