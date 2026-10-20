import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useTheme from "@/hooks/useTheme"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

type ChangeListener = () => void

function stubSystemTheme(initial: "light" | "dark") {
    let current = initial
    const listeners = new Set<ChangeListener>()

    vi.stubGlobal("matchMedia", () => ({
        get matches() {
            return current === "dark"
        },
        addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener)
    }))

    return (next: "light" | "dark") => {
        current = next
        listeners.forEach((listener) => listener())
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
    window.history.pushState({}, "", "/")
    document.documentElement.removeAttribute("data-theme-transition")
})

describe("useTheme", () => {
    it("segue o sistema em escuro sem escolha salva", () => {
        stubSystemTheme("dark")

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("dark")
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    })

    it("segue o sistema em claro sem escolha salva", () => {
        stubSystemTheme("light")

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("light")
        expect(document.documentElement).toHaveAttribute("data-theme", "light")
    })

    it("acompanha a mudança do sistema sem escolha salva", () => {
        const changeSystemTheme = stubSystemTheme("light")
        const { result } = renderHook(() => useTheme())

        act(() => changeSystemTheme("dark"))

        expect(result.current.theme).toBe("dark")
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    })

    it("aplica e salva a escolha de setTheme", () => {
        stubSystemTheme("light")
        const { result } = renderHook(() => useTheme())

        act(() => result.current.setTheme("dark"))

        expect(result.current.theme).toBe("dark")
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
    })

    it("alterna o tema e salva a escolha com toggleTheme", () => {
        stubSystemTheme("light")
        const { result } = renderHook(() => useTheme())

        act(() => result.current.toggleTheme())
        expect(result.current.theme).toBe("dark")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")

        act(() => result.current.toggleTheme())
        expect(result.current.theme).toBe("light")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
    })

    it("usa a escolha salva nas cargas seguintes", () => {
        stubSystemTheme("light")
        localStorage.setItem(THEME_STORAGE_KEY, "dark")

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("dark")
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
    })

    it("mantém a escolha quando o sistema muda", () => {
        const changeSystemTheme = stubSystemTheme("light")
        localStorage.setItem(THEME_STORAGE_KEY, "light")
        const { result } = renderHook(() => useTheme())

        act(() => changeSystemTheme("dark"))

        expect(result.current.theme).toBe("light")
        expect(document.documentElement).toHaveAttribute("data-theme", "light")
    })

    it("ignora o valor salvo inválido e segue o sistema", () => {
        stubSystemTheme("dark")
        localStorage.setItem(THEME_STORAGE_KEY, "blue")

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("dark")
    })

    it("ignora o parâmetro ?tema= da URL", () => {
        stubSystemTheme("light")
        window.history.pushState({}, "", "/?tema=dark")

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("light")
    })

    it("é light sem matchMedia", () => {
        vi.stubGlobal("matchMedia", undefined)

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("light")
    })

    it("não lança quando o localStorage lança", () => {
        stubSystemTheme("dark")
        vi.stubGlobal("localStorage", {
            getItem: () => {
                throw new Error("storage bloqueado")
            }
        })

        const { result } = renderHook(() => useTheme())

        expect(result.current.theme).toBe("dark")
    })
})

describe("useTheme crossfade", () => {
    it("não liga o atributo de transição na primeira renderização", () => {
        stubSystemTheme("light")

        renderHook(() => useTheme())

        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")
    })

    it("liga o atributo de transição ao trocar o tema", () => {
        stubSystemTheme("light")
        const { result } = renderHook(() => useTheme())

        act(() => result.current.setTheme("dark"))

        expect(document.documentElement).toHaveAttribute("data-theme-transition")
    })

    it("liga o atributo de transição ao alternar o tema", () => {
        stubSystemTheme("light")
        const { result } = renderHook(() => useTheme())

        act(() => result.current.toggleTheme())

        expect(document.documentElement).toHaveAttribute("data-theme-transition")
    })
})
