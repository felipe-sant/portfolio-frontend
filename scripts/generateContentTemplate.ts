import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { format, resolveConfig } from "prettier"
import buildContentTemplate from "@/services/content/buildContentTemplate"

const TEMPLATE_FOLDER = join(process.cwd(), "content", "template", "pt-BR")

mkdirSync(TEMPLATE_FOLDER, { recursive: true })

for (const [name, text] of Object.entries(buildContentTemplate())) {
    const target = join(TEMPLATE_FOLDER, name)
    const options = await resolveConfig(target)

    writeFileSync(target, await format(text, { ...options, filepath: target }))
    console.log(`Gerado: ${target}`)
}
