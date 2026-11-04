import { describe, expect, it } from "vitest"
import resolveCodeLanguage from "@/utils/resolveCodeLanguage"

describe("resolveCodeLanguage", () => {
    it.each([
        ["typescript", "typescript"],
        ["tsx", "tsx"],
        ["env", "env"],
        ["ts", "typescript"],
        ["JS", "javascript"],
        ["py", "python"],
        ["sh", "bash"]
    ])("resolve %s para %s", (input, expected) => {
        expect(resolveCodeLanguage(input)).toBe(expected)
    })

    it.each([undefined, "", "mermaid", "toString", "constructor"])(
        "devolve undefined para %j",
        (input) => {
            expect(resolveCodeLanguage(input)).toBeUndefined()
        }
    )
})
