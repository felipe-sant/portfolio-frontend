const ENTITIES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
}

function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ENTITIES[character])
}

export default escapeXml
