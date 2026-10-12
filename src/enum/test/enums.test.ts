import { describe, expect, it } from "vitest"
import DOCUMENT_FORMATS from "@/services/content/documentFormats"
import PROJECT_CATEGORIES from "@/services/content/projectCategories"
import PROJECT_SORTS from "@/services/content/projectSorts"
import PROJECT_STATUSES from "@/services/content/projectStatuses"
import PROJECT_TYPES from "@/services/content/projectTypes"
import STACK_CATEGORIES from "@/services/content/stackCategories"
import TIMELINE_KINDS from "@/services/content/timelineKinds"

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
})
