type Pull = {
    number: number
    title: string
    issues: number[]
}

type PromotionInput = {
    pulls: Pull[]
}

function byNumber(a: number, b: number) {
    return a - b
}

function buildIssueLines(pulls: Pull[]) {
    const pullsByIssue = new Map<number, number[]>()

    pulls.forEach((pull) => {
        pull.issues.forEach((issue) => {
            pullsByIssue.set(issue, [...(pullsByIssue.get(issue) ?? []), pull.number])
        })
    })

    return [...pullsByIssue.keys()].toSorted(byNumber).map((issue) => {
        const numbers = [...new Set(pullsByIssue.get(issue))].toSorted(byNumber)
        return `- #${issue} (${numbers.map((number) => `PR #${number}`).join(", ")})`
    })
}

function buildPullLines(pulls: Pull[]) {
    return pulls
        .filter((pull) => pull.issues.length === 0)
        .toSorted((a, b) => a.number - b.number)
        .map((pull) => `- PR #${pull.number}: ${pull.title}`)
}

function buildPromotionBody({ pulls }: PromotionInput) {
    const issueLines = buildIssueLines(pulls)
    const pullLines = buildPullLines(pulls)

    const changes = [
        "Issues incluídas:",
        "",
        ...(issueLines.length > 0 ? issueLines : ["Nenhuma issue vinculada."]),
        ...(pullLines.length > 0 ? ["", "PRs sem issue:", "", ...pullLines] : [])
    ]

    return [
        "## Descrição",
        "",
        "Promoção da `staging` para a `main` (produção), gerada por `promote.yml`.",
        "",
        "## Alterações",
        "",
        ...changes,
        "",
        "## Decisões técnicas",
        "",
        "Nenhuma.",
        "",
        "## Como testar",
        "",
        "1. Conferir os checks do push na `staging` (mesmo SHA deste PR).",
        "2. Conferir o beta da `staging` antes do merge.",
        "3. Mergear por commit de merge, nunca por squash.",
        "",
        "## Evidências",
        "",
        "Checks do push na `staging`.",
        "",
        "## Revisão humana",
        "",
        "- [ ] Revisão humana feita: li o diff e o que a IA gerou. O que li, testei ou corrigi à mão:",
        "- [ ] Mudança de tela: rodei localmente (`npm run dev`) e conferi o resultado no navegador.",
        "",
        "## Impactos e pontos de atenção",
        "",
        "Nenhum.",
        ""
    ].join("\n")
}

export default buildPromotionBody
