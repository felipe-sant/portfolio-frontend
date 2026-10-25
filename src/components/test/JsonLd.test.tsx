import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import JsonLd from "@/components/JsonLd"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("JsonLd", () => {
    it("renderiza o script com o conteúdo escapado", () => {
        const { container } = render(
            <JsonLd data={{ "@type": "WebSite", name: "</script><b>x</b>" }} />
        )
        const script = container.querySelector('script[type="application/ld+json"]')

        expect(script).not.toBeNull()
        expect(script?.innerHTML).not.toContain("<")
        expect(JSON.parse(script?.textContent ?? "")).toEqual({
            "@type": "WebSite",
            name: "</script><b>x</b>"
        })
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<JsonLd data={{ "@type": "WebSite" }} />)

        await expectNoAxeViolations(container)
    }, 15000)
})
