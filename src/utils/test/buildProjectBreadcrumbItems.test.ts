import { describe, expect, it } from "vitest"
import buildProjectDetailFixture from "@/testUtils/buildProjectDetailFixture"
import buildProjectBreadcrumbItems from "@/utils/buildProjectBreadcrumbItems"

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const labels = { home: "Início", projects: "Projetos" }

describe("buildProjectBreadcrumbItems", () => {
    it("traz Início, Projetos e o projeto quando não há documento", () => {
        const items = buildProjectBreadcrumbItems(labels, buildProjectDetailFixture())

        expect(items).toEqual([
            { name: "Início", path: "/" },
            { name: "Projetos", path: "/projects" },
            { name: "Maps", path: "/projects/:id", params: { id: ID } }
        ])
    })

    it("acrescenta o documento como último item, só com o nome", () => {
        const items = buildProjectBreadcrumbItems(labels, buildProjectDetailFixture(), "SETUP.md")

        expect(items).toHaveLength(4)
        expect(items[3]).toEqual({
            name: "SETUP.md",
            path: "/projects/:id/docs/:name",
            params: { id: ID, name: "SETUP.md" }
        })
    })
})
