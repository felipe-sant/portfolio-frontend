import { afterEach, describe, expect, it } from "vitest"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ButtonLink from "@/components/ButtonLink"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function renderButtonLink() {
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: (
                    <ButtonLink to="/destino" variant="secondary">
                        Ir para o destino
                    </ButtonLink>
                )
            },
            { path: "/destino", element: <p>Chegou</p> }
        ],
        { initialEntries: ["/"] }
    )

    return { router, ...render(<RouterProvider router={router} />) }
}

afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("ButtonLink", () => {
    it("renderiza um link com o href recebido", () => {
        renderButtonLink()

        expect(screen.getByRole("link", { name: "Ir para o destino" })).toHaveAttribute(
            "href",
            "/destino"
        )
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("navega ao clique", async () => {
        const { router } = renderButtonLink()

        await userEvent.click(screen.getByRole("link", { name: "Ir para o destino" }))

        expect(router.state.location.pathname).toBe("/destino")
    })

    it("usa View Transition com movimento pleno", async () => {
        const startViewTransition = stubViewTransition()
        renderButtonLink()

        await userEvent.click(screen.getByRole("link"))

        expect(startViewTransition).toHaveBeenCalledTimes(1)
    })

    it("não usa View Transition com movimento reduzido", async () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const startViewTransition = stubViewTransition()
        renderButtonLink()

        await userEvent.click(screen.getByRole("link"))

        expect(startViewTransition).not.toHaveBeenCalled()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderButtonLink()

        await expectNoAxeViolations(container)
    }, 15000)
})
