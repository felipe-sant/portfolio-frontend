import { describe, expect, it } from "vitest"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import getTrajectoryLines from "@/utils/getTrajectoryLines"

describe("getTrajectoryLines", () => {
    it("destaca o cargo na experiência e lista a organização e os detalhes", () => {
        const lines = getTrajectoryLines(
            buildTimelineItem({
                kind: "experience",
                title: "Desenvolvedor",
                organization: "Empresa",
                details: ["CLT", "Remoto"]
            })
        )

        expect(lines).toEqual({ highlight: "Desenvolvedor", details: ["Empresa", "CLT", "Remoto"] })
    })

    it("destaca a instituição na formação e lista o curso, a etapa e os detalhes", () => {
        const lines = getTrajectoryLines(
            buildTimelineItem({
                kind: "education",
                title: "Análise e Desenvolvimento de Sistemas",
                organization: "Fatec",
                stage: "6º semestre",
                details: ["Tecnólogo"]
            })
        )

        expect(lines).toEqual({
            highlight: "Fatec",
            details: ["Análise e Desenvolvimento de Sistemas", "6º semestre", "Tecnólogo"]
        })
    })

    it("destaca o título no curso e lista a organização, a etapa e os detalhes", () => {
        const lines = getTrajectoryLines(
            buildTimelineItem({
                kind: "course",
                title: "React avançado",
                organization: "Alura",
                stage: "Concluído",
                details: ["120 horas"]
            })
        )

        expect(lines).toEqual({
            highlight: "React avançado",
            details: ["Alura", "Concluído", "120 horas"]
        })
    })

    it("não deixa parte vazia quando falta organização, etapa ou detalhes", () => {
        const lines = getTrajectoryLines(
            buildTimelineItem({
                kind: "course",
                title: "React avançado",
                organization: undefined,
                stage: undefined,
                details: []
            })
        )

        expect(lines).toEqual({ highlight: "React avançado", details: [] })
    })
})
