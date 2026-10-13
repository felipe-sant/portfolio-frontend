import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type LanguageContent from "@/types/content/LanguageContent.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const CONTENT_FOLDERS = ["content", "images"]

async function readFiles(root: string): Promise<Record<string, Uint8Array>> {
    const files: Record<string, Uint8Array> = {}

    for (const folder of CONTENT_FOLDERS) {
        const folderPath = join(root, folder)

        if (!existsSync(folderPath)) {
            continue
        }

        const entries = await readdir(folderPath, { recursive: true, withFileTypes: true })

        for (const entry of entries.filter((item) => item.isFile())) {
            const fullPath = join(entry.parentPath, entry.name)
            files[relative(root, fullPath).split(sep).join("/")] = await readFile(fullPath)
        }
    }

    return files
}

function parseJson(
    files: Record<string, Uint8Array>,
    path: string,
    issues: ContentIssue[]
): unknown {
    const bytes = files[path]

    if (!bytes) {
        issues.push({ path, message: "Arquivo ausente" })
        return undefined
    }

    try {
        return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes))
    } catch {
        issues.push({ path, message: "JSON inválido ou fora de UTF-8" })
        return undefined
    }
}

function readItems(value: unknown, path: string, issues: ContentIssue[]): unknown[] | undefined {
    if (value === undefined) {
        return undefined
    }

    if (
        typeof value === "object" &&
        value !== null &&
        "items" in value &&
        Array.isArray(value.items)
    ) {
        return value.items
    }

    issues.push({ path, message: "O arquivo deve ser um objeto com a lista items" })
    return undefined
}

function readLanguage(
    files: Record<string, Uint8Array>,
    lang: SupportedLanguage,
    issues: ContentIssue[]
): LanguageContent {
    const timelinePath = `content/${lang}/timeline.json`
    const projectsPath = `content/${lang}/projects.json`

    return {
        profile: parseJson(
            files,
            `content/${lang}/profile.json`,
            issues
        ) as LanguageContent["profile"],
        timeline: readItems(
            parseJson(files, timelinePath, issues),
            timelinePath,
            issues
        ) as LanguageContent["timeline"],
        projects: readItems(
            parseJson(files, projectsPath, issues),
            projectsPath,
            issues
        ) as LanguageContent["projects"]
    }
}

async function readContentSnapshot(root = join(process.cwd(), "public")): Promise<ContentSnapshot> {
    const files = await readFiles(root)
    const issues: ContentIssue[] = []

    return {
        languages: {
            "pt-BR": readLanguage(files, "pt-BR", issues),
            en: readLanguage(files, "en", issues),
            es: readLanguage(files, "es", issues)
        },
        files,
        issues
    }
}

export default readContentSnapshot
