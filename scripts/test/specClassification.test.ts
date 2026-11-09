// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import specClassification from "@scripts/../e2e/support/specClassification"

const { perEnvironmentSpecs, independentSpecs } = specClassification

const E2E_DIRECTORY = "e2e"
const REQUIRED_PER_ENVIRONMENT = [
    "accessibility.spec.ts",
    "theme.spec.ts",
    "navigation.spec.ts",
    "contact-form.spec.ts",
    "resume.spec.ts",
    "projects-filters.spec.ts",
    "project-gallery.spec.ts"
]
const ENVIRONMENT_KEYWORDS = [
    "expectNoAxeViolations",
    "emulateMedia",
    "setViewportSize",
    "testInfo",
    "test.skip(",
    "viewportSize",
    "test.fail("
]

function listSpecFiles(): string[] {
    return readdirSync(E2E_DIRECTORY).filter((name) => name.endsWith(".spec.ts"))
}

function readSpec(name: string): string {
    return readFileSync(`${E2E_DIRECTORY}/${name}`, "utf-8")
}

function usesEnvironment(name: string): boolean {
    const content = readSpec(name)
    return ENVIRONMENT_KEYWORDS.some((keyword) => content.includes(keyword))
}

describe("specClassification", () => {
    it("coloca todo spec de e2e em exatamente uma lista", () => {
        const unclassified = listSpecFiles().filter(
            (name) =>
                Number(perEnvironmentSpecs.includes(name)) +
                    Number(independentSpecs.includes(name)) !==
                1
        )

        expect(unclassified).toEqual([])
    })

    it("não cita arquivo inexistente nas listas", () => {
        const existing = listSpecFiles()
        const missing = [...perEnvironmentSpecs, ...independentSpecs].filter(
            (name) => !existing.includes(name)
        )

        expect(missing).toEqual([])
    })

    it("mantém por ambiente os specs obrigatórios", () => {
        const missing = REQUIRED_PER_ENVIRONMENT.filter(
            (name) => !perEnvironmentSpecs.includes(name)
        )

        expect(missing).toEqual([])
    })

    it("mantém por ambiente todo spec que verifica acessibilidade, mídia, viewport ou projeto", () => {
        const misplaced = listSpecFiles().filter(
            (name) => usesEnvironment(name) && !perEnvironmentSpecs.includes(name)
        )

        expect(misplaced).toEqual([])
    })

    it("não deixa spec que depende do ambiente na lista de independentes", () => {
        const misplaced = independentSpecs.filter(usesEnvironment)

        expect(misplaced).toEqual([])
    })
})
