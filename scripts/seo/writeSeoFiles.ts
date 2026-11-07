import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import buildLlmsFullTxt from "@scripts/seo/buildLlmsFullTxt"
import buildLlmsTxt from "@scripts/seo/buildLlmsTxt"
import buildRobotsTxt from "@scripts/seo/buildRobotsTxt"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import buildSitemapXml from "@scripts/seo/buildSitemapXml"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"
import listSitemapEntries from "@scripts/seo/listSitemapEntries"
import readSeoContent from "@scripts/seo/readSeoContent"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SeoFilesOptions from "@/types/seo/SeoFilesOptions.types"

function writeSeoFiles(options: SeoFilesOptions) {
    const { publicDirectory, outputDirectory, origin, base, targets } = options
    const content = readSeoContent(publicDirectory)
    const sitemapUrl = buildSeoUrl(origin, base, "sitemap.xml")
    const fullFiles = SUPPORTED_LANGUAGES.map(
        (language) =>
            [
                getLlmsFullFileName(language),
                buildLlmsFullTxt(language, content, origin, base)
            ] as const
    )
    const files = [
        ["robots.txt", buildRobotsTxt(sitemapUrl)],
        ["sitemap.xml", buildSitemapXml(listSitemapEntries(targets, content), origin, base)],
        ["llms.txt", buildLlmsTxt(content, origin, base)],
        ...fullFiles
    ] as const

    mkdirSync(outputDirectory, { recursive: true })
    files.forEach(([name, text]) => writeFileSync(join(outputDirectory, name), text))
}

export default writeSeoFiles
