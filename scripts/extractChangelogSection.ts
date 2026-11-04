function extractChangelogSection(changelog: string, version: string): string {
    const lines = changelog.split("\n")
    const start = lines.findIndex((line) => line.trim() === `## ${version}`)

    if (start === -1) {
        throw new Error(`Seção da versão ${version} não encontrada no CHANGELOG.md.`)
    }

    const next = lines.findIndex((line, index) => index > start && line.startsWith("## "))
    const end = next === -1 ? lines.length : next

    return lines
        .slice(start + 1, end)
        .join("\n")
        .trim()
}

export default extractChangelogSection
