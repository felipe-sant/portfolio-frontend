import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import validateId from "@/services/content/validateId"

describe("validateId", () => {
    it("aceita UUID v7", () => {
        expect(() => validateId("0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50")).not.toThrow()
    })

    it.each(["maps", "", "550e8400-e29b-41d4-a716-446655440000"])(
        "rejeita %s com 400 INVALID_ID",
        (id) => {
            try {
                validateId(id)
                expect.unreachable()
            } catch (error) {
                expect(error).toBeInstanceOf(ContentException)
                expect(
                    error instanceof ContentException && error.contentError.data.error.code
                ).toBe("INVALID_ID")
            }
        }
    )
})
