import { readFileSync } from "node:fs"
import rankSlowTests from "@scripts/e2e/rankSlowTests"

const DEFAULT_REPORT = "e2e-timings/report.json"
const TOP_TESTS = 20

function formatSeconds(duration: number): string {
    return `${(duration / 1000).toFixed(1)}s`
}

function printEntries(title: string, entries: { name: string; duration: number; count: number }[]) {
    console.log(`\n${title}`)
    for (const entry of entries) {
        console.log(
            `${formatSeconds(entry.duration).padStart(9)}  ${entry.count} testes  ${entry.name}`
        )
    }
}

const report = JSON.parse(readFileSync(process.argv[2] ?? DEFAULT_REPORT, "utf-8"))
const { tests, files, projects } = rankSlowTests(report, TOP_TESTS)

console.log(`Os ${TOP_TESTS} testes mais lentos`)
for (const test of tests) {
    console.log(
        `${formatSeconds(test.duration).padStart(9)}  [${test.projectName}] ${test.file} › ${test.title}`
    )
}
printEntries("Tempo por arquivo", files)
printEntries("Tempo por projeto", projects)
