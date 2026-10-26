import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Lightbox from "@/components/Lightbox"
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

type HarnessProps = {
    images: ProjectImage[]
    initialOpen?: boolean
    initialIndex?: number
    onClose?: () => void
    onChange?: (index: number) => void
}

function Harness({
    images,
    initialOpen = true,
    initialIndex = 0,
    onClose,
    onChange
}: HarnessProps) {
    const [isOpen, setIsOpen] = useState(initialOpen)
    const [index, setIndex] = useState(initialIndex)

    return (
        <>
            <button type="button" onClick={() => setIsOpen(true)}>
                {"Abrir"}
            </button>
            <Lightbox
                images={images}
                activeIndex={index}
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false)
                    onClose?.()
                }}
                onChange={(next) => {
                    setIndex(next)
                    onChange?.(next)
                }}
            />
        </>
    )
}

function renderLightbox(props: HarnessProps) {
    return render(<Harness {...props} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

function getBackdrop() {
    const backdrop = screen.getByRole("dialog").parentElement

    if (!backdrop) {
        throw new Error("O diálogo da lightbox não tem fundo")
    }

    return backdrop
}

describe("Lightbox", () => {
    it("fechada, não renderiza nada nem pede imagem", () => {
        renderLightbox({ images: buildImages(2), initialOpen: false })

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(document.querySelector("img")).not.toBeInTheDocument()
    })

    it("aberta, é um diálogo modal nomeado Imagem ampliada", () => {
        renderLightbox({ images: buildImages(2) })
        const dialog = screen.getByRole("dialog", { name: "Imagem ampliada" })

        expect(dialog).toHaveAttribute("aria-modal", "true")
    })

    it("com uma imagem, não tem anterior nem próxima, ignora as setas e mostra só a legenda", async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        renderLightbox({ images: buildImages(1), onChange })

        await user.keyboard("{ArrowRight}{ArrowLeft}")

        expect(screen.queryByRole("button", { name: "Imagem anterior" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Próxima imagem" })).not.toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()
        expect(screen.getByText("Legenda 1").closest("[aria-live]")).toHaveTextContent(
            /^Legenda 1$/
        )
    })

    it("com uma imagem sem legenda, a barra fica sem texto", () => {
        renderLightbox({ images: buildImages(1, false) })
        const region = document.querySelector("[aria-live='polite']")

        expect(region).toBeInTheDocument()
        expect(region?.textContent).toBe("")
    })

    it("com várias, mostra legenda · N de M numa região aria-live e atualiza ao trocar", async () => {
        const user = userEvent.setup()
        renderLightbox({ images: buildImages(3) })
        const region = document.querySelector("[aria-live='polite']")

        expect(region?.textContent?.replace(/\s+/g, " ").trim()).toBe("Legenda 1 · 1 de 3")
        expect(region?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)

        await user.click(screen.getByRole("button", { name: "Próxima imagem" }))

        expect(region?.textContent?.replace(/\s+/g, " ").trim()).toBe("Legenda 2 · 2 de 3")
    })

    it("com várias e sem legenda, mostra só N de M", () => {
        renderLightbox({ images: buildImages(3, false), initialIndex: 1 })

        expect(document.querySelector("[aria-live='polite']")?.textContent?.trim()).toBe("2 de 3")
    })

    it("usa a variante grande e o alt da captura ativa", () => {
        renderLightbox({ images: buildImages(3), initialIndex: 2 })
        const image = within(screen.getByRole("dialog")).getByRole("img", { name: "Descrição 3" })

        expect(image).toHaveAttribute("src", "/images/p/3-large.webp")
        expect(image).toHaveAttribute("width", "1600")
    })

    it("ao abrir, foca Fechar, prende o Tab, deixa #root inert e trava a rolagem", async () => {
        const user = userEvent.setup()
        renderLightbox({ images: buildImages(3) })
        const close = screen.getByRole("button", { name: "Fechar" })

        expect(close).toHaveFocus()
        expect(appRoot).toHaveAttribute("inert")
        expect(document.body).toHaveAttribute("data-scroll-locked")

        await user.tab()
        expect(screen.getByRole("button", { name: "Imagem anterior" })).toHaveFocus()
        await user.tab()
        expect(screen.getByRole("button", { name: "Próxima imagem" })).toHaveFocus()
        await user.tab()
        expect(close).toHaveFocus()
        await user.tab({ shift: true })
        expect(screen.getByRole("button", { name: "Próxima imagem" })).toHaveFocus()
    })

    it("troca de imagem em ciclo com as setas e com os botões", async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        renderLightbox({ images: buildImages(3), onChange })

        await user.keyboard("{ArrowLeft}")
        expect(onChange).toHaveBeenLastCalledWith(2)
        await user.keyboard("{ArrowRight}")
        expect(onChange).toHaveBeenLastCalledWith(0)
        await user.click(screen.getByRole("button", { name: "Próxima imagem" }))
        expect(onChange).toHaveBeenLastCalledWith(1)
        await user.click(screen.getByRole("button", { name: "Imagem anterior" }))
        expect(onChange).toHaveBeenLastCalledWith(0)
    })

    it("fecha com Esc, com Fechar e com clique no fundo, devolvendo o foco a quem abriu", async () => {
        const onClose = vi.fn()
        const user = userEvent.setup()
        renderLightbox({ images: buildImages(2), initialOpen: false, onClose })

        for (const close of [
            () => user.keyboard("{Escape}"),
            () => user.click(screen.getByRole("button", { name: "Fechar" })),
            () => user.click(getBackdrop())
        ]) {
            const opener = screen.getByRole("button", { name: "Abrir" })
            await user.click(opener)
            expect(screen.getByRole("dialog")).toBeInTheDocument()

            await close()

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
            expect(opener).toHaveFocus()
        }
        expect(onClose).toHaveBeenCalledTimes(3)
    })

    it("não fecha quando o clique começa dentro do painel e termina no fundo", () => {
        const onClose = vi.fn()
        renderLightbox({ images: buildImages(2), onClose })
        const dialog = screen.getByRole("dialog")
        const backdrop = getBackdrop()

        fireEvent.mouseDown(dialog)
        fireEvent.click(backdrop)

        expect(onClose).not.toHaveBeenCalled()
    })

    it("mostra placeholder com role img e o alt como nome quando a imagem falha, mantendo a barra e os botões", () => {
        renderLightbox({ images: buildImages(3) })
        const dialog = screen.getByRole("dialog")

        fireEvent.error(within(dialog).getByRole("img", { name: "Descrição 1" }))

        const placeholder = within(dialog).getByRole("img", { name: "Descrição 1" })
        expect(placeholder.tagName).toBe("DIV")
        expect(within(dialog).getByRole("button", { name: "Próxima imagem" })).toBeInTheDocument()
        expect(dialog).toHaveTextContent("Legenda 1")
    })

    it.each([
        ["en", "Enlarged image", "Close", "Previous image", "Next image", "1 of 3"],
        ["es", "Imagen ampliada", "Cerrar", "Imagen anterior", "Imagen siguiente", "1 de 3"]
    ] as const)(
        "traduz nomes e contador em %s",
        async (language, label, close, previous, next, counter) => {
            renderLightbox({ images: buildImages(3) })
            await act(() => setLanguage(language))

            expect(screen.getByRole("dialog", { name: label })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: close })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: previous })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: next })).toBeInTheDocument()
            expect(document.querySelector("[aria-live='polite']")).toHaveTextContent(counter)
        }
    )

    it("não tem violações de acessibilidade aberta", async () => {
        renderLightbox({ images: buildImages(3) })

        await expectNoAxeViolations(document.body)
    }, 15000)
})
