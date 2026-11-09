import type FlakyTest from "@/types/e2e/FlakyTest.types"

type Collected = { title: string; file: string; test: Record<string, unknown> }

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function asList(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
}

function asText(value: unknown): string {
    return typeof value === "string" ? value : ""
}

function collectTests(suites: unknown[]): Collected[] {
    return suites.filter(isRecord).flatMap((suite) => {
        const own = asList(suite.specs)
            .filter(isRecord)
            .flatMap((spec) =>
                asList(spec.tests)
                    .filter(isRecord)
                    .map((test) => ({ title: asText(spec.title), file: asText(spec.file), test }))
            )

        return [...own, ...collectTests(asList(suite.suites))]
    })
}

function isFlaky(test: Record<string, unknown>): boolean {
    if (test.status === "flaky") {
        return true
    }

    const statuses = asList(test.results)
        .filter(isRecord)
        .map((result) => result.status)

    return (
        statuses.length > 1 &&
        statuses.at(-1) === "passed" &&
        statuses.slice(0, -1).some((status) => status !== "passed" && status !== "skipped")
    )
}

function listFlakyTests(report: unknown): FlakyTest[] {
    if (!isRecord(report)) {
        return []
    }

    return collectTests(asList(report.suites))
        .filter(({ test }) => isFlaky(test))
        .map(({ title, file, test }) => ({ title, file, projectName: asText(test.projectName) }))
}

export default listFlakyTests
