import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const MNIST = "01a131df-93ee-72f3-8c7a-f67501e47a7a"
const CLUSTERING = "01a1323d-b9bc-73c0-8bac-2e93e30ee193"

async function readProjects(language: string): Promise<ProjectRecord[]> {
    const text = await readFile(
        join(process.cwd(), "public", "content", language, "projects.json"),
        "utf-8"
    )
    const parsed: { items: ProjectRecord[] } = JSON.parse(text)

    return parsed.items
}

describe.each(SUPPORTED_LANGUAGES)("relacionados do conteúdo real em %s", (language) => {
    it("liga MNIST Classifier e Player Profile Clustering um ao outro com motivo", async () => {
        const projects = await readProjects(language)
        const mnist = projects.find((project) => project.id === MNIST)
        const clustering = projects.find((project) => project.id === CLUSTERING)

        expect(mnist?.related.map((item) => item.id)).toEqual([CLUSTERING])
        expect(clustering?.related.map((item) => item.id)).toEqual([MNIST])
        expect(mnist?.related[0].reason.trim()).not.toBe("")
        expect(clustering?.related[0].reason.trim()).not.toBe("")
    })

    it("deixa os outros quatro projetos sem relacionados", async () => {
        const projects = await readProjects(language)
        const others = projects.filter((project) => ![MNIST, CLUSTERING].includes(project.id))

        expect(others).toHaveLength(4)
        expect(others.map((project) => project.related)).toEqual([[], [], [], []])
    })
})
