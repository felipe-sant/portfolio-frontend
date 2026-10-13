import { afterEach, beforeEach, describe, expect, it } from "vitest"
import applyTheme from "@/utils/applyTheme"

beforeEach(() => {
    document.head.innerHTML = `
        <meta name="theme-color" content="#fbf9f5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#191919" media="(prefers-color-scheme: dark)" />
    `
})

afterEach(() => {
    document.head.innerHTML = ""
    document.documentElement.removeAttribute("data-theme")
})

function readThemeColors() {
    return [...document.querySelectorAll('meta[name="theme-color"]')].map((meta) => ({
        content: meta.getAttribute("content"),
        media: meta.getAttribute("media")
    }))
}

describe("applyTheme", () => {
    it("define data-theme e theme-color no tema escuro", () => {
        applyTheme("dark")

        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
        expect(readThemeColors()).toEqual([
            { content: "#141210", media: null },
            { content: "#141210", media: null }
        ])
    })

    it("define data-theme e theme-color no tema claro", () => {
        applyTheme("light")

        expect(document.documentElement).toHaveAttribute("data-theme", "light")
        expect(readThemeColors()).toEqual([
            { content: "#fbf9f5", media: null },
            { content: "#fbf9f5", media: null }
        ])
    })
})
