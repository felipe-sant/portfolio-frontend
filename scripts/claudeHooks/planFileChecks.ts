type CheckStep = { command: "prettier" | "oxlint"; args: string[] }

const LINTED_EXTENSIONS = [".ts", ".tsx"]
const FORMATTED_EXTENSIONS = [".css", ".json", ".md", ".yml", ".html"]
const LINT_IGNORED_FRAGMENT = "/docs/design/prototype/"

function planFileChecks(filePath: unknown, exists: (path: string) => boolean): CheckStep[] {
    if (typeof filePath !== "string" || !exists(filePath)) {
        return []
    }
    const extension = filePath.slice(filePath.lastIndexOf("."))
    const isLinted = LINTED_EXTENSIONS.includes(extension)
    if (!isLinted && !FORMATTED_EXTENSIONS.includes(extension)) {
        return []
    }
    const plan: CheckStep[] = [{ command: "prettier", args: ["--write", filePath] }]
    if (isLinted && !filePath.includes(LINT_IGNORED_FRAGMENT)) {
        plan.push({ command: "oxlint", args: [filePath] })
    }
    return plan
}

export default planFileChecks
