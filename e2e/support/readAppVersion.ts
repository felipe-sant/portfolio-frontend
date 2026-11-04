import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function readAppVersion(): string {
    const manifest: unknown = JSON.parse(readFileSync(resolve("package.json"), "utf-8"))

    if (
        typeof manifest !== "object" ||
        manifest === null ||
        !("version" in manifest) ||
        typeof manifest.version !== "string"
    ) {
        throw new Error("package.json sem version")
    }

    return manifest.version
}

export default readAppVersion
