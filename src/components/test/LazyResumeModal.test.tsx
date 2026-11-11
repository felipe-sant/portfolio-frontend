import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import LazyResumeModal from "@/components/LazyResumeModal"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const moduleState = vi.hoisted(() => {
    const { promise, resolve } = Promise.withResolvers<void>()

    return { evaluations: 0, ready: promise, release: resolve }
})

vi.mock("@/components/ResumeModal", async (importOriginal) => {
    moduleState.evaluations += 1
    await moduleState.ready

    return importOriginal()
})

vi.mock("@/utils/loadPdfRenderer", () => ({ default: vi.fn() }))

const SOURCE_ROOT = join(process.cwd(), "src")

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return entry.name === "test" ? [] : listSources(path)
        }

        return /\.tsx?$/.test(entry.name) ? [path] : []
    })
}

function renderWithSibling(isOpen: boolean) {
    return render(
        <>
            <p>{"Conteúdo da página"}</p>
            <LazyResumeModal isOpen={isOpen} onClose={vi.fn()} />
        </>
    )
}

describe("LazyResumeModal", () => {
    it("fechado desde o início não renderiza nada nem importa o ResumeModal", () => {
        renderWithSibling(false)

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(moduleState.evaluations).toBe(0)
    })

    it("mantém o resto da página visível enquanto o modal carrega", async () => {
        renderWithSibling(true)

        expect(screen.getByText("Conteúdo da página")).toBeVisible()
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        await act(async () => {
            moduleState.release()
        })

        expect(await screen.findByRole("dialog", { name: "Currículo" })).toBeInTheDocument()
        expect(screen.getByText("Conteúdo da página")).toBeVisible()
    })

    it("abre o diálogo Currículo quando isOpen passa a true", async () => {
        moduleState.release()
        const { rerender } = renderWithSibling(false)

        rerender(<LazyResumeModal isOpen onClose={vi.fn()} />)

        expect(await screen.findByRole("dialog", { name: "Currículo" })).toBeInTheDocument()
    })

    it("abrir, fechar e abrir de novo importa o módulo uma vez e esconde o diálogo ao fechar", async () => {
        moduleState.release()
        const onClose = vi.fn()
        const { rerender } = render(<LazyResumeModal isOpen onClose={onClose} />)
        await screen.findByRole("dialog", { name: "Currículo" })

        rerender(<LazyResumeModal isOpen={false} onClose={onClose} />)
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        rerender(<LazyResumeModal isOpen onClose={onClose} />)
        expect(screen.getByRole("dialog", { name: "Currículo" })).toBeInTheDocument()
        expect(moduleState.evaluations).toBe(1)
    })

    it("não tem violações de acessibilidade com o modal aberto", async () => {
        moduleState.release()
        const { container } = renderWithSibling(true)
        await screen.findByRole("dialog", { name: "Currículo" })

        await expectNoAxeViolations(container)
    })

    it("é o único arquivo de src fora dos testes que importa o ResumeModal", () => {
        const importers = listSources(SOURCE_ROOT)
            .filter((path) => readFileSync(path, "utf-8").includes('"@/components/ResumeModal"'))
            .map((path) => relative(SOURCE_ROOT, path))

        expect(importers).toEqual(["components/LazyResumeModal.tsx"])
    })
})
