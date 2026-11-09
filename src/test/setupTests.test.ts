import { getConfig, screen } from "@testing-library/dom"
import { describe, expect, it } from "vitest"

describe("setupTests", () => {
    it("configura o limite de espera do Testing Library em 10000 ms", () => {
        expect(getConfig().asyncUtilTimeout).toBe(10000)
    })

    it("espera um elemento que aparece depois de 1500 ms", async () => {
        setTimeout(() => {
            const element = document.createElement("p")
            element.textContent = "tardio"
            document.body.appendChild(element)
        }, 1500)

        expect(await screen.findByText("tardio")).toBeInTheDocument()
    })
})
