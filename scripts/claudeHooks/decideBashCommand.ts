type Token = { text: string; quoted: boolean }

type Decision = { blocked: boolean; message: string }

type ReadBranch = (directory?: string) => string

const ENVIRONMENT_BRANCHES = ["staging", "main"]
const SEPARATORS = new Set(["&", "|", ";", "\n", "(", ")", "`"])
const WRAPPERS = new Set(["sudo", "command", "time", "nohup", "env"])
const ALLOWED: Decision = { blocked: false, message: "" }

function splitSegments(command: string) {
    const segments: Token[][] = [[]]
    let text = ""
    let quoted = false
    let quote = ""
    let hasToken = false

    function endToken() {
        if (hasToken) {
            segments[segments.length - 1].push({ text, quoted })
        }
        text = ""
        quoted = false
        hasToken = false
    }

    for (let index = 0; index < command.length; index += 1) {
        const char = command[index]
        if (quote) {
            if (char === quote) {
                quote = ""
            } else {
                text += char
            }
        } else if (char === '"' || char === "'") {
            quote = char
            quoted = true
            hasToken = true
        } else if (char === "\\" && index + 1 < command.length) {
            index += 1
            text += command[index]
            hasToken = true
        } else if (SEPARATORS.has(char)) {
            endToken()
            segments.push([])
        } else if (char === " " || char === "\t") {
            endToken()
        } else {
            text += char
            hasToken = true
        }
    }
    endToken()
    return segments.filter((segment) => segment.length > 0)
}

function isFlag(token: Token) {
    return !token.quoted && token.text.startsWith("-") && token.text.length > 1
}

function isEnvironmentBranch(branch: string) {
    return ENVIRONMENT_BRANCHES.includes(branch)
}

function readBranchSafely(readBranch: ReadBranch, directory?: string) {
    try {
        return readBranch(directory)
    } catch {
        return ""
    }
}

function findCommandStart(tokens: Token[]) {
    let start = 0
    while (
        start < tokens.length &&
        (WRAPPERS.has(tokens[start].text) ||
            (!tokens[start].quoted && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[start].text)))
    ) {
        start += 1
    }
    return start
}

function destinationBranch(refspec: string) {
    const withoutForce = refspec.startsWith("+") ? refspec.slice(1) : refspec
    const destination = withoutForce.includes(":")
        ? withoutForce.slice(withoutForce.lastIndexOf(":") + 1)
        : withoutForce
    return destination.replace(/^refs\/heads\//, "")
}

function decideGit(tokens: Token[], readBranch: ReadBranch): Decision {
    let directory: string | undefined
    let cursor = 1
    while (cursor < tokens.length && isFlag(tokens[cursor])) {
        const flag = tokens[cursor].text
        if (flag === "-C" && cursor + 1 < tokens.length) {
            directory = tokens[cursor + 1].text
            cursor += 1
        } else if (flag === "-c") {
            cursor += 1
        }
        cursor += 1
    }
    const subcommand = tokens[cursor]?.text
    const rest = tokens.slice(cursor + 1)

    if (subcommand === "commit") {
        const branch = readBranchSafely(readBranch, directory)
        if (isEnvironmentBranch(branch)) {
            return {
                blocked: true,
                message: `Bloqueado: git commit na branch de ambiente "${branch}". Crie uma branch de trabalho a partir de origin/staging.`
            }
        }
        return ALLOWED
    }

    if (subcommand === "push") {
        if (
            rest.some(
                (token) => isFlag(token) && /^(--force|-[A-Za-z]*f[A-Za-z]*)$/.test(token.text)
            )
        ) {
            return {
                blocked: true,
                message:
                    "Bloqueado: git push com --force ou -f. Use --force-with-lease em branch de trabalho."
            }
        }
        const branch = readBranchSafely(readBranch, directory)
        if (isEnvironmentBranch(branch)) {
            return {
                blocked: true,
                message: `Bloqueado: git push com a branch de ambiente "${branch}" ativa. Envie só branches de trabalho e abra PR.`
            }
        }
        const refspecs = rest.filter((token) => !isFlag(token)).slice(1)
        const target = refspecs.find((token) => isEnvironmentBranch(destinationBranch(token.text)))
        if (target) {
            return {
                blocked: true,
                message: `Bloqueado: git push com destino "${destinationBranch(target.text)}", branch de ambiente. Abra PR em vez de enviar direto.`
            }
        }
    }

    return ALLOWED
}

function decideRm(tokens: Token[]): Decision {
    for (const token of tokens.slice(1)) {
        if (!token.quoted && token.text === "--") {
            break
        }
        if (isFlag(token) && /^(--recursive|-[A-Za-z]*[rR][A-Za-z]*)$/.test(token.text)) {
            return {
                blocked: true,
                message:
                    "Bloqueado: rm recursivo (-r, -R, --recursive). Apague os arquivos um a um."
            }
        }
    }
    return ALLOWED
}

function decideSegment(segment: Token[], readBranch: ReadBranch): Decision {
    const tokens = segment.slice(findCommandStart(segment))
    const name = tokens[0]?.text.split("/").pop()
    if (name === "git") {
        return decideGit(tokens, readBranch)
    }
    if (name === "rm") {
        return decideRm(tokens)
    }
    return ALLOWED
}

function decideBashCommand(command: unknown, readBranch: ReadBranch): Decision {
    if (typeof command !== "string" || command.trim() === "") {
        return ALLOWED
    }
    for (const segment of splitSegments(command)) {
        const decision = decideSegment(segment, readBranch)
        if (decision.blocked) {
            return decision
        }
    }
    return ALLOWED
}

export default decideBashCommand
