import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectFilterOption from "@/types/project/ProjectFilterOption.types"
import type ProjectsAppliedFilters from "@/types/project/ProjectsAppliedFilters.types"

let appRoot: HTMLDivElement

type Applied = ProjectsAppliedFilters

type ModalHarnessProps = {
    isOpen?: boolean
    technologies?: ProjectFilterOption[]
    years?: ProjectFilterOption[]
    applied?: Applied
    onApply?: (next: Applied) => void
    onClose?: () => void
}

const SORTS = [
    { value: "recent", label: "Mais recente" },
    { value: "oldest", label: "Mais antigo" },
    { value: "title", label: "A–Z" }
] as const

const TECHNOLOGIES: ProjectFilterOption[] = [
    { value: "Node.js", count: 3 },
    { value: "React", count: 5 },
    { value: "TypeScript", count: 4 }
]

const YEARS: ProjectFilterOption[] = [
    { value: "2026", count: 2 },
    { value: "2025", count: 3 },
    { value: "2024", count: 1 }
]

const NO_FILTERS: Applied = { tech: [], year: [], sort: "recent" }

function withSort(applied: { tech: string[]; year: string[] }, sort: Applied["sort"] = "recent") {
    return { ...applied, sort }
}

function ModalHarness({
    isOpen = true,
    technologies = TECHNOLOGIES,
    years = YEARS,
    applied = NO_FILTERS,
    onApply = vi.fn(),
    onClose = vi.fn()
}: ModalHarnessProps) {
    return (
        <ProjectsFiltersModal
            isOpen={isOpen}
            technologies={technologies}
            years={years}
            sorts={SORTS}
            applied={applied}
            onApply={onApply}
            onClose={onClose}
        />
    )
}

