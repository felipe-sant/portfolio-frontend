import replaceFatecDocs from "@scripts/replaceFatecDocs"

const [artifactDirectory, repositoryDirectory] = process.argv.slice(2)

if (!artifactDirectory || !repositoryDirectory) {
    console.error("Uso: npm run publish:fatec:docs -- <diretório do artefato> <clone do destino>")
    process.exit(1)
}

replaceFatecDocs(artifactDirectory, repositoryDirectory)
