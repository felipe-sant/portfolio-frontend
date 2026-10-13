import THEMES from "@/enum/themes.enum"
import type Theme from "@/types/theme/Theme.types"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

function readStoredTheme(): Theme | undefined {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)

        return THEMES.find((theme) => theme === stored)
    } catch {
        return undefined
    }
}

export default readStoredTheme
