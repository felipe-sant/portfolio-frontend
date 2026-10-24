import { afterEach, describe, expect, it } from "vitest"
import removePrerenderedHead from "@/utils/removePrerenderedHead"

afterEach(() => {
    document.head.innerHTML = ""
})

describe("removePrerenderedHead", () => {
    it("remove o title, a meta description e a meta robots do head", () => {
        document.head.innerHTML =
            '<title>A</title><meta name="description" content="B" /><meta name="robots" content="noindex" /><title>C</title>'

        removePrerenderedHead(document.head)

        expect(document.head.querySelector("title")).toBeNull()
        expect(document.head.querySelector("meta[name='description']")).toBeNull()
        expect(document.head.querySelector("meta[name='robots']")).toBeNull()
    })

    it("preserva as demais tags", () => {
        document.head.innerHTML =
            '<title>A</title><meta name="theme-color" content="#fff" /><link rel="icon" href="/f.svg" />'

        removePrerenderedHead(document.head)

        expect(document.head.querySelector("meta[name='theme-color']")).not.toBeNull()
        expect(document.head.querySelector("link[rel='icon']")).not.toBeNull()
    })
})
