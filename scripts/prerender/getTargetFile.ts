function getTargetFile(path: string): string {
    if (path === "" || path.endsWith("/")) {
        throw new Error(`Caminho "${path}" não gera arquivo: use um caminho sem barra final.`)
    }

    return `${decodeURIComponent(path)}.html`
}

export default getTargetFile
