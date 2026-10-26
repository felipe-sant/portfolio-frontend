import { afterEach, describe, expect, it, vi } from "vitest"
import { hydrateRoot } from "react-dom/client"
import { act, renderHook } from "@testing-library/react"
import useHasHydrated from "@/hooks/useHasHydrated"

const seen: boolean[] = []

function Probe() {
    const hasHydrated = useHasHydrated()
    seen.push(hasHydrated)

    return <p>{hasHydrated ? "client" : "server"}</p>
}

afterEach(() => {
    seen.length = 0
    vi.restoreAllMocks()
})

describe("useHasHydrated", () => {
    it("devolve true numa renderização no cliente sem hidratação", () => {
        const { result } = renderHook(() => useHasHydrated())

        expect(result.current).toBe(true)
    })

    it("devolve false durante a hidratação e true logo depois, sem aviso", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const container = document.createElement("div")
        container.innerHTML = "<p>server</p>"
        document.body.appendChild(container)

        let root: ReturnType<typeof hydrateRoot> | undefined
        await act(async () => {
            root = hydrateRoot(container, <Probe />)
        })

        expect(seen[0]).toBe(false)
        expect(seen.at(-1)).toBe(true)
        expect(container.textContent).toBe("client")
        expect(errorSpy).not.toHaveBeenCalled()

        act(() => root?.unmount())
        container.remove()
    })
})
