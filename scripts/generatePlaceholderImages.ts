import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import createSolidWebp from "@/services/content/createSolidWebp"

type Variant = { name: string; width: number; height: number }

const PLACEHOLDER_COLOR = "#bdbdbd"
const MAX_PROJECT_IMAGES = 5
const IMAGES_ROOT = join(process.cwd(), "public", "images")

const PROJECT_VARIANTS = (index: number): Variant[] => [
    { name: `${index}-large.webp`, width: 1600, height: 900 },
    { name: `${index}-small.webp`, width: 640, height: 360 }
]

const PROFILE_VARIANTS: Variant[] = [
    { name: "photo-large.webp", width: 800, height: 800 },
    { name: "photo-small.webp", width: 320, height: 320 }
]

const args = process.argv.slice(2)
const force = args.includes("--force")
const [kind, ...rest] = args.filter((argument) => argument !== "--force")

function writePlaceholders(folder: string, variants: Variant[]): void {
    for (const variant of variants) {
        const target = join(folder, variant.name)

        if (existsSync(target) && !force) {
            console.log(`Mantido: ${target}`)
            continue
        }

        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, createSolidWebp(variant.width, variant.height, PLACEHOLDER_COLOR))
        console.log(`Gerado: ${target}`)
    }
}

if (kind === "profile") {
    writePlaceholders(join(IMAGES_ROOT, "profile"), PROFILE_VARIANTS)
} else if (kind === "project" && rest[0]) {
    const count = Number(rest[1] ?? "1")

    if (!Number.isInteger(count) || count < 1 || count > MAX_PROJECT_IMAGES) {
        throw new Error(`Quantidade inválida: use um inteiro de 1 a ${MAX_PROJECT_IMAGES}.`)
    }

    const folder = join(IMAGES_ROOT, "projects", rest[0])
    for (let index = 1; index <= count; index += 1) {
        writePlaceholders(folder, PROJECT_VARIANTS(index))
    }
} else {
    console.error(
        "Uso: npm run content:placeholders -- profile | project <id> [quantidade] [--force]"
    )
    process.exitCode = 1
}
