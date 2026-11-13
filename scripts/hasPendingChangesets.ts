type ChangesetFile = {
    name: string
    content: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)---/

function isEmptyChangeset(content: string) {
    const match = FRONTMATTER.exec(content)

    return match !== null && match[1].trim() === ""
}

function hasPendingChangesets(files: ChangesetFile[]) {
    return files.some(
        ({ name, content }) =>
            name.endsWith(".md") && name !== "README.md" && !isEmptyChangeset(content)
    )
}

export default hasPendingChangesets
