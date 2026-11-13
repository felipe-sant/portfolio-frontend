import writeFatecReadme from "@scripts/writeFatecReadme"

const [repositoryDirectory] = process.argv.slice(2)
const tag = process.env.TAG
const sha = process.env.ORIGIN_SHA

if (!repositoryDirectory || !tag || !sha) {
    console.error(
        "Uso: TAG=<tag> ORIGIN_SHA=<sha> npm run publish:fatec:readme -- <clone do destino>"
    )
    process.exit(1)
}

writeFatecReadme(repositoryDirectory, { tag, sha })
