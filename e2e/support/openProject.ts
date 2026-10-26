import type { Page } from "@playwright/test"
import projectPath from "./projectPath"
import readProjectDetail from "./readProjectDetail"
import waitForHydration from "./waitForHydration"

type Language = "pt-BR" | "en" | "es"

async function openProject(page: Page, language: Language, title: string, documentName?: string) {
    const project = readProjectDetail(language, title)
    await page.goto(projectPath(language, project.id, documentName))
    await page.getByRole("heading", { level: 1 }).waitFor()
    await waitForHydration(page)
    return project
}

export default openProject
