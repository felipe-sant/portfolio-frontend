import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"

function readNotFoundPage(directory: string): string {
    try {
        return readFileSync(join(directory, "404.html"), "utf-8")
    } catch {
        throw new Error(
            `O 404.html não existe em "${directory}". Rode o build completo para pré-renderizá-lo.`
        )
    }
}

function prepareFatecArtifact(directory: string) {
    const notFoundHtml = readNotFoundPage(directory)

    if (!notFoundHtml.includes(FATEC_BASE_PATH)) {
        throw new Error(
            `O 404.html em "${directory}" não contém o base "${FATEC_BASE_PATH}". Gere o build com BASE_PATH da Fatec.`
        )
    }

    writeFileSync(join(directory, ".nojekyll"), "")
}

export default prepareFatecArtifact
