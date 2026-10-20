import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import Skeleton from "@/components/Skeleton"
import SkeletonSwap from "@/components/SkeletonSwap"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function endAnimation(target: Element) {
    fireEvent.animationEnd(target)
    fireEvent(target, new Event("webkitAnimationEnd", { bubbles: true }))
}

function renderSwapElement(loading: boolean) {
    return (
        <SkeletonSwap isLoading={loading} skeleton={<div data-testid="skeleton" />}>
            <p>Conteúdo</p>
        </SkeletonSwap>
    )
}

function renderAnnouncedElement(loading: boolean) {
    return (
        <SkeletonSwap isLoading={loading} skeleton={<Skeleton announce />}>
            <p>Conteúdo</p>
        </SkeletonSwap>
    )
}

function renderSwap(isLoading: boolean) {
    const result = render(renderSwapElement(isLoading))

    return { ...result, update: (loading: boolean) => result.rerender(renderSwapElement(loading)) }
}

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("SkeletonSwap", () => {
    it("mostra só o skeleton enquanto carrega", () => {
        renderSwap(true)

        expect(screen.getByTestId("skeleton")).toBeInTheDocument()
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument()
    })

    it("mostra o conteúdo e mantém o skeleton oculto e inerte até o fim da animação", () => {
        const { update } = renderSwap(true)

        update(false)

        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
        const overlay = screen.getByTestId("skeleton").parentElement
        expect(overlay).toHaveAttribute("aria-hidden", "true")
        expect(overlay).toHaveAttribute("inert")
    })

    it("remove o skeleton quando a animação termina", () => {
        const { update } = renderSwap(true)

        update(false)
        const overlay = screen.getByTestId("skeleton").parentElement as HTMLElement
        endAnimation(overlay)

        expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument()
        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
    })

    it("não remove o skeleton com o fim de uma animação de descendente", () => {
        const { update } = renderSwap(true)

        update(false)
        endAnimation(screen.getByTestId("skeleton"))

        expect(screen.getByTestId("skeleton")).toBeInTheDocument()
    })

    it("remove o skeleton na hora com movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const { update } = renderSwap(true)

        update(false)

        expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument()
        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
    })

    it("volta a mostrar só o skeleton ao carregar de novo", () => {
        const { update } = renderSwap(false)

        update(true)

        expect(screen.getByTestId("skeleton")).toBeInTheDocument()
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument()
    })

    it("não deixa nenhum status acessível depois da carga e não tem violações de acessibilidade", async () => {
        const { container, rerender } = render(renderAnnouncedElement(true))

        expect(screen.getByRole("status")).toBeInTheDocument()

        rerender(renderAnnouncedElement(false))

        expect(screen.queryByRole("status")).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    }, 15000)
})
