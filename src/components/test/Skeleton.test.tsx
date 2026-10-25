import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Skeleton from "@/components/Skeleton"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Skeleton", () => {
    it("é oculto da tecnologia assistiva e não anuncia por padrão", async () => {
        const { container } = render(<Skeleton />)

        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
        expect(screen.queryByRole("status")).not.toBeInTheDocument()

        await expectNoAxeViolations(container)
    }, 15000)

    it.each(["line", "title", "media", "photo", "card"] as const)(
        "renderiza a forma %s",
        (shape) => {
            const { container } = render(<Skeleton shape={shape} width="short" />)

            expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
        }
    )

    it("anuncia o carregamento uma vez com announce", async () => {
        const { container } = render(<Skeleton announce />)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")

        await expectNoAxeViolations(container)
    }, 15000)

    it("traduz o status quando o idioma muda", async () => {
        await setLanguage("en")

        render(<Skeleton announce />)

        expect(screen.getByRole("status")).toHaveTextContent("Loading...")
    })
})
