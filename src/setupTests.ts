import "@testing-library/jest-dom/vitest"
import { configure } from "@testing-library/dom"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import addStaticResources from "@/i18n/addStaticResources"
import i18n from "@/i18n/i18n"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import clearContentCache from "@/services/content/clearContentCache"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

configure({ asyncUtilTimeout: 10000 })

beforeEach(async () => {
    if (typeof Element !== "undefined") {
        Element.prototype.scrollIntoView = () => undefined
    }
    clearContentCache()
    if (typeof localStorage !== "undefined") {
        localStorage.removeItem(LANGUAGE_STORAGE_KEY)
        localStorage.removeItem(THEME_STORAGE_KEY)
    }
    if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-theme")
    }
    addStaticResources()
    await i18n.changeLanguage("pt-BR")
})

afterEach(cleanup)
