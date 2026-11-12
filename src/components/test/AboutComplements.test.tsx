import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutComplements from "@/components/AboutComplements"
import buildProfile from "@/testUtils/buildProfile"
import buildTimeline from "@/testUtils/buildTimeline"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type AboutProfileState from "@/types/about/AboutProfileState.types"
import type AboutTimelineState from "@/types/about/AboutTimelineState.types"

const profileData = buildProfile()
const timelineData = buildTimeline()

interface RenderOptions {
    profile?: Partial<AboutProfileState>
    timeline?: Partial<AboutTimelineState>
    showCertificates?: boolean
    showWorkStyle?: boolean
}

function renderComplements({
    profile = {},
    timeline = {},
    showCertificates = true,
    showWorkStyle = true
}: RenderOptions = {}) {
    return render(
        <AboutComplements
            profile={{
                data: profileData,
                isLoading: false,
                isError: false,
                retry: vi.fn(),
                ...profile
            }}
            timeline={{
                groups: timelineData.groups,
                certificates: timelineData.certificates,
                isLoading: false,
                isError: false,
                retry: vi.fn(),
                ...timeline
            }}
            workPrinciples={profileData.workPrinciples}
            showCertificates={showCertificates}
            showWorkStyle={showWorkStyle}
        />
    )
}

describe("AboutComplements", () => {
    it("mostra certificados e jeito de trabalhar", () => {
        renderComplements()

        expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2)
        expect(screen.getByText("AWS Cloud Practitioner")).toBeInTheDocument()
        expect(screen.getByText("Escrevo o teste junto com o código")).toBeInTheDocument()
    })

    it("rotula a seção pelos títulos das colunas visíveis", () => {
        renderComplements({ showCertificates: false })

        expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1)
        expect(screen.getByRole("region")).toHaveAttribute(
            "aria-labelledby",
            "about-work-style-heading"
        )
    })

    it("esconde os itens de cada coluna enquanto a sua fonte carrega", () => {
        renderComplements({ timeline: { isLoading: true, certificates: [] } })

        expect(screen.queryByText("AWS Cloud Practitioner")).not.toBeInTheDocument()
        expect(screen.getByText("Escrevo o teste junto com o código")).toBeInTheDocument()
    })

    it("mostra o erro da coluna sem anunciar", () => {
        renderComplements({ profile: { isError: true, data: undefined } })

        expect(
            screen.getByText("Não foi possível carregar esta parte da página.")
        ).toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it.each([
        {},
        { timeline: { isLoading: true, certificates: [] } },
        { profile: { isError: true, data: undefined } }
    ])("não tem violações de acessibilidade com %o", async (options) => {
        const { container } = renderComplements(options)

        await expectNoAxeViolations(container)
    })
})
