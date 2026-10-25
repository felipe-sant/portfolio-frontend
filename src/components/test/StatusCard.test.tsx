import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import StatusCard from "@/components/StatusCard"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("StatusCard", () => {
    it("mostra o cargo, a organização e o início no variant working", () => {
        const { container } = render(
            <StatusCard
                variant="working"
                label="Trabalhando como"
                title="Desenvolvedor Full Stack"
                organization="InCicle"
                start="2024-06"
            />
        )

        expect(screen.getByText("Trabalhando como")).toBeInTheDocument()
        expect(screen.getByText("Desenvolvedor Full Stack")).toBeInTheDocument()
        expect(screen.getByText("InCicle")).toBeInTheDocument()
        expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1)
        expect(screen.getByText("desde 06/2024")).toHaveAttribute("datetime", "2024-06")
    })

    it("omite organização e separador no working sem organização", () => {
        const { container } = render(
            <StatusCard
                variant="working"
                label="Trabalhando como"
                title="Desenvolvedor Full Stack"
                start="2024-06"
            />
        )

        expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument()
        expect(screen.getByText("desde 06/2024")).toBeInTheDocument()
    })

    it("junta instituição e curso e mostra a etapa no variant studying", () => {
        const { container } = render(
            <StatusCard
                variant="studying"
                label="Cursando"
                title="Desenvolvimento de Software Multiplataforma"
                organization="Fatec"
                stage="4º semestre"
                start="2024-02"
            />
        )

        expect(screen.getByText("Cursando")).toBeInTheDocument()
        expect(screen.getByText(/Fatec/)).toHaveTextContent(
            "Fatec · Desenvolvimento de Software Multiplataforma"
        )
        expect(screen.getByText(/4º semestre/)).toHaveTextContent("4º semestre · desde 02/2024")
        const hidden = container.querySelectorAll('[aria-hidden="true"]')
        expect(hidden.length).toBe(3)
    })

    it("marca o indicador do studying como oculto para leitores de tela", () => {
        const { container } = render(
            <StatusCard variant="studying" label="Cursando" title="Curso" start="2024-02" />
        )

        const indicator = container.querySelector('span[aria-hidden="true"]')

        expect(indicator).toBeEmptyDOMElement()
    })

    it("mostra só o curso e a data no studying sem instituição e sem etapa", () => {
        const { container } = render(
            <StatusCard variant="studying" label="Cursando" title="Curso" start="2024-02" />
        )

        expect(screen.getByText("Curso")).toBeInTheDocument()
        expect(screen.getByText("desde 02/2024")).toBeInTheDocument()
        expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1)
    })

    it("troca o texto da data ao mudar para inglês", async () => {
        render(<StatusCard variant="working" label="Working as" title="Dev" start="2024-06" />)

        await act(() => setLanguage("en"))

        expect(screen.getByText("since 06/2024")).toHaveAttribute("datetime", "2024-06")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <StatusCard
                variant="studying"
                label="Cursando"
                title="Curso"
                organization="Fatec"
                stage="4º semestre"
                start="2024-02"
            />
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
