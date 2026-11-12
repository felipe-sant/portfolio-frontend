import { describe, expect, it } from "vitest"
import isLicenseDocument from "@/utils/isLicenseDocument"

describe("isLicenseDocument", () => {
    it.each(["LICENSES", "NOTICE", "README.md", "SETUP.md", "MYLICENSE.md", ""])(
        "devolve false para %j",
        (name) => {
            expect(isLicenseDocument(name)).toBe(false)
        }
    )

    it.each(["LICENSE", "license", "License.md", "LICENSE.txt"])(
        "devolve true para %j, sem diferenciar maiúsculas e sem extensão",
        (name) => {
            expect(isLicenseDocument(name)).toBe(true)
        }
    )
})
