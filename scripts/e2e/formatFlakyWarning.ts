type FlakyTest = {
    title: string
    file: string
    projectName: string
}

function formatFlakyWarning(flaky: FlakyTest[]): string {
    if (flaky.length === 0) {
        return ""
    }

    const noun = flaky.length === 1 ? "teste flaky" : "testes flaky"
    const lines = flaky.map((test) => `- [${test.projectName}] ${test.file} › ${test.title}`)

    return [
        `### Atenção: ${flaky.length} ${noun} no E2E`,
        "",
        "Passaram só na nova tentativa. Reproduza com `--repeat-each` e `--retries=0` antes de seguir.",
        "",
        ...lines,
        ""
    ].join("\n")
}

export default formatFlakyWarning
