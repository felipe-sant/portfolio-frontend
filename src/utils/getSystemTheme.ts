import type Theme from "@/types/theme/Theme.types"

function getSystemTheme(): Theme {
    if (typeof window.matchMedia !== "function") {
        return "light"
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export default getSystemTheme
