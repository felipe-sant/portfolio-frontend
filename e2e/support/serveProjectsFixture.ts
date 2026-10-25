import type { Page } from "@playwright/test"
import buildProjectsFixture from "./buildProjectsFixture"

async function serveProjectsFixture(page: Page, language: string, count: number) {
    const fixture = buildProjectsFixture(language, count)
    await page.route(`**/content/${language}/projects.json`, (route) =>
        route.fulfill({ contentType: "application/json", body: fixture.body })
    )
    return fixture.projects
}

export default serveProjectsFixture
