type ColorTokens = {
    background: string
    body: string
    detail: string
    accent: string
}

const TOKENS: Record<keyof ColorTokens, string> = {
    background: "--neutral-050",
    body: "--neutral-500",
    detail: "--neutral-900",
    accent: "--brand-primary"
}

function readRootBlock(css: string): string {
    const match = css.match(/:root\s*\{([^}]*)\}/)
    if (!match) {
        throw new Error("Bloco :root não encontrado no CSS")
    }
    return match[1]
}

function readToken(block: string, token: string): string {
    const match = block.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`))
    if (!match) {
        throw new Error(`Token ${token} não encontrado no :root`)
    }
    return match[1]
}

function readColorTokens(css: string): ColorTokens {
    const block = readRootBlock(css)

    return {
        background: readToken(block, TOKENS.background),
        body: readToken(block, TOKENS.body),
        detail: readToken(block, TOKENS.detail),
        accent: readToken(block, TOKENS.accent)
    }
}

export default readColorTokens
