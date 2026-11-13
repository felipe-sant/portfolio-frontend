import isLicenseDocument from "@/utils/isLicenseDocument"
import type SeoContent from "@/types/seo/SeoContent.types"
import type SitemapEntry from "@/types/seo/SitemapEntry.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const PROJECT_PATTERN = "projects/:id"
const DOCUMENT_PATTERN = "projects/:id/docs/:name"
const PROJECTS_PATTERN = "projects"
const HOME_PATTERN = ""

function buildGroupKey(target: PrerenderTarget): string {
    const { id = "", name = "" } = target.params ?? {}

    return `${target.pattern}|${id}|${name}`
}

function findLatest(days: (string | undefined)[]): string | undefined {
    const known = days.filter((day) => day !== undefined)

    return known.length === 0
        ? undefined
        : known.reduce((latest, day) => (day > latest ? day : latest))
}

function findLastmod(target: PrerenderTarget, content: SeoContent): string | undefined {
    const { profile, projects } = content[target.lang]
    const project = projects.find((candidate) => candidate.id === target.params?.id)
    const latestProject = findLatest(projects.map((candidate) => candidate.updatedAt))

    if (target.pattern === PROJECT_PATTERN) {
        return project?.updatedAt
    }

    if (target.pattern === DOCUMENT_PATTERN) {
        return project?.documents.find((document) => document.name === target.params?.name)
            ?.updatedAt
    }

    if (target.pattern === PROJECTS_PATTERN) {
        return latestProject
    }

    if (target.pattern === HOME_PATTERN) {
        return findLatest([profile.updatedAt, latestProject])
    }

    return profile.updatedAt
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
    const pageTargets = targets.filter(
        (target) =>
            target.pattern !== undefined &&
            !(target.pattern === DOCUMENT_PATTERN && isLicenseDocument(target.params?.name ?? ""))
    )
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
