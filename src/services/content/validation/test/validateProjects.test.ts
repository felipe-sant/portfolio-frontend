import { describe, expect, it } from "vitest"
import validateProjects from "@/services/content/validation/validateProjects"
import buildContentSnapshot from "@/testUtils/buildContentSnapshot"
import projectsOf from "@/testUtils/projectsOf"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function issuesAfter(mutate: (project: ProjectRecord, snapshot: ContentSnapshot) => void) {
    const snapshot = buildContentSnapshot()
    mutate(projectsOf(snapshot, "pt-BR")[0], snapshot)
    return validateProjects(snapshot).map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateProjects", () => {
    it("aceita projetos válidos", () => {
        expect(issuesAfter(() => undefined)).toEqual([])
    })

    it("reprova campo obrigatório ausente e campo desconhecido", () => {
        const issues = issuesAfter((project) => {
            Reflect.deleteProperty(project, "role")
            Object.assign(project, { slug: "maps", technologies: ["React"] })
        })

        expect(issues).toEqual([
            expect.stringContaining("items[0].role Campo obrigatório ausente"),
            expect.stringContaining("items[0].slug Campo desconhecido"),
            expect.stringContaining("items[0].technologies Campo desconhecido")
        ])
    })

    it("reprova summary acima de 160 caracteres e título vazio", () => {
        const issues = issuesAfter((project) => {
            project.summary = "a".repeat(161)
            project.title = " "
        })

        expect(issues).toHaveLength(2)
        expect(issues[0]).toContain("items[0].title")
        expect(issues[1]).toContain("161 caracteres")
    })

    it("reprova mais de quatro destaques", () => {
        const snapshot = buildContentSnapshot()
        const projects = projectsOf(snapshot, "en")
        projects.push(
            ...[3, 4, 5, 6].map((id) => ({
                ...projects[1],
                id: `0192f1a0-0000-7000-8000-00000000000${id}`,
                featured: true
            }))
        )
        projects[0].featured = true

        const issues = validateProjects(snapshot).map((issue) => issue.message)

        expect(issues).toEqual(["5 projetos em destaque; o máximo é 4"])
    })

    it("reprova cardTechnologies vazio, com mais de três ou fora de technologies", () => {
        const empty = issuesAfter((project) => {
            project.cardTechnologies = []
        })
        const many = issuesAfter((project) => {
            project.cardTechnologies = ["React", "PostGIS", "TypeScript", "React"]
        })
        const outside = issuesAfter((project) => {
            project.cardTechnologies = ["Vue"]
        })

        expect(empty[0]).toContain("de 1 a 3 tecnologias")
        expect(many[0]).toContain("de 1 a 3 tecnologias")
        expect(outside[0]).toContain("A tecnologia Vue do card não está na stack")
    })

    it("reprova stack vazia, com grupo sem item e fora de ordem", () => {
        expect(
            issuesAfter((project) => {
                project.stack = []
            })[0]
        ).toContain("pelo menos 1 grupo")
        expect(
            issuesAfter((project) => {
                project.stack[0].items = []
            })[0]
        ).toContain("pelo menos um item")
        expect(
            issuesAfter((project) => {
                project.stack.reverse()
            })[0]
        ).toContain("fora da ordem")
    })

    it("reprova mais de três relacionados e relacionado sem motivo", () => {
        const issues = issuesAfter((project) => {
            project.related = [1, 2, 3, 4].map((id) => ({
                id: `0192f1a0-0000-7000-8000-00000000000${id}`,
                reason: id === 4 ? "" : "Motivo"
            }))
        })

        expect(issues.some((issue) => issue.includes("No máximo 3 relacionados"))).toBe(true)
        expect(issues.some((issue) => issue.includes("related[3].reason"))).toBe(true)
    })

    it("reprova demoUrl e repositoryUrl fora do padrão", () => {
        const issues = issuesAfter((project) => {
            project.demoUrl = "http://maps.example.com"
            project.repositoryUrl = "https://gitlab.com/example/maps"
        })

        expect(issues).toEqual([
            expect.stringContaining("demoUrl Deve ser uma URL https:"),
            expect.stringContaining("repositoryUrl Deve ser uma URL https://github.com/")
        ])
    })

    it("reprova featured que não é booleano", () => {
        const issues = issuesAfter((project) => {
            Object.assign(project, { featured: "sim" })
        })

        expect(issues[0]).toContain("featured Deve ser verdadeiro ou falso")
    })
})
