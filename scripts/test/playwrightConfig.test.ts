// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import specClassification from "@scripts/../e2e/support/specClassification"

vi.mock("@playwright/test", () => ({
    defineConfig: (config: unknown) => config,
    devices: { "Desktop Chrome": { userAgent: "desktop-chrome" } }
}))

async function loadConfig(ci: string | undefined) {
    vi.resetModules()
    if (ci === undefined) {
        vi.stubEnv("CI", "")
    } else {
        vi.stubEnv("CI", ci)
    }
    return (await import("@scripts/../playwright.config")).default
}

function reporterNames(reporter: unknown): string[] {
    if (!Array.isArray(reporter)) {
        return []
    }
    return reporter.map((entry) => (Array.isArray(entry) ? String(entry[0]) : String(entry)))
}

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("playwright.config", () => {
    it("liga fullyParallel em qualquer ambiente", async () => {
        expect((await loadConfig("1")).fullyParallel).toBe(true)
        expect((await loadConfig(undefined)).fullyParallel).toBe(true)
    })

    it("define workers numérico no CI", async () => {
        const { workers } = await loadConfig("1")

        expect(typeof workers).toBe("number")
    })

    it("mantém o padrão do Playwright para workers fora do CI", async () => {
        expect((await loadConfig(undefined)).workers).toBeUndefined()
    })

    it("limita os quatro projetos de ambiente aos specs por ambiente, sem o formulário", async () => {
        const { projects } = await loadConfig(undefined)
        const environmentProjects = projects?.filter((project) =>
            ["mobile-light", "mobile-dark", "desktop-light", "desktop-dark"].includes(
                project.name ?? ""
            )
        )

        expect(environmentProjects).toHaveLength(4)
        for (const project of environmentProjects ?? []) {
            expect(project.testMatch).toEqual(specClassification.perEnvironmentSpecs)
            expect(project.testIgnore).toBe("contact-form.spec.ts")
        }
    })

    it("define um único projeto independent em desktop, tema claro e movimento reduzido", async () => {
        const { projects } = await loadConfig(undefined)
        const independentProjects = projects?.filter((project) => project.name === "independent")

        expect(independentProjects).toHaveLength(1)
        expect(independentProjects?.[0].testMatch).toEqual(specClassification.independentSpecs)
        expect(independentProjects?.[0].use).toMatchObject({
            viewport: { width: 1280, height: 800 },
            colorScheme: "light",
            reducedMotion: "reduce"
        })
    })

    it("mantém os quatro projetos do formulário na porta 4174", async () => {
        const { projects } = await loadConfig(undefined)
        const formProjects = projects?.filter((project) =>
            project.name?.startsWith("contact-form-")
        )

        expect(formProjects).toHaveLength(4)
        for (const project of formProjects ?? []) {
            expect(project.testMatch).toBe("contact-form.spec.ts")
            expect(project.use?.baseURL).toContain("localhost:4174")
        }
    })

    it("usa uma tentativa extra no CI e nenhuma fora dele", async () => {
        expect((await loadConfig("1")).retries).toBe(1)
        expect((await loadConfig(undefined)).retries).toBe(0)
    })

    it("usa list e blob no CI, sem html", async () => {
        const names = reporterNames((await loadConfig("1")).reporter)

        expect(names).toContain("list")
        expect(names).toContain("blob")
        expect(names).not.toContain("html")
    })

    it("usa só html fora do CI", async () => {
        expect(reporterNames((await loadConfig(undefined)).reporter)).toEqual(["html"])
    })

    it("mantém workers, fullyParallel e retries do CI", async () => {
        expect(await loadConfig("1")).toMatchObject({
            workers: 4,
            fullyParallel: true,
            retries: 1
        })
    })

    it("não define shard no config", async () => {
        expect((await loadConfig("1")).shard).toBeUndefined()
        expect((await loadConfig(undefined)).shard).toBeUndefined()
    })
})
