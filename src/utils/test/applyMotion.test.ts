import { afterEach, describe, expect, it } from "vitest"
import applyMotion from "@/utils/applyMotion"

afterEach(() => {
    document.documentElement.removeAttribute("data-motion")
})

describe("applyMotion", () => {
    it.each([["full"], ["reduced"]] as const)("define data-motion como %s", (motion) => {
        applyMotion(motion)

        expect(document.documentElement).toHaveAttribute("data-motion", motion)
    })
})
