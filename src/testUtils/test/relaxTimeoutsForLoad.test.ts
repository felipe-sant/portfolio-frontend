import { describe, expect, it } from "vitest"
import { getConfig } from "@testing-library/react"
import relaxTimeoutsForLoad from "@/testUtils/relaxTimeoutsForLoad"

describe("relaxTimeoutsForLoad", () => {
    it("amplia o tempo das esperas assíncronas do Testing Library para 5000ms", () => {
        relaxTimeoutsForLoad()

        expect(getConfig().asyncUtilTimeout).toBe(5000)
    })
})
