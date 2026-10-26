import { readFileSync } from "node:fs"
import type { TestProject } from "vitest/node"
import installPublicFetch from "@scripts/prerender/installPublicFetch"
import render from "@/entry-server"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

const PROJECT_ID = "01a131df-93ee-72f3-8c7a-f67501e47a7a"
const PROJECT_README_ID = "01a131df-93ef-7e0d-9b54-0e725d9f9c4d"
const PROJECT_SETUP_ID = "01a131fc-1e60-7eeb-9495-8dbe3349a860"

function buildProjectTarget(lang: SupportedLanguage): PrerenderTarget {
    return {
        path: `${lang}/projects/${PROJECT_ID}`,
        file: `${lang}/projects/${PROJECT_ID}.html`,
        lang,
        pattern: "projects/:id",
        params: { id: PROJECT_ID, documentId: PROJECT_README_ID }
    }
}

const FIXTURE_TARGETS: PrerenderTarget[] = [
    { path: "pt-BR", file: "pt-BR.html", lang: "pt-BR", pattern: "" },
    { path: "en", file: "en.html", lang: "en", pattern: "" },
    { path: "pt-BR/projects", file: "pt-BR/projects.html", lang: "pt-BR", pattern: "projects" },
    buildProjectTarget("pt-BR"),
    buildProjectTarget("en"),
    buildProjectTarget("es"),
    {
        path: `pt-BR/projects/${PROJECT_ID}/docs/SETUP.md`,
        file: `pt-BR/projects/${PROJECT_ID}/docs/SETUP.md.html`,
        lang: "pt-BR",
        pattern: "projects/:id/docs/:name",
        params: { id: PROJECT_ID, name: "SETUP.md", documentId: PROJECT_SETUP_ID }
    },
    { path: "not-found", file: "404.html", lang: "en" }
]

async function setup(project: TestProject) {
    const { version } = JSON.parse(readFileSync("package.json", "utf-8"))
    Reflect.set(globalThis, "__BUILD_YEAR__", new Date().getFullYear())
    Reflect.set(globalThis, "__APP_VERSION__", version)
    const restoreFetch = installPublicFetch("/")
    const fixtures: { target: PrerenderTarget; result: PrerenderResult }[] = []

    try {
        for (const target of FIXTURE_TARGETS) {
            fixtures.push({ target, result: await render(target) })
        }
    } finally {
        restoreFetch()
    }

    project.provide("prerenderFixtures", fixtures)
}

export default setup
