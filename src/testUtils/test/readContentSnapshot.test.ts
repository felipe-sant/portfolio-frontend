import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import readContentSnapshot from "@/testUtils/readContentSnapshot"

let root = ""

async function put(path: string, content: string | Uint8Array) {
    const fullPath = join(root, path)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, content)
}

beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "content-snapshot-"))
})

afterEach(async () => {
    await rm(root, { recursive: true, force: true })
})

describe("readContentSnapshot", () => {
    it("lê os registros por idioma e todos os arquivos de content e images", async () => {
        await put("content/pt-BR/profile.json", JSON.stringify({ role: "Dev" }))
        await put("content/pt-BR/timeline.json", JSON.stringify({ items: [{ id: "t1" }] }))
        await put("content/pt-BR/projects.json", JSON.stringify({ items: [{ id: "p1" }] }))
        await put("content/pt-BR/projects/p1/docs/README.md", "## Contexto")
        await put("content/shared/projects/p1/docs/LICENSE", "MIT")
        await put("images/profile/photo-large.webp", Uint8Array.from([1, 2, 3]))
        await put("outro/ignorado.txt", "x")

        const snapshot = await readContentSnapshot(root)

        expect(snapshot.languages["pt-BR"].profile).toEqual({ role: "Dev" })
        expect(snapshot.languages["pt-BR"].timeline).toEqual([{ id: "t1" }])
        expect(snapshot.languages["pt-BR"].projects).toEqual([{ id: "p1" }])
        expect(Object.keys(snapshot.files).toSorted()).toEqual([
            "content/pt-BR/profile.json",
            "content/pt-BR/projects.json",
            "content/pt-BR/projects/p1/docs/README.md",
            "content/pt-BR/timeline.json",
            "content/shared/projects/p1/docs/LICENSE",
            "images/profile/photo-large.webp"
        ])
        expect(Array.from(snapshot.files["images/profile/photo-large.webp"])).toEqual([1, 2, 3])
    })

    it("registra arquivo ausente, JSON inválido e envelope sem items", async () => {
        await put("content/en/profile.json", "{ quebrado")
        await put("content/en/timeline.json", JSON.stringify([]))

        const { issues, languages } = await readContentSnapshot(root)

        expect(languages.en.profile).toBeUndefined()
        expect(issues).toContainEqual({
            path: "content/en/profile.json",
            message: "JSON inválido ou fora de UTF-8"
        })
        expect(issues).toContainEqual({
            path: "content/en/timeline.json",
            message: "O arquivo deve ser um objeto com a lista items"
        })
        expect(issues).toContainEqual({
            path: "content/en/projects.json",
            message: "Arquivo ausente"
        })
        expect(issues).toContainEqual({
            path: "content/es/profile.json",
            message: "Arquivo ausente"
        })
    })

    it("registra JSON que não está em UTF-8", async () => {
        await put("content/es/profile.json", Uint8Array.from([0x7b, 0xff, 0xfe, 0x7d]))

        const { issues } = await readContentSnapshot(root)

        expect(issues).toContainEqual({
            path: "content/es/profile.json",
            message: "JSON inválido ou fora de UTF-8"
        })
    })
})
