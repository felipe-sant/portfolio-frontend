import { afterEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useAboutRetryFocus from "@/pages/hooks/useAboutRetryFocus"
import aboutElementIds from "@/utils/aboutElementIds"

type Sources = Parameters<typeof useAboutRetryFocus>[0]

function buildSources(overrides: Partial<Sources> = {}): Sources {
    return {
        profile: { isFetching: false, isError: false, refetch: vi.fn(async () => undefined) },
        timeline: { isFetching: false, isError: false, refetch: vi.fn(async () => undefined) },
        ...overrides
    }
}

function appendFocusable(id: string) {
    const element = document.createElement("div")
    element.id = id
    element.tabIndex = -1
    document.body.appendChild(element)

    return element
}

function renderRetryFocus(initial: Sources) {
    return renderHook((sources: Sources) => useAboutRetryFocus(sources), {
        initialProps: initial
    })
}

afterEach(() => {
    document.body.innerHTML = ""
})

describe("useAboutRetryFocus", () => {
    it("refaz só o perfil no retryProfile e só a trajetória no retryTimeline", async () => {
        const sources = buildSources()
        const { result } = renderRetryFocus(sources)

        await act(() => result.current.retryProfile())

        expect(sources.profile.refetch).toHaveBeenCalledTimes(1)
        expect(sources.timeline.refetch).not.toHaveBeenCalled()

        await act(() => result.current.retryTimeline())

        expect(sources.profile.refetch).toHaveBeenCalledTimes(1)
        expect(sources.timeline.refetch).toHaveBeenCalledTimes(1)
    })

    it("foca o título da fonte quando o retry termina sem erro", async () => {
        const heading = appendFocusable(aboutElementIds.timelineHeading)
        const { result } = renderRetryFocus(buildSources())

        await act(() => result.current.retryTimeline())

        expect(heading).toHaveFocus()
    })

    it("foca o alerta da fonte quando o retry termina com erro", async () => {
        const alert = appendFocusable(aboutElementIds.profileAlert)
        const heading = appendFocusable(aboutElementIds.profileHeading)
        const sources = buildSources()
        const { result, rerender } = renderRetryFocus(sources)
        rerender({ ...sources, profile: { ...sources.profile, isError: true } })

        await act(() => result.current.retryProfile())

        expect(alert).toHaveFocus()
        expect(heading).not.toHaveFocus()
    })

    it("não foca com a fonte buscando e foca quando a busca termina", async () => {
        const heading = appendFocusable(aboutElementIds.profileHeading)
        const sources = buildSources()
        const { result, rerender } = renderRetryFocus(sources)
        rerender({ ...sources, profile: { ...sources.profile, isFetching: true } })

        await act(() => result.current.retryProfile())

        expect(heading).not.toHaveFocus()

        rerender({ ...sources, profile: { ...sources.profile, isFetching: false } })

        expect(heading).toHaveFocus()
    })

    it("não foca nem trata o retry enquanto o elemento não existe e foca uma vez quando ele aparece", async () => {
        const sources = buildSources()
        const { result, rerender } = renderRetryFocus(sources)

        await act(() => result.current.retryTimeline())

        const heading = appendFocusable(aboutElementIds.timelineHeading)

        expect(heading).not.toHaveFocus()

        rerender({ ...sources, timeline: { ...sources.timeline, isFetching: true } })
        rerender({ ...sources, timeline: { ...sources.timeline, isFetching: false } })

        expect(heading).toHaveFocus()

        heading.blur()
        rerender({ ...sources, timeline: { ...sources.timeline, isFetching: true } })
        rerender({ ...sources, timeline: { ...sources.timeline, isFetching: false } })

        expect(heading).not.toHaveFocus()
    })

    it("não refoca depois de tratado quando a outra fonte volta a buscar", async () => {
        const heading = appendFocusable(aboutElementIds.timelineHeading)
        const sources = buildSources()
        const { result, rerender } = renderRetryFocus(sources)

        await act(() => result.current.retryTimeline())
        expect(heading).toHaveFocus()
        heading.blur()

        rerender({ ...sources, profile: { ...sources.profile, isFetching: true } })
        rerender({ ...sources, profile: { ...sources.profile, isFetching: false } })

        expect(heading).not.toHaveFocus()
    })
})
