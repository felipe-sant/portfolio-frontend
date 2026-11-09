import { execFileSync } from "node:child_process"
import checkShardUnion from "@scripts/e2e/checkShardUnion"
import listTestIds from "@scripts/e2e/listTestIds"

const SHARDS = 4

function list(shard?: string): string[] {
    const args = ["playwright", "test", "--list", "--reporter=json"]
    if (shard) {
        args.push(`--shard=${shard}`)
    }
    const output = execFileSync("npx", args, {
        encoding: "utf-8",
        maxBuffer: 256 * 1024 * 1024,
        env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: "" }
    })
    return listTestIds(JSON.parse(output))
}

const all = list()
const shards = Array.from({ length: SHARDS }, (_, index) => list(`${index + 1}/${SHARDS}`))
const { missing, duplicated, extra } = checkShardUnion(all, shards)

console.log(`Total: ${all.length} testes`)
shards.forEach((ids, index) => console.log(`Fatia ${index + 1}/${SHARDS}: ${ids.length} testes`))

for (const [label, ids] of [
    ["Perdidos", missing],
    ["Duplicados", duplicated],
    ["Fora do total", extra]
] as const) {
    if (ids.length > 0) {
        console.error(`${label} (${ids.length}):`)
        ids.slice(0, 20).forEach((id) => console.error(`  ${id}`))
    }
}

if (missing.length + duplicated.length + extra.length > 0) {
    process.exit(1)
}
console.log("A união das fatias é igual à lista completa")
