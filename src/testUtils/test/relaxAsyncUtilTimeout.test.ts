import { describe, expect, it } from "vitest"
import { getConfig } from "@testing-library/react"
import relaxAsyncUtilTimeout from "@/testUtils/relaxAsyncUtilTimeout"

describe("relaxAsyncUtilTimeout", () => {
    it("amplia o tempo das esperas assíncronas do Testing Library para 5000ms", () => {
        relaxAsyncUtilTimeout()

        expect(getConfig().asyncUtilTimeout).toBe(5000)
    })
})
