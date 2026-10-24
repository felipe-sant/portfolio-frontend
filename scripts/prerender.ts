import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import composePage from "@scripts/prerender/composePage"
import installPublicFetch from "@scripts/prerender/installPublicFetch"
import listTargets from "@scripts/prerender/listTargets"
import loadServerBundle from "@scripts/prerender/loadServerBundle"
import readNoscriptText from "@scripts/prerender/readNoscriptText"
import readProjectRecords from "@scripts/prerender/readProjectRecords"
import resolveBase from "@scripts/resolveBase"

const CLIENT_DIRECTORY = "dist"
const SERVER_DIRECTORY = "dist-server"

async function prerenderSite(base: string) {
    const { render, routes, prerenderRoutes } = await loadServerBundle(SERVER_DIRECTORY)
    const recordsByLanguage = {
        "pt-BR": await readProjectRecords("pt-BR"),
        en: await readProjectRecords("en"),
        es: await readProjectRecords("es")
    }
    const { targets, ignored } = listTargets(routes, prerenderRoutes, recordsByLanguage)
    const template = await readFile(join(CLIENT_DIRECTORY, "index.html"), "utf-8")
    for (const target of targets) {
        const result = await render(target)
        const page = composePage(
            template,
            result,
            target,
            await readNoscriptText(target.lang),
            base
        )
        const file = join(CLIENT_DIRECTORY, target.file)

        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, page)
        console.log(`pré-renderizado ${target.file}`)
    }

    ignored.forEach((pattern) => console.log(`ignorado (rota sem tela): ${pattern || "/"}`))
}

const base = resolveBase(process.env.BASE_PATH)
const restoreFetch = installPublicFetch(base)

try {
    await prerenderSite(base)
} finally {
    restoreFetch()
}
