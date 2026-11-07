function buildSeoUrl(origin: string, base: string, path: string): string {
    const basePath = base.replace(/^\/+|\/+$/g, "")
    const filePath = path.replace(/^\/+|\/+$/g, "")
    const segments = [basePath, filePath].filter((segment) => segment !== "")

    return [origin, ...segments].join("/")
}

export default buildSeoUrl
