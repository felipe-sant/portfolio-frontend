import { describe, expect, it } from "vitest"
import getProjectsSkeletonCount from "@/utils/getProjectsSkeletonCount"

describe("getProjectsSkeletonCount", () => {
    it.each([
        [20, 9, 9],
        [20, 18, 2],
        [10, 9, 1],
        [9, 9, 0],
        [5, 9, 0]
    ])("com total %i e %i mostrados devolve %i", (total, shown, expected) => {
        expect(getProjectsSkeletonCount(total, shown)).toBe(expected)
    })
})
