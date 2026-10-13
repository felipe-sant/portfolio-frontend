import type Theme from "@/types/theme/Theme.types"

const THEME_COLORS: Record<Theme, string> = {
    light: "#fbf9f5",
    dark: "#141210"
}

function applyTheme(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme)

    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.removeAttribute("media")
        meta.setAttribute("content", THEME_COLORS[theme])
    })
}

export default applyTheme