function renderModal(props: ModalHarnessProps = {}) {
    return render(<ModalHarness {...props} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("ProjectsFiltersModal", () => {
    it("sem tecnologia nem ano abre com a seção Ordenar e sem os grupos Tecnologia e Ano", () => {
        renderModal({ technologies: [], years: [] })

        expect(screen.getByRole("dialog", { name: "Filtros" })).toBeVisible()
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(screen.getByRole("button", { name: "Limpar" })).toBeVisible()
        expect(screen.getByRole("button", { name: "Aplicar" })).toBeVisible()
        expect(
            within(screen.getByRole("group", { name: "Ordenar" })).getAllByRole("radio")
        ).toHaveLength(3)
        expect(screen.queryByRole("group", { name: "Tecnologia" })).not.toBeInTheDocument()
        expect(screen.queryByRole("group", { name: "Ano" })).not.toBeInTheDocument()
    })

    it("mostra Ordenar como primeira seção, com três radios de mesmo name e só o aplicado marcado", () => {
        renderModal({ applied: withSort({ tech: [], year: [] }, "title") })

        const groups = screen.getAllByRole("group")
        const sort = screen.getByRole("group", { name: "Ordenar" })
        const radios = within(sort).getAllByRole("radio")

        expect(groups.map((group) => group.tagName)).toEqual(["FIELDSET", "FIELDSET", "FIELDSET"])
        expect(groups[0]).toBe(sort)
        expect(radios.map((radio) => radio.closest("label")?.textContent)).toEqual([
            "Mais recente",
            "Mais antigo",
            "A–Z"
        ])
        expect(radios.map((radio) => radio.getAttribute("name"))).toEqual(
            Array(3).fill(radios[0].getAttribute("name"))
        )
        expect(radios[0].getAttribute("name")).not.toBe("")
        expect(within(sort).getByRole("radio", { name: "A–Z" })).toBeChecked()
        expect(within(sort).getByRole("radio", { name: "Mais recente" })).not.toBeChecked()
        expect(within(sort).getByRole("radio", { name: "Mais antigo" })).not.toBeChecked()
    })

    it("escolher outra ordenação troca a marcada, não chama onApply e não muda o resumo", async () => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        renderModal({ onApply })

        await user.click(screen.getByRole("radio", { name: "A–Z" }))

        expect(screen.getByRole("radio", { name: "A–Z" })).toBeChecked()
        expect(screen.getByRole("radio", { name: "Mais recente" })).not.toBeChecked()
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(onApply).not.toHaveBeenCalled()
    })

    it.each([
        [
            "Aplicar",
            (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Aplicar" }))
        ],
        [
            "Fechar",
            (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Fechar" }))
        ],
        ["Esc", (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
        [
            "o fundo",
            (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("dialog").parentElement as HTMLElement)
        ]
    ])("só a ordenação diferente já aplica ao fechar por %s", async (_name, close) => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose })

        await user.click(screen.getByRole("radio", { name: "Mais antigo" }))
        await close(user)

        expect(onApply).toHaveBeenCalledTimes(1)
        expect(onApply).toHaveBeenCalledWith({ tech: [], year: [], sort: "oldest" })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("voltar à ordenação aplicada antes de fechar não chama onApply", async () => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        renderModal({ onApply, applied: withSort({ tech: [], year: [] }, "title") })

        await user.click(screen.getByRole("radio", { name: "Mais antigo" }))
        await user.click(screen.getByRole("radio", { name: "A–Z" }))
        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).not.toHaveBeenCalled()
    })

    it("Limpar volta a ordenação ao padrão sem fechar nem aplicar, e fechar aplica o padrão", async () => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose, applied: withSort({ tech: ["React"], year: [] }, "title") })

        await user.click(screen.getByRole("button", { name: "Limpar" }))

        expect(screen.getByRole("radio", { name: "Mais recente" })).toBeChecked()
        expect(screen.getByRole("radio", { name: "A–Z" })).not.toBeChecked()
        expect(onApply).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()

        await user.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).toHaveBeenCalledWith({ tech: [], year: [], sort: "recent" })
    })

    it("reabrir descarta a ordenação não aplicada", async () => {
        const user = userEvent.setup()
        const { rerender } = renderModal()

        await user.click(screen.getByRole("radio", { name: "A–Z" }))

        rerender(<ModalHarness isOpen={false} />)
        rerender(<ModalHarness isOpen />)

        expect(screen.getByRole("radio", { name: "Mais recente" })).toBeChecked()
        expect(screen.getByRole("radio", { name: "A–Z" })).not.toBeChecked()
    })

    it("Tab entra no radio marcado, Espaço marca o focado e Tab sai para a primeira caixa seguinte", async () => {
        const user = userEvent.setup()
        renderModal({ applied: withSort({ tech: [], year: [] }, "oldest") })

        await user.tab()
        await user.tab()
        expect(screen.getByRole("radio", { name: "Mais antigo" })).toHaveFocus()

        await user.tab()
        expect(screen.getByRole("checkbox", { name: "Node.js" })).toHaveFocus()
    })

    it("as setas movem e marcam a ordenação no rascunho", async () => {
        const user = userEvent.setup()
        renderModal()

        screen.getByRole("radio", { name: "Mais recente" }).focus()
        await user.keyboard("{ArrowDown}")
        expect(screen.getByRole("radio", { name: "Mais antigo" })).toBeChecked()
        expect(screen.getByRole("radio", { name: "Mais antigo" })).toHaveFocus()

        await user.keyboard("{ArrowUp}")
        expect(screen.getByRole("radio", { name: "Mais recente" })).toBeChecked()
    })

    it("Espaço marca o radio focado", async () => {
        const user = userEvent.setup()
        renderModal()

        screen.getByRole("radio", { name: "A–Z" }).focus()
        await user.keyboard(" ")

        expect(screen.getByRole("radio", { name: "A–Z" })).toBeChecked()
    })

    it("mostra Tecnologia e Ano em fieldset com legend e uma caixa por opção, marcando as aplicadas", () => {
        renderModal({ applied: withSort({ tech: ["React"], year: ["2025"] }) })

        const technology = screen.getByRole("group", { name: "Tecnologia" })
        const year = screen.getByRole("group", { name: "Ano" })

        expect(
            within(technology)
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["Node.js", "React", "TypeScript"])
        expect(
            within(year)
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["2026", "2025", "2024"])
        expect(within(technology).getByRole("checkbox", { name: "React" })).toBeChecked()
        expect(within(technology).getByRole("checkbox", { name: "Node.js" })).not.toBeChecked()
        expect(within(year).getByRole("checkbox", { name: "2025" })).toBeChecked()
    })

    it("omite a seção que não tem opção", () => {
        renderModal({ years: [] })

        expect(screen.getByRole("group", { name: "Tecnologia" })).toBeVisible()
        expect(screen.queryByRole("group", { name: "Ano" })).not.toBeInTheDocument()
    })

    it("marcar e desmarcar altera o resumo sem chamar onApply", async () => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        renderModal({ onApply })

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        expect(screen.getByText("1 filtro selecionado")).toBeVisible()

        await user.click(screen.getByRole("checkbox", { name: "2025" }))
        expect(screen.getByText("2 filtros selecionados")).toBeVisible()

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        await user.click(screen.getByRole("checkbox", { name: "2025" }))
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(onApply).not.toHaveBeenCalled()
    })

    it("descreve o diálogo pelo resumo", () => {
        renderModal({ applied: withSort({ tech: ["React"], year: [] }) })

        expect(screen.getByRole("dialog")).toHaveAccessibleDescription("1 filtro selecionado")
    })

    it.each([
        [
            "Aplicar",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Aplicar" }))
        ],
        [
            "Fechar",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Fechar" }))
        ],
        ["Esc", async (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
        [
            "o fundo",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("dialog").parentElement as HTMLElement)
        ]
    ])("fechar por %s aplica o rascunho e fecha", async (_name, close) => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose })

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        await user.click(screen.getByRole("checkbox", { name: "Node.js" }))
        await user.click(screen.getByRole("checkbox", { name: "2024" }))
        await close(user)

        expect(onApply).toHaveBeenCalledTimes(1)
        expect(onApply).toHaveBeenCalledWith({
            tech: ["React", "Node.js"],
            year: ["2024"],
            sort: "recent"
        })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["Aplicar", () => userEvent.click(screen.getByRole("button", { name: "Aplicar" }))],
        ["Fechar", () => userEvent.click(screen.getByRole("button", { name: "Fechar" }))],
        ["Esc", () => userEvent.keyboard("{Escape}")],
        ["o fundo", () => userEvent.click(screen.getByRole("dialog").parentElement as HTMLElement)]
    ])("fechar por %s com o rascunho igual ao aplicado não chama onApply", async (_name, close) => {
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({
            onApply,
            onClose,
            applied: withSort({ tech: ["React", "Node.js"], year: ["2025"] })
        })

        await userEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
        await userEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
        await close()

        expect(onApply).not.toHaveBeenCalled()
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("compara o rascunho com o aplicado sem considerar a ordem", async () => {
        const onApply = vi.fn()
        renderModal({ onApply, applied: withSort({ tech: ["React", "Node.js"], year: [] }) })

        await userEvent.click(screen.getByRole("checkbox", { name: "React" }))
        await userEvent.click(screen.getByRole("checkbox", { name: "React" }))
        await userEvent.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).not.toHaveBeenCalled()
    })

    it("Limpar desmarca tudo, mantém o modal aberto e só aplica ao fechar", async () => {
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose, applied: withSort({ tech: ["React"], year: ["2025"] }) })

        await userEvent.click(screen.getByRole("button", { name: "Limpar" }))

        expect(
            screen
                .getAllByRole("checkbox")
                .filter((box) => box instanceof HTMLInputElement && box.checked)
        ).toHaveLength(0)
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(screen.getByRole("dialog")).toBeVisible()
        expect(onApply).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()

        await userEvent.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).toHaveBeenCalledWith({ tech: [], year: [], sort: "recent" })
    })

    it("reabrir descarta o rascunho que não foi aplicado", async () => {
        const { rerender } = renderModal({ applied: withSort({ tech: ["React"], year: [] }) })

        await userEvent.click(screen.getByRole("checkbox", { name: "Node.js" }))
        expect(screen.getByText("2 filtros selecionados")).toBeVisible()

        rerender(<ModalHarness isOpen={false} applied={withSort({ tech: ["React"], year: [] })} />)
        rerender(<ModalHarness isOpen applied={withSort({ tech: ["React"], year: [] })} />)

        expect(screen.getByText("1 filtro selecionado")).toBeVisible()
        expect(screen.getByRole("checkbox", { name: "Node.js" })).not.toBeChecked()
    })

    it("não marca como selecionada a tecnologia aplicada que não existe nas opções", () => {
        renderModal({ applied: withSort({ tech: ["Inexistente"], year: [] }) })

        expect(
            screen
                .getAllByRole("checkbox")
                .filter((box) => box instanceof HTMLInputElement && box.checked)
        ).toHaveLength(0)
    })

    it.each([
        [
            "pt-BR",
            [
                "Filtros",
                "Nenhum filtro selecionado",
                "Tecnologia",
                "Ano",
                "Fechar",
                "Limpar",
                "Aplicar",
                "Ordenar"
            ]
        ],
        [
            "en",
            [
                "Filters",
                "No filters selected",
                "Technology",
                "Year",
                "Close",
                "Clear",
                "Apply",
                "Sort"
            ]
        ],
        [
            "es",
            [
                "Filtros",
                "Ningún filtro seleccionado",
                "Tecnología",
                "Año",
                "Cerrar",
                "Limpiar",
                "Aplicar",
                "Ordenar"
            ]
        ]
    ] as const)("mostra os textos em %s sem chave no lugar do texto", async (language, texts) => {
        await setLanguage(language)

        renderModal()

        const [title, summary, technology, year, close, clear, apply, sort] = texts

        expect(screen.getByRole("heading", { name: title })).toBeVisible()
        expect(screen.getByText(summary)).toBeVisible()
        expect(screen.getByRole("group", { name: technology })).toBeVisible()
        expect(screen.getByRole("group", { name: year })).toBeVisible()
        expect(screen.getByRole("group", { name: sort })).toBeVisible()
        expect(screen.getByRole("button", { name: close })).toBeVisible()
        expect(screen.getByRole("button", { name: clear })).toBeVisible()
        expect(screen.getByRole("button", { name: apply })).toBeVisible()
        expect(document.body.textContent).not.toMatch(/\bfilters\.[a-zA-Z]+/)
    })

    it.each([
        ["en", "2 filters selected"],
        ["es", "2 filtros seleccionados"]
    ] as const)("pluraliza o resumo em %s", async (language, summary) => {
        await setLanguage(language)

        renderModal({ applied: withSort({ tech: ["React"], year: ["2025"] }) })

        expect(screen.getByText(summary)).toBeVisible()
    })

    it("não tem violações de acessibilidade aberto sem opções marcadas", async () => {
        renderModal()

        await expectNoAxeViolations(document.body)
    }, 15000)

    it("não tem violações de acessibilidade aberto com opções marcadas", async () => {
        renderModal({ applied: withSort({ tech: ["React"], year: ["2025"] }, "title") })

        await expectNoAxeViolations(document.body)
    }, 15000)

    describe("opções sem projeto", () => {
        const withEmpty = [
            { value: "Docker", count: 0 },
            { value: "React", count: 5 }
        ]

        it("desabilita a tecnologia com count 0, nomeia com (nenhum projeto) e não deixa marcar", async () => {
            const user = userEvent.setup()
            renderModal({ technologies: withEmpty })

            const docker = screen.getByRole("checkbox", { name: "Docker (nenhum projeto)" })

            expect(docker).toBeDisabled()
            await user.click(docker)
            expect(docker).not.toBeChecked()
            expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        })

        it("Tab pula a opção desabilitada", async () => {
            const user = userEvent.setup()
            renderModal({ technologies: withEmpty })

            screen.getByRole("radio", { name: "Mais recente" }).focus()
            await user.tab()

            expect(screen.getByRole("checkbox", { name: "React" })).toHaveFocus()
        })

        it("mantém a tecnologia com projeto habilitada e com o nome só do texto", () => {
            renderModal({ technologies: withEmpty })

            expect(screen.getByRole("checkbox", { name: "React" })).toBeEnabled()
            expect(screen.queryByRole("checkbox", { name: "React (nenhum projeto)" })).toBeNull()
        })

        it("desabilita o ano com count 0 e mantém os com projeto habilitados", () => {
            renderModal({
                years: [
                    { value: "2026", count: 1 },
                    { value: "2025", count: 0 },
                    { value: "2024", count: 2 }
                ]
            })

            expect(screen.getByRole("checkbox", { name: "2025 (nenhum projeto)" })).toBeDisabled()
            expect(screen.getByRole("checkbox", { name: "2026" })).toBeEnabled()
            expect(screen.getByRole("checkbox", { name: "2024" })).toBeEnabled()
        })

        it("mantém marcada e habilitada a opção com count 0 aplicada, que depois de desmarcada fica desabilitada", async () => {
            const user = userEvent.setup()
            renderModal({
                technologies: withEmpty,
                applied: withSort({ tech: ["Docker"], year: [] })
            })

            const docker = screen.getByRole("checkbox", { name: "Docker" })
            expect(docker).toBeChecked()
            expect(docker).toBeEnabled()

            await user.click(docker)

            const disabled = screen.getByRole("checkbox", { name: "Docker (nenhum projeto)" })
            expect(disabled).not.toBeChecked()
            expect(disabled).toBeDisabled()
            await user.click(disabled)
            expect(disabled).not.toBeChecked()
        })

        it("Limpar desmarca a opção com count 0 aplicada e a deixa desabilitada", async () => {
            const user = userEvent.setup()
            renderModal({
                technologies: withEmpty,
                applied: withSort({ tech: ["Docker"], year: [] })
            })

            await user.click(screen.getByRole("button", { name: "Limpar" }))

            expect(screen.getByRole("checkbox", { name: "Docker (nenhum projeto)" })).toBeDisabled()
        })

        it("mantém o valor aplicado fora do catálogo, conta no resumo e o envia junto com o marcado", async () => {
            const user = userEvent.setup()
            const onApply = vi.fn()
            renderModal({
                technologies: withEmpty,
                onApply,
                applied: withSort({ tech: ["Cobol"], year: [] })
            })

            expect(
                screen
                    .getAllByRole("checkbox")
                    .filter((box) => box instanceof HTMLInputElement && box.checked)
            ).toHaveLength(0)
            expect(screen.getByText("1 filtro selecionado")).toBeVisible()

            await user.click(screen.getByRole("checkbox", { name: "React" }))
            await user.click(screen.getByRole("button", { name: "Aplicar" }))

            expect(onApply).toHaveBeenCalledWith({
                tech: ["Cobol", "React"],
                year: [],
                sort: "recent"
            })
        })

        it.each([
            ["pt-BR", "Docker (nenhum projeto)"],
            ["en", "Docker (no projects)"],
            ["es", "Docker (ningún proyecto)"]
        ] as const)("nomeia a opção desabilitada em %s", async (language, name) => {
            await setLanguage(language)

            renderModal({ technologies: withEmpty })

            expect(screen.getByRole("checkbox", { name })).toBeDisabled()
            expect(document.body.textContent).not.toMatch(/\bfilters\.modal\.[a-zA-Z]+/)
        })

        it("não tem violações de acessibilidade com opções desabilitadas e marcadas", async () => {
            renderModal({
                technologies: withEmpty,
                years: [
                    { value: "2025", count: 0 },
                    { value: "2024", count: 2 }
                ],
                applied: withSort({ tech: ["React"], year: ["2024"] })
            })

            await expectNoAxeViolations(document.body)
        }, 15000)
    })
})
