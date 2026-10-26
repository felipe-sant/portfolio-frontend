function projectPath(language: string, id: string, documentName?: string) {
    const base = `${language}/projects/${id}`
    return documentName ? `${base}/docs/${documentName}` : base
}

export default projectPath
