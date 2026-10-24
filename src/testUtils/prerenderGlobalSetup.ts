import { readFileSync } from "node:fs"
import type { TestProject } from "vitest/node"
import installPublicFetch from "@scripts/prerender/installPublicFetch"
import render from "@/entry-server"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

const FIXTURE_TARGETS: PrerenderTarget[] = [
    { path: "pt-BR", file: "pt-BR.html", lang: "pt-BR", pattern: "" },
    { path: "en", file: "en.html", lang: "en", pattern: "" },
    { path: "not-found", file: "404.html", lang: "en", status: 404 }
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
