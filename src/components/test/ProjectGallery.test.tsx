import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectGallery from "@/components/ProjectGallery"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectImage from "@/types/project/ProjectImage.types"

let appRoot: HTMLDivElement

function buildImages(count: number, withCaption = true): ProjectImage[] {
    return Array.from({ length: count }, (_value, index) => ({
        large: { src: `/images/p/${index + 1}-large.webp`, width: 1600, height: 900 },
        small: { src: `/images/p/${index + 1}-small.webp`, width: 640, height: 360 },
        alt: `Descrição ${index + 1}`,
        caption: withCaption ? `Legenda ${index + 1}` : undefined
    }))
}

function renderGallery(images: ProjectImage[]) {
    return render(<ProjectGallery images={images} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("ProjectGallery", () => {
    it("sem imagem, mostra só o placeholder aria-hidden, sem role, botão, legenda, contador nem section", () => {
        const { container } = renderGallery([])

        expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument()
        expect(container.querySelector("[role]")).not.toBeInTheDocument()
        expect(screen.queryByRole("region")).not.toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(screen.queryByRole("group")).not.toBeInTheDocument()
        expect(container.querySelector("img")).not.toBeInTheDocument()
    })

    it("com uma imagem, mostra a section Galeria, imagem, ampliar e legenda sem contador nem miniaturas", () => {
        renderGallery(buildImages(1))
        const gallery = screen.getByRole("region", { name: "Galeria" })

        expect(within(gallery).getByRole("img", { name: "Descrição 1" })).toBeInTheDocument()
        expect(within(gallery).getByRole("button", { name: /Ampliar imagem/ })).toBeInTheDocument()
        expect(within(gallery).getByText("Legenda 1")).toBeInTheDocument()
        expect(within(gallery).queryByText(/de 1/)).not.toBeInTheDocument()
        expect(within(gallery).queryByRole("group")).not.toBeInTheDocument()
    })

    it("com várias, mostra contador e o grupo Miniaturas com aria-current só na ativa e alt vazio", () => {
        renderGallery(buildImages(3))
        const group = screen.getByRole("group", { name: "Miniaturas" })
        const thumbs = within(group).getAllByRole("button")

        expect(screen.getByText("1 de 3")).toBeInTheDocument()
        expect(thumbs.map((thumb) => thumb.getAttribute("aria-label"))).toEqual([
            "Imagem 1 de 3",
            "Imagem 2 de 3",
            "Imagem 3 de 3"
        ])
        expect(thumbs.map((thumb) => thumb.getAttribute("aria-current"))).toEqual([
            "true",
            null,
            null
        ])
        for (const thumb of thumbs) {
            expect(thumb.querySelector("img")).toHaveAttribute("alt", "")
        }
    })

    it("escolher uma miniatura troca imagem, legenda e contador sem mover o foco", async () => {
        const user = userEvent.setup()
        renderGallery(buildImages(3))
        const second = screen.getByRole("button", { name: "Imagem 2 de 3" })

        await user.click(second)

        const gallery = screen.getByRole("region", { name: "Galeria" })
        expect(within(gallery).getByRole("img", { name: "Descrição 2" })).toBeInTheDocument()
        expect(within(gallery).getByText("Legenda 2")).toBeInTheDocument()
        expect(within(gallery).getByText("2 de 3")).toBeInTheDocument()
        expect(second).toHaveFocus()
        expect(second).toHaveAttribute("aria-current", "true")
    })

    it("não troca de imagem sozinha", () => {
        vi.useFakeTimers()
        renderGallery(buildImages(3))

        act(() => {
            vi.advanceTimersByTime(60000)
        })

        expect(screen.getByText("1 de 3")).toBeInTheDocument()
        vi.useRealTimers()
    })

    it("carrega a principal com prioridade alta e as miniaturas pela variante pequena e carga tardia", () => {
        renderGallery(buildImages(2))
        const main = screen.getByRole("img", { name: "Descrição 1" })
        const thumbs = within(screen.getByRole("group")).getAllByRole("button")
        const thumbImage = thumbs[0].querySelector("img")

        expect(main).toHaveAttribute("fetchpriority", "high")
        expect(main).not.toHaveAttribute("loading", "lazy")
        expect(main).toHaveAttribute("width")
        expect(main).toHaveAttribute("height")
        expect(main.getAttribute("src")).toBe("/images/p/1-small.webp")
        expect(thumbImage?.getAttribute("srcset")).toContain("/images/p/1-small.webp 640w")
        expect(thumbImage?.getAttribute("sizes")).toBeTruthy()
        expect(thumbImage).toHaveAttribute("loading", "lazy")
        expect(thumbImage).toHaveAttribute("decoding", "async")
    })

    it("a imagem principal oferece as variantes pequena e grande por srcset e sizes", () => {
        renderGallery(buildImages(2))
        const main = document.querySelector("button img")

        expect(main).toHaveAttribute("src", "/images/p/1-small.webp")
        expect(main).toHaveAttribute(
            "srcset",
            "/images/p/1-small.webp 640w, /images/p/1-large.webp 1600w"
        )
        expect(main).toHaveAttribute("sizes", "(min-width: 980px) 66vw, 100vw")
    })

    it("as miniaturas continuam só com a variante pequena e a lightbox usa a grande", async () => {
        const user = userEvent.setup()
        renderGallery(buildImages(2))

        const thumbnails = document.querySelectorAll('[role="group"] img')
        thumbnails.forEach((thumb) => expect(thumb.getAttribute("srcset")).not.toContain("large"))

        await user.click(screen.getByRole("button", { name: /Ampliar imagem/ }))

        expect(
            within(screen.getByRole("dialog")).getByRole("img", { name: "Descrição 1" })
        ).toHaveAttribute("src", "/images/p/1-large.webp")
    })

    it("abre a lightbox na imagem ativa e devolve o foco ao botão da principal com a última imagem vista", async () => {
        const user = userEvent.setup()
        renderGallery(buildImages(3))

        await user.click(screen.getByRole("button", { name: "Imagem 2 de 3" }))
        const opener = screen.getByRole("button", { name: /Ampliar imagem/ })
        await user.click(opener)

        expect(
            within(screen.getByRole("dialog")).getByRole("img", { name: "Descrição 2" })
        ).toBeInTheDocument()

        await user.keyboard("{ArrowRight}")
        await user.keyboard("{Escape}")

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(opener).toHaveFocus()
        expect(within(opener).getByRole("img", { name: "Descrição 3" })).toBeInTheDocument()
        expect(screen.getByText("3 de 3")).toBeInTheDocument()
    })

    it("com a principal quebrada, mostra placeholder com role img e mantém legenda, contador e miniaturas", () => {
        renderGallery(buildImages(3))

        fireEvent.error(screen.getByRole("img", { name: "Descrição 1" }))

        const placeholder = screen.getByRole("img", { name: "Descrição 1" })
        expect(placeholder.tagName).toBe("DIV")
        expect(screen.getByText("Legenda 1")).toBeInTheDocument()
        expect(screen.getByText("1 de 3")).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: /Imagem \d de 3/ })).toHaveLength(3)
    })

    it.each([
        ["en", "Gallery", "Thumbnails", "Image 2 of 3"],
        ["es", "Galería", "Miniaturas", "Imagen 2 de 3"]
    ] as const)("traduz os textos em %s", async (language, gallery, thumbnails, thumbnail) => {
        renderGallery(buildImages(3))
        await act(() => setLanguage(language))

        expect(screen.getByRole("region", { name: gallery })).toBeInTheDocument()
        expect(screen.getByRole("group", { name: thumbnails })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: thumbnail })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade fechada nem com a lightbox aberta", async () => {
        const user = userEvent.setup()
        const { container } = renderGallery(buildImages(3))

        await expectNoAxeViolations(container)

        await user.click(screen.getByRole("button", { name: /Ampliar imagem/ }))

        await expectNoAxeViolations(document.body)
    }, 15000)
})
