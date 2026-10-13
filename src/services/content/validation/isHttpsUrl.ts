function isHttpsUrl(value: unknown, prefix = "https://"): boolean {
    return typeof value === "string" && value.startsWith(prefix) && URL.canParse(value)
}

export default isHttpsUrl
