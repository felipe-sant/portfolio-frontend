import { copyFileSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"

function prepareFatecArtifact(directory: string) {
    const indexPath = join(directory, "index.html")
    const indexHtml = readFileSync(indexPath, "utf-8")

    if (!indexHtml.includes(FATEC_BASE_PATH)) {
        throw new Error(
            `O index.html em "${directory}" não contém o base "${FATEC_BASE_PATH}". Gere o build com BASE_PATH da Fatec.`
        )
    }

    copyFileSync(indexPath, join(directory, "404.html"))
    writeFileSync(join(directory, ".nojekyll"), "")
}

export default prepareFatecArtifact
