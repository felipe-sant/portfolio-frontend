const ALLOWED_SCHEME = /^(https?:|mailto:|project:)/i

function isAllowedMarkdownUrl(url: string): boolean {
    if (url.startsWith("#")) {
        return url.length > 1
    }

    const match = ALLOWED_SCHEME.exec(url)

    return match !== null && url.length > match[0].length
}

export default isAllowedMarkdownUrl
