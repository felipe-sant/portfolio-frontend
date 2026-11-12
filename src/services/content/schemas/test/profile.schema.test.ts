import { describe, expect, it } from "vitest"
import profileSchema from "@/services/content/schemas/profile.schema"
import buildProfile from "@/testUtils/buildProfile"

describe("profileSchema", () => {
    it("rejeita updatedAt fora do formato AAAA-MM-DD", () => {
        const result = profileSchema.safeParse(buildProfile({ updatedAt: "11/11/2026" }))

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["updatedAt"])
    })

    it("rejeita countryCode fora de duas letras maiúsculas", () => {
        const profile = buildProfile({
            location: { city: "A", region: "B", countryCode: "br" }
        })

        const result = profileSchema.safeParse(profile)

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["location", "countryCode"])
    })

    it("rejeita e-mail inválido", () => {
        const result = profileSchema.safeParse(buildProfile({ contact: { email: "sem-arroba" } }))

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["contact", "email"])
    })

    it("rejeita availability.isAvailable como texto", () => {
        const result = profileSchema.safeParse({
            ...buildProfile(),
            availability: { isAvailable: "true", label: "Disponível" }
        })

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["availability", "isAvailable"])
    })

    it("rejeita categoria de stack fora de STACK_CATEGORIES", () => {
        const result = profileSchema.safeParse({
            ...buildProfile(),
            stack: [{ category: "design", items: [{ name: "Figma" }] }]
        })

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["stack", 0, "category"])
    })

    it("rejeita campo obrigatório ausente", () => {
        const withoutRole = Object.fromEntries(
            Object.entries(buildProfile()).filter(([key]) => key !== "role")
        )

        const result = profileSchema.safeParse(withoutRole)

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["role"])
    })

    it("aceita a fixture válida e devolve dado igual a ela", () => {
        const profile = buildProfile()

        const result = profileSchema.safeParse(profile)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(profile)
    })

    it("aceita foto responsiva e campos opcionais", () => {
        const profile = buildProfile({
            photo: {
                large: { src: "images/profile/photo-large.webp", width: 800, height: 800 },
                small: { src: "images/profile/photo-small.webp", width: 400, height: 400 }
            },
            contact: { email: "contato@example.com", responseTime: { label: "1 dia" } }
        })

        expect(profileSchema.safeParse(profile).data).toEqual(profile)
    })

    it("aceita chave desconhecida e a remove do resultado", () => {
        const result = profileSchema.safeParse({ ...buildProfile(), extra: 1 })

        expect(result.success).toBe(true)
        expect(result.data).toEqual(buildProfile())
    })
})
