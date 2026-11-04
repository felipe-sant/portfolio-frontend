import type { Page } from "@playwright/test"
import UI_TEXTS from "./uiTexts"

type Language = keyof typeof UI_TEXTS

function getProjectsView(page: Page, language: Language) {
    const texts = UI_TEXTS[language].projects
    const main = page.getByRole("main")
    return {
        texts,
        main,
        heading: main.getByRole("heading", { level: 1 }),
        search: main.getByRole("searchbox", { name: texts.searchLabel }),
        filtersButton: main.getByRole("button", { name: new RegExp(`^${texts.filtersOpen}`) }),
        typeGroup: main.getByRole("group", { name: texts.typeGroup }),
        categoryGroup: main.getByRole("group", { name: texts.categoryGroup }),
        status: main.getByRole("status"),
        cards: main.getByRole("article"),
        cardLinks: main.getByRole("heading", { level: 2 }).getByRole("link"),
        loadMore: main.getByRole("button", { name: texts.loadMore }),
        clearFilters: main.getByRole("button", { name: texts.clearFilters }),
        alert: main.getByRole("alert"),
        dialog: page.getByRole("dialog")
    }
}

export default getProjectsView
