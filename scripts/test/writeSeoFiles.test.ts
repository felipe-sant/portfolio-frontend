// @vitest-environment node
import {
    cpSync,
    existsSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import listTargets from "@scripts/prerender/listTargets"
import readProjectRecords from "@scripts/prerender/readProjectRecords"
import writeSeoFiles from "@scripts/seo/writeSeoFiles"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"

const FILES = [
    "llms-full.en.txt",
    "llms-full.es.txt",
    "llms-full.txt",
    "llms.txt",
    "robots.txt",
    "sitemap.xml"
]

async function listRealTargets() {
    const recordsByLanguage = {
        "pt-BR": await readProjectRecords("pt-BR"),
        en: await readProjectRecords("en"),
        es: await readProjectRecords("es")
    }

    return listTargets(routes, prerenderRoutes, recordsByLanguage).targets
}

describe("writeSeoFiles", () => {
    let output: string

    beforeEach(() => {
        output = mkdtempSync(join(tmpdir(), "seo-output-"))
    })

    afterEach(() => {
        rmSync(output, { recursive: true, force: true })
    })

    it("escreve exatamente os seis arquivos, todos com conteúdo", async () => {
        const targets = await listRealTargets()

        writeSeoFiles({
            publicDirectory: "public",
            outputDirectory: output,
            origin: FATEC_SITE_URL,
            base: FATEC_BASE_PATH,
            targets
        })

        expect(readdirSync(output).toSorted()).toEqual(FILES)
        FILES.forEach((file) =>
            expect(readFileSync(join(output, file), "utf-8").trim()).not.toBe("")
        )
    })

    it("não deixa arquivo parcial quando o conteúdo é inválido", () => {
        const broken = mkdtempSync(join(tmpdir(), "seo-broken-"))
        cpSync("public/content", join(broken, "content"), { recursive: true })
        cpSync("public/cv", join(broken, "cv"), { recursive: true })
        writeFileSync(join(broken, "content", "en", "projects.json"), "{")

        try {
            expect(() =>
                writeSeoFiles({
                    publicDirectory: broken,
                    outputDirectory: output,
                    origin: FATEC_SITE_URL,
                    base: FATEC_BASE_PATH,
                    targets: []
                })
            ).toThrow("JSON inválido em")
            expect(readdirSync(output)).toEqual([])
            expect(existsSync(join(output, "sitemap.xml"))).toBe(false)
        } finally {
            rmSync(broken, { recursive: true, force: true })
        }
    })

    it("todo link do llms.txt é um loc do sitemap ou um arquivo gerado", async () => {
        const targets = await listRealTargets()

        writeSeoFiles({
            publicDirectory: "public",
            outputDirectory: output,
            origin: FATEC_SITE_URL,
            base: FATEC_BASE_PATH,
            targets
        })
        const sitemap = readFileSync(join(output, "sitemap.xml"), "utf-8")
        const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, loc]) => loc)
        const generated = FILES.filter((file) => file.startsWith("llms-full")).map(
            (file) => `${FATEC_SITE_URL}${FATEC_BASE_PATH}${file}`
        )
        const resumes = ["pt-BR", "en", "es"].flatMap((language) =>
            ["md", "pdf"].map(
                (format) => `${FATEC_SITE_URL}${FATEC_BASE_PATH}cv/cv-${language}.${format}`
            )
        )
        const llms = readFileSync(join(output, "llms.txt"), "utf-8")
        const links = Array.from(llms.matchAll(/\]\(([^)]+)\)/g), ([, url]) => url)
        const accepted = new Set([...locs, ...generated, ...resumes])

        expect(links.length).toBeGreaterThan(0)
        links.forEach((link) => expect(accepted.has(link)).toBe(true))
        expect(readFileSync(join(output, "robots.txt"), "utf-8")).toContain(
            `Sitemap: ${FATEC_SITE_URL}${FATEC_BASE_PATH}sitemap.xml`
        )
    })
})
