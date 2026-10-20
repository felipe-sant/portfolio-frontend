import { describe, expect, it } from "vitest"
import DOCUMENT_FORMATS from "@/enum/documentFormats.enum"
import ICON_NAMES from "@/enum/iconNames.enum"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_STATUSES from "@/enum/projectStatuses.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import TIMELINE_KINDS from "@/enum/timelineKinds.enum"

describe("enums do contrato", () => {
    it("lista os tipos de projeto na ordem do modelo de dados", () => {
        expect(PROJECT_TYPES).toEqual([
            "web",
            "mobile",
            "api",
            "desktop",
            "cli",
            "library",
            "extension",
            "bot",
            "data",
            "game",
            "iot",
            "infra"
        ])
    })

    it("lista categorias, situações, stack, trajetória, formatos e ordenações", () => {
        expect(PROJECT_CATEGORIES).toEqual(["academic", "personal", "professional"])
        expect(PROJECT_STATUSES).toEqual(["inDevelopment", "completed", "discontinued"])
        expect(STACK_CATEGORIES).toEqual(["frontend", "backend", "tooling"])
        expect(TIMELINE_KINDS).toEqual(["experience", "education", "course"])
        expect(DOCUMENT_FORMATS).toEqual(["markdown", "text"])
        expect(PROJECT_SORTS).toEqual(["recent", "oldest", "title"])
    })

    it("lista o inventário fechado de ícones", () => {
        expect(ICON_NAMES).toHaveLength(21)
        expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length)
    })
})
