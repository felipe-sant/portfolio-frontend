import { afterEach, describe, expect, it, vi } from "vitest"
import formatMonthYear from "@/utils/formatMonthYear"

describe("formatMonthYear", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it.each(["", "2026-13-01", "2026-7-1", "hoje", "2026-07", "2026-07-19T10:00:00Z"])(
        "devolve undefined para %j",
        (value) => {
            expect(formatMonthYear(value)).toBeUndefined()
        }
    )

    it("devolve mês e ano em MM/AAAA", () => {
        expect(formatMonthYear("2026-07-19")).toBe("07/2026")
        expect(formatMonthYear("2026-01-01")).toBe("01/2026")
    })

    it("não depende do fuso horário", () => {
        vi.stubEnv("TZ", "America/Sao_Paulo")

        expect(formatMonthYear("2026-01-01")).toBe("01/2026")
    })
})
