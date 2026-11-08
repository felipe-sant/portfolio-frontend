import { defineConfig, devices } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import specClassification from "./e2e/support/specClassification"

const baseURL = `http://localhost:4173${FATEC_BASE_PATH}`
const formBaseURL = `http://localhost:4174${FATEC_BASE_PATH}`
const formSpec = "contact-form.spec.ts"

const mobile = { width: 390, height: 844 }
const desktop = { width: 1280, height: 800 }

function createProject(name: string, viewport: typeof mobile, colorScheme: "light" | "dark") {
    return {
        name,
        testMatch: specClassification.perEnvironmentSpecs,
        testIgnore: formSpec,
        use: {
            ...devices["Desktop Chrome"],
            viewport,
            colorScheme,
            reducedMotion: "reduce" as const
        }
    }
}

const independentProject = {
    name: "independent",
    testMatch: specClassification.independentSpecs,
    use: {
        ...devices["Desktop Chrome"],
        viewport: desktop,
        colorScheme: "light" as const,
        reducedMotion: "reduce" as const
    }
}

function createFormProject(name: string, viewport: typeof mobile, colorScheme: "light" | "dark") {
    return {
        name,
        testMatch: formSpec,
        use: {
            ...devices["Desktop Chrome"],
            viewport,
            colorScheme,
            reducedMotion: "reduce" as const,
            baseURL: formBaseURL
        }
    }
}

export default defineConfig({
    testDir: "e2e",
    forbidOnly: Boolean(process.env.CI),
    fullyParallel: true,
    workers: process.env.CI ? 4 : undefined,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI
        ? [["list"], ["html", { open: "never" }]]
        : [["html", { open: "never" }]],
    use: { baseURL },
    webServer: [
        {
            command: "npm run preview:fatec",
            url: baseURL,
            reuseExistingServer: !process.env.CI
        },
        {
            command: "npm run preview:fatec",
            port: 4174,
            env: { PREVIEW_DIR: "dist-form", PREVIEW_PORT: "4174" },
            reuseExistingServer: !process.env.CI
        }
    ],
    projects: [
        createProject("mobile-light", mobile, "light"),
        createProject("mobile-dark", mobile, "dark"),
        createProject("desktop-light", desktop, "light"),
        createProject("desktop-dark", desktop, "dark"),
        independentProject,
        createFormProject("contact-form-mobile-light", mobile, "light"),
        createFormProject("contact-form-mobile-dark", mobile, "dark"),
        createFormProject("contact-form-desktop-light", desktop, "light"),
        createFormProject("contact-form-desktop-dark", desktop, "dark")
    ]
})
