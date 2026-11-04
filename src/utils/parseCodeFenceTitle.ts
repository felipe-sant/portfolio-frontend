const TITLE_PATTERN = /(?:^|\s)title="([^"]+)"/

function parseCodeFenceTitle(meta: string | null | undefined): string | undefined {
    return meta ? TITLE_PATTERN.exec(meta)?.[1] : undefined
}

export default parseCodeFenceTitle
