import { afterEach, describe, expect, it, vi } from "vitest"
import getAppVersion from "@/utils/getAppVersion"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("getAppVersion", () => {
    it("devolve a versão semântica definida no build", () => {
        expect(getAppVersion()).toMatch(/^\d+\.\d+\.\d+/)
    })

    it("permite fixar a versão com stub global", () => {
        vi.stubGlobal("__APP_VERSION__", "9.9.9")

        expect(getAppVersion()).toBe("9.9.9")
    })
})
