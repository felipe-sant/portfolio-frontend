import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import TrajectoryDetail from "@/components/TrajectoryDetail"
import setLanguage from "@/i18n/setLanguage"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

const PROJECT_ID = "0192f1b2-3a4c-7d5e-8f60-718293a4b5e1"

function renderDetail(item: TimelineItem) {
    return render(
        <MemoryRouter>
            <TrajectoryDetail item={item} />
        </MemoryRouter>
    )
}

function fullExperience(): TimelineItem {
    return buildTimelineItem({
        summary: "Resumo da experiência.",
        responsibilities: ["Mantenho a interface"],
        technologies: ["React", "TypeScript"],
        certificates: [
            { id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d1", name: "AWS Practitioner", issuer: "AWS" },
            { id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5d2", name: "React avançado" }
        ],
        projects: [{ id: PROJECT_ID, title: "Maps" }]
    })
}

describe("TrajectoryDetail", () => {
    it("mostra os blocos na ordem do resumo, responsabilidades, tecnologias, certificados e projetos", () => {
        const { container } = renderDetail(fullExperience())
        const headings = screen.getAllByRole("heading", { level: 3 })

        expect(headings.map((heading) => heading.textContent)).toEqual([
            "Responsabilidades",
            "Tecnologias",
            "Certificados",
            "Projetos relacionados"
        ])
        expect(container.firstElementChild?.firstElementChild).toHaveTextContent(
            "Resumo da experiência."
        )
        expect(screen.getByText("Mantenho a interface").closest("ul")).not.toBeNull()
    })

    it("mostra tecnologias e certificados como chips, com o emissor separado por ponto médio", () => {
        renderDetail(fullExperience())

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText(/AWS Practitioner/).closest("li")).toHaveTextContent(
            "AWS Practitioner · AWS"
        )
        expect(screen.getByText("React avançado").closest("li")).toHaveTextContent(
            /^React avançado$/
        )
    })

    it("sem blocos preenchidos mostra só o resumo, sem rótulo", () => {
        renderDetail(buildTimelineItem({ summary: "Só o resumo." }))

        expect(screen.getByText("Só o resumo.")).toBeInTheDocument()
        expect(screen.queryAllByRole("heading")).toHaveLength(0)
    })

    it.each(["education", "course"] as const)(
        "em %s mostra as disciplinas e ignora as responsabilidades",
        (kind) => {
            renderDetail(
                buildTimelineItem({
                    kind,
                    disciplines: ["Banco de dados"],
                    responsibilities: ["Não deve aparecer"]
                })
            )

            expect(
                screen.getByRole("heading", { level: 3, name: "Principais disciplinas" })
            ).toBeInTheDocument()
            expect(screen.getByText("Banco de dados")).toBeInTheDocument()
            expect(screen.queryByText("Não deve aparecer")).not.toBeInTheDocument()
            expect(screen.queryByText("Responsabilidades")).not.toBeInTheDocument()
        }
    )

    it.each([
        ["pt-BR", "/pt-BR/projects/"],
        ["en", "/en/projects/"],
        ["es", "/es/projects/"]
    ] as const)("liga o projeto relacionado ao detalhe em %s", async (language, prefix) => {
        await act(() => setLanguage(language))
        renderDetail(fullExperience())
        const link = screen.getByRole("link", { name: "Maps" })

        expect(link).toHaveAttribute("href", `${prefix}${PROJECT_ID}`)
        expect(link).not.toHaveAttribute("target")
        expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent("→")
    })

    it("não vira link a referência sem título ou com id inválido e esconde o bloco vazio", () => {
        renderDetail(
            buildTimelineItem({
                projects: [
                    { id: PROJECT_ID, title: "" },
                    { id: "nao-e-uuid", title: "Quebrado" }
                ]
            })
        )

        expect(screen.queryByRole("link")).not.toBeInTheDocument()
        expect(screen.queryByText("Projetos relacionados")).not.toBeInTheDocument()
    })

    it("duas instâncias na mesma árvore não repetem id e não têm violações de acessibilidade", async () => {
        const item = fullExperience()
        const { container } = render(
            <MemoryRouter>
                <TrajectoryDetail item={item} />
                <TrajectoryDetail item={item} />
            </MemoryRouter>
        )
        const ids = Array.from(container.querySelectorAll("[id]")).map((element) => element.id)

        expect(new Set(ids).size).toBe(ids.length)
        await expectNoAxeViolations(container)
    }, 15000)
})
