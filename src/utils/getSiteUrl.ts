const DEVELOPMENT_SITE_URL = "http://localhost:5173"

function getSiteUrl(): string {
    const value = import.meta.env.VITE_SITE_URL

    if (!value && import.meta.env.MODE !== "production") {
        return DEVELOPMENT_SITE_URL
    }

    return (value ?? "").replace(/\/+$/, "")
}

export default getSiteUrl
