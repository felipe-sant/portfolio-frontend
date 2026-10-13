import type Theme from "@/types/theme/Theme.types"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

function saveTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
        return
    }
}

export default saveTheme
