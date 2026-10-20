import { describe, expect, it } from "vitest"
import getActiveNavItem from "@/utils/getActiveNavItem"

describe("getActiveNavItem", () => {
    it("ativa Início só na raiz", () => {
        expect(getActiveNavItem("/")).toBe("home")
    })

    it.each(["/projects", "/projects/abc", "/projects/abc/docs/x"])(
        "ativa Projetos em %s",
        (pathname) => {
            expect(getActiveNavItem(pathname)).toBe("projects")
        }
    )

    it("ativa Informações e Contato", () => {
        expect(getActiveNavItem("/about")).toBe("about")
        expect(getActiveNavItem("/contact")).toBe("contact")
    })

    it("não ativa nada em caminho desconhecido", () => {
        expect(getActiveNavItem("/unknown")).toBeUndefined()
        expect(getActiveNavItem("/projectsx")).toBeUndefined()
    })
})
