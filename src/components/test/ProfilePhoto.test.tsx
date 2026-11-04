import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import ProfilePhoto from "@/components/ProfilePhoto"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ResponsiveImage from "@/types/content/ResponsiveImage.types"

const PHOTO: ResponsiveImage = {
    large: { src: "images/profile/photo-large.webp", width: 362, height: 362 },
    small: { src: "images/profile/photo-small.webp", width: 320, height: 320 }
}

describe("ProfilePhoto", () => {
    it("sem foto renderiza só o placeholder decorativo, sem img nem role img", () => {
        const { container } = render(<ProfilePhoto />)

        expect(container.querySelector("img")).toBeNull()
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
    })

    it.each([
        ["pt-BR", "Foto de Luiz Felipe dos Santos"],
        ["en", "Photo of Luiz Felipe dos Santos"],
        ["es", "Foto de Luiz Felipe dos Santos"]
    ] as const)("com foto, o alt vem da chave em %s", async (language, alt) => {
        await act(() => setLanguage(language))
        render(<ProfilePhoto photo={PHOTO} />)

        expect(screen.getByRole("img", { name: alt })).toBeInTheDocument()
    })

    it("declara dimensões, srcset com larguras reais e sizes, com prioridade alta e sem lazy", () => {
        render(<ProfilePhoto photo={PHOTO} />)
        const image = screen.getByRole("img")

        expect(image).toHaveAttribute("width", "320")
        expect(image).toHaveAttribute("height", "320")
        expect(image).toHaveAttribute(
            "srcset",
            "/images/profile/photo-small.webp 320w, /images/profile/photo-large.webp 362w"
        )
        expect(image).toHaveAttribute(
            "sizes",
            "(min-width: 1000px) 15rem, (min-width: 600px) 24vw, 9rem"
        )
        expect(image).toHaveAttribute("fetchpriority", "high")
        expect(image).not.toHaveAttribute("loading")
    })

    it("monta o src a partir do BASE_URL", () => {
        render(<ProfilePhoto photo={PHOTO} />)

        expect(screen.getByRole("img")).toHaveAttribute("src", "/images/profile/photo-small.webp")
    })

    it("não tem violações de acessibilidade com foto e sem foto", async () => {
        const withPhoto = render(<ProfilePhoto photo={PHOTO} />)
        await expectNoAxeViolations(withPhoto.container)
        const withoutPhoto = render(<ProfilePhoto />)
        await expectNoAxeViolations(withoutPhoto.container)
    }, 15000)
})
