type ListedSpec = {
    title: string
    file: string
    line: number
    tests: { projectName: string }[]
}

type ListedSuite = {
    title?: string
    specs?: ListedSpec[]
    suites?: ListedSuite[]
}

type ListedReport = {
    suites?: ListedSuite[]
}

function collectSuite(suite: ListedSuite, path: string[]): string[] {
    const titles = suite.title ? [...path, suite.title] : path
    const own = (suite.specs ?? []).flatMap((spec) =>
        spec.tests.map(
            (test) =>
                `${test.projectName}|${spec.file}:${spec.line}|${[...titles, spec.title].join(" > ")}`
        )
    )
    return [...own, ...(suite.suites ?? []).flatMap((child) => collectSuite(child, titles))]
}

function listTestIds(report: ListedReport): string[] {
    return (report.suites ?? []).flatMap((suite) => collectSuite(suite, []))
}

export default listTestIds
