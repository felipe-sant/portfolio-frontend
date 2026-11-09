function hasPendingChangesets(fileNames: string[]) {
    return fileNames.some((name) => name.endsWith(".md") && name !== "README.md")
}

export default hasPendingChangesets
