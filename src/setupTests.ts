import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import i18n from "@/i18n/i18n"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

beforeEach(async () => {
    if (typeof localStorage !== "undefined") {
        localStorage.removeItem(LANGUAGE_STORAGE_KEY)
        localStorage.removeItem(THEME_STORAGE_KEY)
    }
    if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-theme")
    }
    await i18n.changeLanguage("pt-BR")
})

afterEach(cleanup)
