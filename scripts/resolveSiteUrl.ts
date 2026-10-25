function resolveSiteUrl(value: string | undefined): string {
    const trimmed = (value ?? "").trim()

    if (trimmed === "") {
        throw new Error(
            "VITE_SITE_URL ausente ou vazia. Defina a origem pública do site, por exemplo https://felipe-sant.vercel.app."
        )
    }

    let url: URL

    try {
        url = new URL(trimmed)
    } catch {
        throw new Error(`VITE_SITE_URL inválida: "${trimmed}". Use uma URL http ou https.`)
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`VITE_SITE_URL inválida: "${trimmed}". Use uma URL http ou https.`)
    }

    if (url.pathname !== "/" || url.search !== "" || url.hash !== "" || /[?#]/.test(trimmed)) {
        throw new Error(
            `VITE_SITE_URL inválida: "${trimmed}". Use só a origem, sem caminho, query nem hash; o subcaminho vem de BASE_PATH.`
        )
    }

    return url.origin
}

export default resolveSiteUrl
