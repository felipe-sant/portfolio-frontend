import type { Page } from "@playwright/test"

function collectConsoleProblems(page: Page): string[] {
    const problems: string[] = []
    page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
            problems.push(message.text())
        }
    })
    page.on("pageerror", (error) => problems.push(error.message))
    return problems
}

export default collectConsoleProblems
