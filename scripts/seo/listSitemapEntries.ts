import type SeoContent from "@/types/seo/SeoContent.types"
import type SitemapEntry from "@/types/seo/SitemapEntry.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const PROJECT_PATTERN = "projects/:id"
const DOCUMENT_PATTERN = "projects/:id/docs/:name"

function buildGroupKey(target: PrerenderTarget): string {
    const { id = "", name = "" } = target.params ?? {}

    return `${target.pattern}|${id}|${name}`
}

function findLastmod(target: PrerenderTarget, content: SeoContent): string | undefined {
    const project = content[target.lang].projects.find(
        (candidate) => candidate.id === target.params?.id
    )

    if (target.pattern === PROJECT_PATTERN) {
        return project?.updatedAt
    }

    if (target.pattern === DOCUMENT_PATTERN) {
        return project?.documents.find((document) => document.name === target.params?.name)
            ?.updatedAt
    }

    return undefined
}

type PartialPaths = Partial<Record<SupportedLanguage, string>>

function groupPaths(targets: PrerenderTarget[]): Map<string, PartialPaths> {
    const groups = new Map<string, PartialPaths>()

    targets.forEach((target) => {
        const key = buildGroupKey(target)

        groups.set(key, { ...groups.get(key), [target.lang]: target.path })
    })

    return groups
}

function completeAlternates(paths: PartialPaths, key: string): Record<SupportedLanguage, string> {
    const { "pt-BR": portuguese, en, es } = paths

    if (portuguese === undefined || en === undefined || es === undefined) {
        throw new Error(`Faltam versões de idioma da rota "${key}" no sitemap.`)
    }

    return { "pt-BR": portuguese, en, es }
}

function listSitemapEntries(targets: PrerenderTarget[], content: SeoContent): SitemapEntry[] {
    const pageTargets = targets.filter((target) => target.pattern !== undefined)
    const groups = groupPaths(pageTargets)

    return pageTargets.map((target) => {
        const key = buildGroupKey(target)

        return {
            path: target.path,
            alternates: completeAlternates(groups.get(key) ?? {}, key),
            lastmod: findLastmod(target, content)
        }
    })
}

export default listSitemapEntries
