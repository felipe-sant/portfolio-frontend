import { describe, expect, it } from "vitest"
import createSolidWebp from "@/services/content/createSolidWebp"
import validateImages from "@/services/content/validation/validateImages"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import profileOf from "@/testUtils/profileOf"
import projectsOf from "@/testUtils/projectsOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const FIRST = "0192f1a0-0000-7000-8000-000000000001"

function issuesAfter(mutate: (snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(snapshot)
    return validateImages(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateImages", () => {
    it("aceita imagens 16:9, foto 1:1 e arquivos que existem", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova mais de cinco imagens", () => {
        const issues = issuesAfter((snapshot) => {
            const [project] = projectsOf(snapshot, "pt-BR")
            project.images = Array.from({ length: 6 }, () => project.images[0])
        })

        expect(issues).toEqual([expect.stringContaining("6 imagens; o máximo é 5")])
    })

    it("reprova imagem que não é 16:9", () => {
        const issues = issuesAfter((snapshot) => {
            const image = projectsOf(snapshot, "pt-BR")[0].images[0]
            image.large.height = 1200
            image.small.width = 640
        })

        expect(issues.some((issue) => issue.includes("deve ser 16:9"))).toBe(true)
    })

    it("reprova variantes com proporções diferentes", () => {
        const issues = issuesAfter((snapshot) => {
            const image = projectsOf(snapshot, "pt-BR")[0].images[0]
            image.small.height = 480
        })

        expect(issues.some((issue) => issue.includes("mesma proporção"))).toBe(true)
    })

    it("reprova width e height diferentes do arquivo", () => {
        const issues = issuesAfter((snapshot) => {
            const image = projectsOf(snapshot, "pt-BR")[0].images[0]
            snapshot.files[image.large.src] = createSolidWebp(1280, 720, "#bdbdbd")
        })

        expect(issues).toHaveLength(3)
        expect(issues[0]).toContain("diferem do arquivo (1280x720)")
    })

    it("reprova arquivo inexistente e src com barra inicial", () => {
        const issues = issuesAfter((snapshot) => {
            const images = projectsOf(snapshot, "pt-BR")[0].images
            Reflect.deleteProperty(snapshot.files, images[0].small.src)
            images[1].large.src = `/${images[1].large.src}`
        })

        expect(issues[0]).toContain("Arquivo de imagem inexistente")
        expect(issues[1]).toContain("caminho relativo sem barra inicial")
    })

    it("reprova arquivo acima do limite de tamanho", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`images/projects/${FIRST}/1-small.webp`] = new Uint8Array(81 * 1024)
        })

        expect(issues.some((issue) => issue.includes("limite da variante small"))).toBe(true)
    })

    it("reprova arquivo que não é WebP válido", () => {
        const issues = issuesAfter((snapshot) => {
            snapshot.files[`images/projects/${FIRST}/1-small.webp`] = new Uint8Array(100)
        })

        expect(issues.some((issue) => issue.includes("esperado WebP"))).toBe(true)
    })

    it("reprova alt ausente, alt vazio e alt longo demais", () => {
        const issues = issuesAfter((snapshot) => {
            const images = projectsOf(snapshot, "en")[0].images
            Reflect.deleteProperty(images[0], "alt")
            images[1].alt = "a".repeat(151)
        })

        expect(issues).toEqual([
            expect.stringContaining("images[0].alt Campo obrigatório ausente"),
            expect.stringContaining("151 caracteres")
        ])
    })

    it("reprova width e height que não são inteiros positivos", () => {
        const issues = issuesAfter((snapshot) => {
            const image = projectsOf(snapshot, "pt-BR")[1].images
            image.push({ ...projectsOf(snapshot, "pt-BR")[0].images[0] })
            Object.assign(image[0].large, { width: "1600" })
        })

        expect(issues.some((issue) => issue.includes("inteiros positivos"))).toBe(true)
    })

    it("reprova a foto do perfil que não é 1:1", () => {
        const issues = issuesAfter((snapshot) => {
            const photo = profileOf(snapshot, "pt-BR").photo
            if (photo) {
                photo.large.height = 600
            }
        })

        expect(issues.some((issue) => issue.includes("deve ser 1:1"))).toBe(true)
    })

    it("aceita perfil sem foto e URL https de imagem", () => {
        const issues = issuesAfter((snapshot) => {
            Reflect.deleteProperty(profileOf(snapshot, "es"), "photo")
            projectsOf(snapshot, "es")[0].images[0].large.src = "https://cdn.example.com/a.webp"
        })

        expect(issues).toEqual([])
    })

    it("reprova largura acima de 1600 na variante large", () => {
        const issues = issuesAfter((snapshot) => {
            const image = projectsOf(snapshot, "pt-BR")[0].images[0]
            image.large.src = "https://cdn.example.com/a.webp"
            image.large.width = 1920
            image.large.height = 1080
        })

        expect(issues.some((issue) => issue.includes("no máximo 1600px"))).toBe(true)
    })
})
