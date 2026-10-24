import { generatePath, matchRoutes } from "react-router-dom"
import type { RouteObject } from "react-router-dom"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import getTargetFile from "@scripts/prerender/getTargetFile"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"
import type PrerenderRouteDescriptor from "@/types/prerender/PrerenderRouteDescriptor.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

type ProjectRecordsByLanguage = Record<string, ProjectRecord[]>

type ListedTargets = {
    targets: PrerenderTarget[]
    ignored: string[]
}

const README_NAME = "README.md"
const NOT_FOUND_TARGET: PrerenderTarget = {
    path: "not-found",
    file: "404.html",
    lang: "en"
}

function listParams(route: PrerenderRouteDescriptor, records: ProjectRecord[]): PrerenderParams[] {
    if (route.scope === "project") {
        return records.map((record) => ({ id: record.id }))
    }

    if (route.scope === "document") {
        return records.flatMap((record) =>
            record.documents
                .filter((document) => document.name !== README_NAME)
                .map((document) => ({
                    id: record.id,
                    name: document.name,
                    documentId: document.id
                }))
        )
    }

    return [{}]
}

function routeExists(routes: RouteObject[], route: PrerenderRouteDescriptor): boolean {
    const [language] = SUPPORTED_LANGUAGES
    const sampleParams = { id: "sample", name: "sample" }
    const matches = matchRoutes(routes, `/${language}/${generatePath(route.pattern, sampleParams)}`)
    const lastMatch = matches?.at(-1)

    return lastMatch !== undefined && lastMatch.route.path !== "*"
}

function toTarget(
    route: PrerenderRouteDescriptor,
    lang: SupportedLanguage,
    params: PrerenderParams
): PrerenderTarget {
    const path = [lang, generatePath(route.pattern, params)].filter(Boolean).join("/")

    return { path, file: getTargetFile(path), lang, pattern: route.pattern, params }
}

function listTargets(
    routes: RouteObject[],
    prerenderRoutes: PrerenderRouteDescriptor[],
    projectRecordsByLanguage: ProjectRecordsByLanguage
): ListedTargets {
    const existing = prerenderRoutes.filter((route) => routeExists(routes, route))
    const ignored = prerenderRoutes
        .filter((route) => !existing.includes(route))
        .map((route) => route.pattern)
    SUPPORTED_LANGUAGES.forEach((lang) => {
        if (!projectRecordsByLanguage[lang]) {
            throw new Error(`Faltam os projetos do idioma "${lang}" para enumerar os alvos.`)
        }
    })
    const targets = existing.flatMap((route) =>
        SUPPORTED_LANGUAGES.flatMap((lang) =>
            listParams(route, projectRecordsByLanguage[lang] ?? []).map((params) =>
                toTarget(route, lang, params)
            )
        )
    )

    return { targets: [...targets, NOT_FOUND_TARGET], ignored }
}

export default listTargets
