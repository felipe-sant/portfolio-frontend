import type { Page } from "@playwright/test"
import isRecord from "./isRecord"
import readRawProjects from "./readRawProjects"

type FixtureOptions = {
    language: string
    projectId: string
    imageCount: number
    relatedCount: number
}

function buildImage(source: Record<string, unknown>, index: number) {
    return {
        ...source,
        alt: `Captura ${index + 1} do projeto de teste`,
        caption: `Legenda ${index + 1}`
    }
}

async function serveProjectFixture(page: Page, options: FixtureOptions) {
    const items = readRawProjects(options.language)
    const target = items.find((item) => item.id === options.projectId)
    if (!target || !Array.isArray(target.images) || !isRecord(target.images[0])) {
        throw new Error("projeto de fixture sem imagem base")
    }
    const source = target.images[0]
    const images = Array.from({ length: options.imageCount }, (_value, index) =>
        buildImage(source, index)
    )
    const related = items
        .filter((item) => item.id !== options.projectId)
        .slice(0, options.relatedCount)
        .map((item) => ({ id: item.id, reason: `Motivo ${String(item.title)}` }))
    const body = JSON.stringify({
        items: items.map((item) => (item === target ? { ...item, images, related } : item))
    })
    await page.route(`**/content/${options.language}/projects.json`, (route) =>
        route.fulfill({ contentType: "application/json", body })
    )
    return { images, related }
}

export default serveProjectFixture
