import loadServerBundle from "@scripts/prerender/loadServerBundle"
import listTargets from "@scripts/prerender/listTargets"
import readSeoContent from "@scripts/seo/readSeoContent"
import resolveSeoOrigin from "@scripts/seo/resolveSeoOrigin"
import writeSeoFiles from "@scripts/seo/writeSeoFiles"
import resolveBase from "@scripts/resolveBase"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

const PUBLIC_DIRECTORY = "public"
const CLIENT_DIRECTORY = "dist"
const SERVER_DIRECTORY = "dist-server"

async function generateSeoFiles() {
    const base = resolveBase(process.env.BASE_PATH)
    const origin = resolveSeoOrigin()
    const content = readSeoContent(PUBLIC_DIRECTORY)
    const { routes, prerenderRoutes } = await loadServerBundle(SERVER_DIRECTORY)
    const recordsByLanguage = Object.fromEntries(
        SUPPORTED_LANGUAGES.map((language) => [language, content[language].projects])
    )
    const { targets } = listTargets(routes, prerenderRoutes, recordsByLanguage)

    writeSeoFiles({
        publicDirectory: PUBLIC_DIRECTORY,
        outputDirectory: CLIENT_DIRECTORY,
        origin,
        base,
        targets
    })
    console.log(`arquivos para buscadores e IA gerados em ${CLIENT_DIRECTORY}/`)
}

try {
    await generateSeoFiles()
} catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
}
