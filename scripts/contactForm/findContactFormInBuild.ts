import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"

const SIGNALS = [
    { marker: 'id="contact-form"', description: 'o marcador id="contact-form"' },
    { marker: "ContactForm-", description: "a referência ao chunk ContactForm" }
]

async function listHtmlFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true })
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name)
            if (entry.isDirectory()) return listHtmlFiles(path)
            return entry.name.endsWith(".html") ? [path] : []
        })
    )

    return nested.flat()
}

async function findContactFormInBuild(buildDirectory: string): Promise<string[]> {
    if (!existsSync(buildDirectory)) {
        throw new Error(`O diretório do build ${buildDirectory} não existe: rode o build antes.`)
    }

    const files = await listHtmlFiles(buildDirectory)

    if (files.length === 0) {
        throw new Error(
            `O diretório do build ${buildDirectory} está vazio: sem HTML para conferir.`
        )
    }

    const reasons = await Promise.all(
        files.map(async (file) => {
            const content = await readFile(file, "utf-8")
            const name = relative(buildDirectory, file)

            return SIGNALS.filter(({ marker }) => content.includes(marker)).map(
                ({ description }) => `${name} contém ${description}.`
            )
        })
    )

    return reasons.flat()
}

export default findContactFormInBuild
