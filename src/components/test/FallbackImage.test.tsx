import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import FallbackImage from "@/components/FallbackImage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderImage(decorative = false, placeholderClassName?: string) {
    return render(
        <FallbackImage
            alt={"Tela inicial do projeto"}
            src={"/images/a-large.webp"}
            srcSet={"/images/a-small.webp 640w, /images/a-large.webp 1600w"}
            sizes={"100vw"}
            width={1600}
            height={900}
            loading={"lazy"}
            decoding={"async"}
            fetchPriority={"high"}
            decorative={decorative}
            className={"card"}
            placeholderClassName={placeholderClassName}
        />
    )
}

describe("FallbackImage", () => {
    it("renderiza a imagem repassando os atributos recebidos", () => {
        renderImage()
        const image = screen.getByRole("img", { name: "Tela inicial do projeto" })

        expect(image.tagName).toBe("IMG")
        expect(image).toHaveAttribute("src", "/images/a-large.webp")
        expect(image).toHaveAttribute(
            "srcset",
            "/images/a-small.webp 640w, /images/a-large.webp 1600w"
        )
        expect(image).toHaveAttribute("sizes", "100vw")
        expect(image).toHaveAttribute("width", "1600")
        expect(image).toHaveAttribute("height", "900")
        expect(image).toHaveAttribute("loading", "lazy")
        expect(image).toHaveAttribute("decoding", "async")
        expect(image).toHaveAttribute("fetchpriority", "high")
    })

    it("troca a imagem por um placeholder com role img e o alt como nome ao falhar", () => {
        const { container } = renderImage()

        fireEvent.error(screen.getByRole("img"))

        const placeholder = screen.getByRole("img", { name: "Tela inicial do projeto" })
        expect(placeholder.tagName).toBe("DIV")
        expect(container.querySelector("img")).not.toBeInTheDocument()
        expect(placeholder).toBeEmptyDOMElement()
    })

    it("com decorative, o placeholder da falha fica aria-hidden e sem role", () => {
        const { container } = renderImage(true)

        fireEvent.error(screen.getByRole("img"))

        const placeholder = container.firstElementChild
        expect(placeholder).toBeInTheDocument()
        expect(placeholder).toHaveAttribute("aria-hidden", "true")
        expect(placeholder).not.toHaveAttribute("role")
        expect(placeholder).not.toHaveAttribute("aria-label")
    })

    it("aplica placeholderClassName só ao placeholder, junto da className, e não à imagem", () => {
        const { container } = renderImage(false, "extra")
        const image = screen.getByRole("img")

        expect(image).toHaveClass("card")
        expect(image).not.toHaveClass("extra")

        fireEvent.error(image)

        const placeholder = screen.getByRole("img", { name: "Tela inicial do projeto" })
        expect(placeholder).toHaveClass("card", "extra")
        expect(container.querySelector("img")).not.toBeInTheDocument()
    })

    it("sem placeholderClassName, o placeholder mantém só a className e a classe própria", () => {
        renderImage()

        fireEvent.error(screen.getByRole("img"))

        const placeholder = screen.getByRole("img", { name: "Tela inicial do projeto" })
        expect(placeholder).toHaveClass("card")
        expect(placeholder.classList).toHaveLength(2)
        expect(placeholder).not.toHaveClass("undefined")
    })

    it("não tem violações de acessibilidade com a imagem nem com o placeholder", async () => {
        const { container } = renderImage()
        await expectNoAxeViolations(container)

        fireEvent.error(screen.getByRole("img"))

        await expectNoAxeViolations(container)
    }, 15000)
})
