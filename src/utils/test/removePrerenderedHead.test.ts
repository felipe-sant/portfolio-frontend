import { afterEach, describe, expect, it } from "vitest"
import removePrerenderedHead from "@/utils/removePrerenderedHead"

afterEach(() => {
    document.head.innerHTML = ""
})

describe("removePrerenderedHead", () => {
    it("remove o title e a meta description do head", () => {
        document.head.innerHTML =
            '<title>A</title><meta name="description" content="B" /><title>C</title>'

        removePrerenderedHead(document.head)

        expect(document.head.querySelector("title")).toBeNull()
        expect(document.head.querySelector("meta[name='description']")).toBeNull()
    })

    it("preserva as demais tags", () => {
        document.head.innerHTML =
            '<title>A</title><meta name="theme-color" content="#fff" /><link rel="icon" href="/f.svg" />'

        removePrerenderedHead(document.head)

        expect(document.head.querySelector("meta[name='theme-color']")).not.toBeNull()
        expect(document.head.querySelector("link[rel='icon']")).not.toBeNull()
    })
})
