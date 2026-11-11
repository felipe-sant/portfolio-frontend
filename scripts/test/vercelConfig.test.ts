import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type VercelRewrite = { source: string; destination: string }
type VercelConfig = {
    cleanUrls?: boolean
    trailingSlash?: boolean
    rewrites?: VercelRewrite[]
    headers?: unknown[]
}

const config: VercelConfig = JSON.parse(readFileSync("vercel.json", "utf-8"))
const deployWorkflow = readFileSync(".github/workflows/deploy.yml", "utf-8")

const hasJq = spawnSync("jq", ["--version"]).error === undefined

const NOINDEX_RULE = { source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }

const stagingExpression = /jq '([^']+)' vercel\.json > vercel\.staging\.json/.exec(
    deployWorkflow
)?.[1]

function applyStagingExpression(input: string): VercelConfig {
    expect(stagingExpression).toBeDefined()

    const merged = spawnSync("jq", [stagingExpression ?? ""], { input, encoding: "utf-8" })

    expect(merged.error).toBeUndefined()
    expect(merged.status).toBe(0)
    return JSON.parse(merged.stdout)
}

describe("vercel.json", () => {
    it("serve os HTML por rota sem extensão e sem barra final", () => {
        expect(config.cleanUrls).toBe(true)
        expect(config.trailingSlash).toBe(false)
    })

    it("não tem reescrita genérica para o index.html", () => {
        const catchAll = (config.rewrites ?? []).filter((rewrite) =>
            ["/(.*)", "/:path*", "/(.*)/"].includes(rewrite.source)
        )

        expect(catchAll).toEqual([])
    })

    it.skipIf(!hasJq)(
        "acrescenta o noindex da staging ao fim dos headers sem descartar nenhuma regra",
        () => {
            const staging = applyStagingExpression(readFileSync("vercel.json", "utf-8"))

            expect(staging.cleanUrls).toBe(true)
            expect(staging.trailingSlash).toBe(false)
            expect(staging.headers).toEqual([...(config.headers ?? []), NOINDEX_RULE])
        }
    )

    it.skipIf(!hasJq)("devolve só a regra de noindex quando o vercel.json não tem headers", () => {
        const staging = applyStagingExpression(JSON.stringify({ cleanUrls: true }))

        expect(staging.headers).toEqual([NOINDEX_RULE])
    })
})
