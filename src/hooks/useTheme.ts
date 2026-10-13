import { useCallback, useEffect, useSyncExternalStore } from "react"
import type Theme from "@/types/theme/Theme.types"
import applyTheme from "@/utils/applyTheme"
import getSystemTheme from "@/utils/getSystemTheme"
import readStoredTheme from "@/utils/readStoredTheme"
import saveTheme from "@/utils/saveTheme"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)"

const listeners = new Set<() => void>()

function notifyListeners() {
    listeners.forEach((listener) => listener())
}

function subscribe(onChange: () => void) {
    listeners.add(onChange)

    const mediaQuery =
        typeof window.matchMedia === "function" ? window.matchMedia(SYSTEM_THEME_QUERY) : undefined
    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === THEME_STORAGE_KEY) {
            onChange()
        }
    }

    mediaQuery?.addEventListener("change", onChange)
    window.addEventListener("storage", handleStorage)

    return () => {
        listeners.delete(onChange)
        mediaQuery?.removeEventListener("change", onChange)
        window.removeEventListener("storage", handleStorage)
    }
}

function getSnapshot(): Theme {
    return readStoredTheme() ?? getSystemTheme()
}

function getServerSnapshot(): Theme {
    return "light"
}

function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const setTheme = useCallback((next: Theme) => {
        saveTheme(next)
        notifyListeners()
    }, [])

    const toggleTheme = useCallback(() => {
        setTheme(getSnapshot() === "dark" ? "light" : "dark")
    }, [setTheme])

    return { theme, setTheme, toggleTheme }
}

export default useTheme
