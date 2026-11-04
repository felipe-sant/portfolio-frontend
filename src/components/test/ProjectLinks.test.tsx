import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import ProjectLinks from "@/components/ProjectLinks"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const DEMO = "https://maps.example.com"
const CODE = "https://github.com/felipe-sant/maps"

describe("ProjectLinks", () => {
    it("não renderiza nada sem demonstração e sem repositório", () => {
        const { container } = render(<ProjectLinks title={"Maps"} />)

        expect(container).toBeEmptyDOMElement()
    })

    it("mostra a demonstração primária e o código secundário com nome, href, target e rel", () => {
        render(<ProjectLinks title={"Maps"} demoUrl={DEMO} repositoryUrl={CODE} />)
        const demo = screen.getByRole("link", {
            name: "Ver projeto ao vivo: Maps (abre em nova aba)"
        })
        const code = screen.getByRole("link", {
            name: "Ver código no GitHub: Maps (abre em nova aba)"
        })

        expect(demo).toHaveAttribute("href", DEMO)
        expect(code).toHaveAttribute("href", CODE)
        expect(demo).toHaveAttribute("target", "_blank")
        expect(code).toHaveAttribute("rel", "noopener noreferrer")
        expect(demo.className).toContain("primary")
        expect(code.className).toContain("secondary")
        expect(demo).toHaveTextContent("Ver projeto ao vivo")
    })

    it("com só o repositório, o código vira primário e não existe link de demonstração", () => {
        render(<ProjectLinks title={"Maps"} repositoryUrl={CODE} />)
        const code = screen.getByRole("link", { name: /Ver código no GitHub/ })

        expect(code.className).toContain("primary")
        expect(screen.getAllByRole("link")).toHaveLength(1)
        expect(screen.queryByText("Ver projeto ao vivo")).not.toBeInTheDocument()
    })

    it("com só a demonstração, mostra apenas ela", () => {
        render(<ProjectLinks title={"Maps"} demoUrl={DEMO} />)

        expect(screen.getAllByRole("link")).toHaveLength(1)
        expect(screen.getByRole("link", { name: /Ver projeto ao vivo/ })).toBeInTheDocument()
    })

    it.each([
        ["en", "View live project: Maps (opens in a new tab)", "View code on GitHub"],
        ["es", "Ver proyecto en vivo: Maps (se abre en una pestaña nueva)", "Ver código en GitHub"]
    ] as const)("traduz textos e nomes em %s", async (language, demoName, codeText) => {
        render(<ProjectLinks title={"Maps"} demoUrl={DEMO} repositoryUrl={CODE} />)
        await act(() => setLanguage(language))

        expect(screen.getByRole("link", { name: demoName })).toBeInTheDocument()
        expect(screen.getByText(codeText)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <ProjectLinks title={"Maps"} demoUrl={DEMO} repositoryUrl={CODE} />
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
