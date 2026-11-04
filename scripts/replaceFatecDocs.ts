import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"

const REQUIRED_FILES = ["index.html", "404.html", ".nojekyll"]

function assertValidArtifact(artifactDirectory: string) {
    if (!existsSync(artifactDirectory)) {
        throw new Error(`O diretório do artefato "${artifactDirectory}" não existe.`)
    }

    for (const file of REQUIRED_FILES) {
        if (!existsSync(join(artifactDirectory, file))) {
            throw new Error(
                `O artefato em "${artifactDirectory}" não tem o ${file}. Gere o build com npm run build:fatec.`
            )
        }
    }
}

function replaceFatecDocs(artifactDirectory: string, repositoryDirectory: string) {
    assertValidArtifact(artifactDirectory)

    const docsDirectory = join(repositoryDirectory, "docs")

    rmSync(docsDirectory, { recursive: true, force: true })
    mkdirSync(docsDirectory, { recursive: true })
    cpSync(artifactDirectory, docsDirectory, { recursive: true })
}

export default replaceFatecDocs
