import { describe, expect, it } from "vitest"
import isAllowedMarkdownUrl from "@/utils/isAllowedMarkdownUrl"

describe("isAllowedMarkdownUrl", () => {
    it.each([
        "https://github.com/felipe-sant",
        "http://example.com/a?b=c",
        "mailto:felipe@example.com",
        "project:01a131df-93ee-72f3-8c7a-f67501e47a7a",
        "project:01a131df-93ee-72f3-8c7a-f67501e47a7a/docs/SETUP.md#instalação",
        "#instalação"
    ])("aceita %s", (url) => {
        expect(isAllowedMarkdownUrl(url)).toBe(true)
    })

    it.each([
        "javascript:alert(1)",
        "JavaScript:alert(1)",
        "data:text/html;base64,AAAA",
        "vbscript:msgbox(1)",
        "file:///etc/passwd",
        "//evil.example.com",
        "/projects/abc",
        "docs/SETUP.md",
        "",
        "#",
        "project:",
        "  javascript:alert(1)"
    ])("rejeita %j", (url) => {
        expect(isAllowedMarkdownUrl(url)).toBe(false)
    })
})
