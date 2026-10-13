import axe from "axe-core"

async function expectNoAxeViolations(container: Element): Promise<void> {
    const { violations } = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } }
    })

    if (violations.length === 0) {
        return
    }

    const lines = violations.map((violation) => {
        const targets = violation.nodes.map((node) => node.target.join(" ")).join(", ")
        return `${violation.id}: ${violation.help} (${targets})`
    })

    throw new Error(`Violações de acessibilidade encontradas:\n${lines.join("\n")}`)
}

export default expectNoAxeViolations
