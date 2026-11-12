const ROOT_HEAD_ITEMS = [
    /<link rel="canonical"[^>]*>/g,
    /<link rel="alternate" hreflang="[^"]*"[^>]*>/g,
    /<meta property="og:[^"]*"[^>]*>/g
]
const ROOT_NOSCRIPT = /<noscript data-root>[\s\S]*?<\/noscript\s*>/

function removeRootPageItems(html: string): string {
    return ROOT_HEAD_ITEMS.reduce(
        (result, pattern) => result.replace(pattern, () => ""),
        html
    ).replace(ROOT_NOSCRIPT, () => "<noscript></noscript>")
}

export default removeRootPageItems
