import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import ResumePdfPages from "@/components/ResumePdfPages"
import setLanguage from "@/i18n/setLanguage"
import createFakePdf from "@/testUtils/createFakePdf"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import loadPdfRenderer from "@/utils/loadPdfRenderer"

vi.mock("@/utils/loadPdfRenderer", () => ({ default: vi.fn() }))

afterEach(() => {
    vi.mocked(loadPdfRenderer).mockReset()
})

describe("ResumePdfPages", () => {
    it("mostra o estado de carregamento e depois uma imagem por página", async () => {
        const fake = createFakePdf({ pages: 2, holdLoad: true })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando o currículo")
        expect(screen.queryByRole("img")).not.toBeInTheDocument()

        await waitFor(() => expect(fake.openDocument).toHaveBeenCalled())
        await act(async () => {
            fake.release()
        })

        expect(
            await screen.findByRole("img", { name: "Página 1 de 2 do currículo" })
        ).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Página 2 de 2 do currículo" })).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())
    })

    it("expõe uma região rolável nomeada e focável com a dica do texto", async () => {
        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf().openDocument)

        render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)

        const region = await screen.findByRole("region", { name: "Páginas do currículo" })
        await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())

        expect(region).toHaveAttribute("tabindex", "0")
        expect(
            screen.getByText("Prefere ler o texto? Use a versão em texto abaixo.")
        ).toBeInTheDocument()
    })

    it.each([
        [
            "o carregador rejeita",
            () => vi.mocked(loadPdfRenderer).mockRejectedValue(new Error("x"))
        ],
        [
            "getPage rejeita",
            () =>
                vi
                    .mocked(loadPdfRenderer)
                    .mockResolvedValue(createFakePdf({ failPageNumber: 1 }).openDocument)
        ],
        [
            "render rejeita",
            () =>
                vi
                    .mocked(loadPdfRenderer)
                    .mockResolvedValue(createFakePdf({ failRender: true }).openDocument)
        ]
    ])("mostra o texto de falha e nenhuma imagem quando %s", async (_name, arrange) => {
        arrange()

        render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)

        expect(
            await screen.findByText(
                "Não foi possível exibir o currículo aqui. Baixe o PDF ou leia a versão em texto."
            )
        ).toBeInTheDocument()
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(screen.queryByRole("region")).not.toBeInTheDocument()
    })

    it.each([
        ["en", "Page 1 of 2 of the resume", "Resume pages", "Loading the resume"],
        ["es", "Página 1 de 2 del currículum", "Páginas del currículum", "Cargando el currículum"]
    ] as const)(
        "traduz páginas, região e carregamento em %s",
        async (language, page, region, loading) => {
            await act(async () => {
                await setLanguage(language)
            })
            const fake = createFakePdf({ pages: 2, holdLoad: true })
            vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

            render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)

            expect(screen.getByRole("status")).toHaveTextContent(loading)
            await waitFor(() => expect(fake.openDocument).toHaveBeenCalled())
            await act(async () => {
                fake.release()
            })

            expect(await screen.findByRole("img", { name: page })).toBeInTheDocument()
            expect(screen.getByRole("region", { name: region })).toBeInTheDocument()
            expect(screen.queryByText(/resume\.modal/)).not.toBeInTheDocument()
        }
    )

    it("não tem violações de acessibilidade em carregando, pronto e erro", async () => {
        const loading = createFakePdf({ holdLoad: true })
        vi.mocked(loadPdfRenderer).mockResolvedValue(loading.openDocument)
        const first = render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)
        await expectNoAxeViolations(first.container)
        first.unmount()

        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf().openDocument)
        const second = render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)
        await screen.findByRole("region", { name: "Páginas do currículo" })
        await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())
        await expectNoAxeViolations(second.container)
        second.unmount()

        vi.mocked(loadPdfRenderer).mockRejectedValue(new Error("x"))
        const third = render(<ResumePdfPages url="/cv/cv-pt-BR.pdf" />)
        await screen.findByText(/Não foi possível exibir/)
        await expectNoAxeViolations(third.container)
    }, 15000)
})
