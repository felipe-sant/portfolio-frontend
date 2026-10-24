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

const NOINDEX_HEADERS = [{ source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }]

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

    it("mantém as chaves quando o deploy da staging acrescenta o noindex", () => {
        expect(deployWorkflow).toContain("jq '. + {headers:")

        const staging = { ...config, headers: NOINDEX_HEADERS }

        expect(staging.cleanUrls).toBe(true)
        expect(staging.trailingSlash).toBe(false)
        expect(staging.headers).toEqual(NOINDEX_HEADERS)
    })
})
