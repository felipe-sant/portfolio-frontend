import { describe, expect, it } from "vitest"
import profilePhotoTargets from "@scripts/profilePhotoTargets"

describe("profilePhotoTargets", () => {
    it("devolve 362 para large e 320 para small, com os nomes dos arquivos", () => {
        expect(profilePhotoTargets()).toEqual([
            { file: "photo-large.webp", size: 362 },
            { file: "photo-small.webp", size: 320 }
        ])
    })
})
