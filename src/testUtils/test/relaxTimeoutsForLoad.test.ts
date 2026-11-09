import { describe, expect, it, vi } from "vitest"
import { getConfig } from "@testing-library/react"
import relaxTimeoutsForLoad from "@/testUtils/relaxTimeoutsForLoad"

describe("relaxTimeoutsForLoad", () => {
    it("amplia o tempo das esperas assíncronas do Testing Library para 5000ms", () => {
        relaxTimeoutsForLoad()

        expect(getConfig().asyncUtilTimeout).toBe(5000)
    })

    it("amplia o tempo limite de cada teste para 30000ms", () => {
        const setConfig = vi.spyOn(vi, "setConfig")

        relaxTimeoutsForLoad()

        expect(setConfig).toHaveBeenCalledWith({ testTimeout: 30000 })
        setConfig.mockRestore()
    })
})
