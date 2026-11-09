type ReportTest = {
    projectName: string
    results: { duration: number }[]
}

type ReportSpec = {
    title: string
    file: string
    tests: ReportTest[]
}

type ReportSuite = {
    specs?: ReportSpec[]
    suites?: ReportSuite[]
}

type Report = {
    suites?: ReportSuite[]
}

type Entry = {
    name: string
    duration: number
    count: number
}

type RankedTest = {
    title: string
    file: string
    projectName: string
    duration: number
}

function collectSpecs(suites: ReportSuite[]): ReportSpec[] {
    return suites.flatMap((suite) => [...(suite.specs ?? []), ...collectSpecs(suite.suites ?? [])])
}

function sumDurations(test: ReportTest): number {
    return test.results.reduce((total, result) => total + result.duration, 0)
}

function groupBy(tests: RankedTest[], key: (test: RankedTest) => string): Entry[] {
    const groups = new Map<string, Entry>()
    for (const test of tests) {
        const name = key(test)
        const entry = groups.get(name) ?? { name, duration: 0, count: 0 }
        entry.duration += test.duration
        entry.count += 1
        groups.set(name, entry)
    }
    return [...groups.values()].toSorted((first, second) => second.duration - first.duration)
}

function rankSlowTests(report: Report, limit: number) {
    const tests: RankedTest[] = collectSpecs(report.suites ?? []).flatMap((spec) =>
        spec.tests.map((test) => ({
            title: spec.title,
            file: spec.file,
            projectName: test.projectName,
            duration: sumDurations(test)
        }))
    )

    return {
        tests: tests.toSorted((first, second) => second.duration - first.duration).slice(0, limit),
        files: groupBy(tests, (test) => test.file),
        projects: groupBy(tests, (test) => test.projectName)
    }
}

export default rankSlowTests
