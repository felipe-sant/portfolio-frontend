import { describe, expect, it } from "vitest"
import serializeJsonLd from "@/utils/serializeJsonLd"

describe("serializeJsonLd", () => {
    it("escapa o sinal de menor e preserva o texto original", () => {
        const serialized = serializeJsonLd({ name: "</script><b>" })

        expect(serialized).not.toContain("<")
        expect(JSON.parse(serialized)).toEqual({ name: "</script><b>" })
    })

    it("mantém & e aspas válidos no JSON", () => {
        const serialized = serializeJsonLd({ name: 'R&D "x"' })

        expect(JSON.parse(serialized)).toEqual({ name: 'R&D "x"' })
    })

    it("serializa estruturas aninhadas", () => {
        const value = { "@type": "Person", sameAs: ["https://a.b"], address: { city: "X" } }

        expect(JSON.parse(serializeJsonLd(value))).toEqual(value)
    })
})
