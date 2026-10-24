import { afterEach, describe, expect, it, vi } from "vitest"
import getBuildYear from "@/utils/getBuildYear"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("getBuildYear", () => {
    it("devolve o ano atual definido no build", () => {
        expect(getBuildYear()).toBe(new Date().getFullYear())
    })

    it("permite fixar o ano com stub global", () => {
        vi.stubGlobal("__BUILD_YEAR__", 2030)

        expect(getBuildYear()).toBe(2030)
    })
})
