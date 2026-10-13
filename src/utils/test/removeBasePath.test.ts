import { afterEach, describe, expect, it, vi } from "vitest"

async function loadRemoveBasePath(base: string) {
    vi.stubEnv("BASE_URL", base)
    vi.resetModules()
    const { default: removeBasePath } = await import("@/utils/removeBasePath")
    return removeBasePath
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("removeBasePath", () => {
    it("é identidade quando a base é /", async () => {
        const removeBasePath = await loadRemoveBasePath("/")

        expect(removeBasePath("/en/projects")).toBe("/en/projects")
        expect(removeBasePath("/")).toBe("/")
    })

    it("remove a base do GitHub Pages", async () => {
        const removeBasePath = await loadRemoveBasePath("/ra2581392423047/")

        expect(removeBasePath("/ra2581392423047/en/projects")).toBe("/en/projects")
        expect(removeBasePath("/ra2581392423047/en")).toBe("/en")
    })

    it("devolve / para a raiz da base, com ou sem barra final", async () => {
        const removeBasePath = await loadRemoveBasePath("/ra2581392423047/")

        expect(removeBasePath("/ra2581392423047/")).toBe("/")
        expect(removeBasePath("/ra2581392423047")).toBe("/")
    })

    it("mantém o caminho que não começa pela base", async () => {
        const removeBasePath = await loadRemoveBasePath("/ra2581392423047/")

        expect(removeBasePath("/en/projects")).toBe("/en/projects")
    })
})
