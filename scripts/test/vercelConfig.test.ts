import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type VercelHeader = { key: string; value: string }
type VercelHeaderRule = { source: string; headers: VercelHeader[] }
type VercelConfig = {
    cleanUrls?: boolean
    trailingSlash?: boolean
    headers?: VercelHeaderRule[]
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

const LONG_IMMUTABLE_CACHE = "public, max-age=31536000, immutable"

function headerValue(source: string, key: string): string | undefined {
    const rule = (config.headers ?? []).find((candidate) => candidate.source === source)

    return rule?.headers.find((header) => header.key.toLowerCase() === key.toLowerCase())?.value
}

describe("vercel.json", () => {
    it("serve os HTML por rota sem extensão e sem barra final", () => {
        expect(config.cleanUrls).toBe(true)
        expect(config.trailingSlash).toBe(false)
    })

    it("não tem reescrita nem rota, para caminho inexistente cair no 404.html", () => {
        expect(config).not.toHaveProperty("rewrites")
        expect(config).not.toHaveProperty("routes")
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

    it("só as regras de /assets, /fonts e /images definem Cache-Control", () => {
        const sourcesWithCache = (config.headers ?? [])
            .filter((rule) =>
                rule.headers.some((header) => header.key.toLowerCase() === "cache-control")
            )
            .map((rule) => rule.source)

        expect(sourcesWithCache).toEqual(["/assets/(.*)", "/fonts/(.*)", "/images/(.*)"])
    })

    it("guarda por um ano e como imutável os arquivos de /assets", () => {
        expect(headerValue("/assets/(.*)", "Cache-Control")).toBe(LONG_IMMUTABLE_CACHE)
    })

    it("guarda por um ano e como imutáveis as fontes de /fonts", () => {
        expect(headerValue("/fonts/(.*)", "Cache-Control")).toBe(LONG_IMMUTABLE_CACHE)
    })

    it("guarda por 30 dias, sem immutable, as imagens de /images", () => {
        const value = headerValue("/images/(.*)", "Cache-Control")

        expect(value).toBe("public, max-age=2592000")
        expect(value).not.toContain("immutable")
    })
})
