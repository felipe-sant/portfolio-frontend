import { describe, expect, it } from "vitest"
import reloadPage from "@/utils/reloadPage"

describe("reloadPage", () => {
    it("pede o recarregamento da página atual ao navegador", () => {
        expect(() => reloadPage()).not.toThrow()
    })
})
