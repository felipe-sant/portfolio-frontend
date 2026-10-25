import { defineConfig, devices } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"

const origin = "http://localhost:4173"
const baseURL = `${origin}${FATEC_BASE_PATH}`

const mobile = { width: 390, height: 844 }
const desktop = { width: 1280, height: 800 }

function createProject(name: string, viewport: typeof mobile, colorScheme: "light" | "dark") {
    return {
        name,
        use: {
            ...devices["Desktop Chrome"],
            viewport,
            colorScheme,
            reducedMotion: "reduce" as const
        }
    }
}

export default defineConfig({
    testDir: "e2e",
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI
        ? [["list"], ["html", { open: "never" }]]
        : [["html", { open: "never" }]],
    use: { baseURL },
    webServer: {
        command: "npm run preview:fatec",
        url: baseURL,
        reuseExistingServer: !process.env.CI
    },
    projects: [
        createProject("mobile-light", mobile, "light"),
        createProject("mobile-dark", mobile, "dark"),
        createProject("desktop-light", desktop, "light"),
        createProject("desktop-dark", desktop, "dark")
    ]
})
