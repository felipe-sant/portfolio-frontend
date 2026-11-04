import { describe, expect, it } from "vitest"
import formatLocation from "@/utils/formatLocation"

describe("formatLocation", () => {
    it("junta cidade e região com o separador de metadados", () => {
        expect(formatLocation({ city: "São José dos Campos", region: "SP" })).toBe(
            "São José dos Campos · SP"
        )
    })
})
