import { readFileSync } from "node:fs"
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"

type PdfSnapshot = {
    language: string | undefined
    roles: Set<string>
    text: string
}

function collectRoles(node: object, roles: Set<string>) {
    if ("role" in node && typeof node.role === "string") {
        roles.add(node.role)
    }

    if ("children" in node && Array.isArray(node.children)) {
        for (const child of node.children) {
            if (typeof child === "object" && child !== null) {
                collectRoles(child, roles)
            }
        }
    }
}

async function readPdfDocument(file: string): Promise<PdfSnapshot> {
    const loadingTask = getDocument({ data: new Uint8Array(readFileSync(file)) })
    const document = await loadingTask.promise
    const metadata = await document.getMetadata()
    const info = metadata.info as { Language?: string }
    const roles = new Set<string>()
    const texts: string[] = []

    for (let number = 1; number <= document.numPages; number += 1) {
        const page = await document.getPage(number)
        const content = await page.getTextContent()
        const tree = await page.getStructTree()

        texts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "))
        if (tree) {
            collectRoles(tree, roles)
        }
    }

    await loadingTask.destroy()

    return {
        language: info.Language,
        roles,
        text: texts.join(" ").replace(/\s+/g, " ").trim()
    }
}

export default readPdfDocument
