import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import Flag from "@/components/Flag"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

describe("Flag", () => {
    it.each(SUPPORTED_LANGUAGES)(
        "desenha a bandeira de %s oculta para leitor de tela",
        (language) => {
            const { container } = render(<Flag language={language} />)
            const svg = container.querySelector("svg")

            expect(svg).toHaveAttribute("aria-hidden", "true")
            expect(svg?.childElementCount).toBeGreaterThan(0)
        }
    )
})
