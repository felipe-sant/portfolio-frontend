import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import CertificateChip from "@/components/CertificateChip"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("CertificateChip", () => {
    it("mostra só o nome quando não há emissor", () => {
        const { container } = render(
            <CertificateChip certificate={{ id: "a", name: "React avançado" }} />
        )

        expect(container).toHaveTextContent(/^React avançado$/)
    })

    it("mostra o nome e o emissor separados por ponto médio oculto do leitor", () => {
        const { container } = render(
            <CertificateChip certificate={{ id: "a", name: "Practitioner", issuer: "AWS" }} />
        )

        expect(container).toHaveTextContent("Practitioner · AWS")
        expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("·")
        expect(screen.getByText(/Practitioner/)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <CertificateChip certificate={{ id: "a", name: "Practitioner", issuer: "AWS" }} />
        )

        await expectNoAxeViolations(container)
    })
})
