import { execFileSync } from "node:child_process"
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import extractChangelogSection from "@scripts/extractChangelogSection"
import resolveRelease from "@scripts/resolveRelease"

const { version } = JSON.parse(readFileSync("package.json", "utf-8")) as { version: string }
const existingTags = execFileSync("git", ["tag", "--list"], { encoding: "utf-8" })
    .split("\n")
    .filter((tag) => tag !== "")
const { release, tag, publishFatec } = resolveRelease(version, existingTags)

const outputs: Record<string, string> = {
    tag,
    release: String(release),
    "publish-fatec": String(publishFatec)
}

if (release) {
    const notes = extractChangelogSection(readFileSync("CHANGELOG.md", "utf-8"), version)
    const notesFile = join(
        mkdtempSync(join(process.env.RUNNER_TEMP ?? tmpdir(), "release-")),
        "notes.md"
    )
    writeFileSync(notesFile, `${notes}\n`)
    outputs["notes-file"] = notesFile
}

const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}\n`)

if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, lines.join(""))
} else {
    process.stdout.write(lines.join(""))
}
