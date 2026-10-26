import { describe, expect, it } from "vitest"
import getProjectContext from "@/utils/getProjectContext"

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

describe("getProjectContext", () => {
    it("devolve o mesmo id para o projeto e para um documento dele", () => {
        expect(getProjectContext(`/projects/${ID}`)).toEqual({ id: ID })
        expect(getProjectContext(`/projects/${ID}/docs/SETUP.md`)).toEqual({ id: ID })
    })

    it.each([
        "/projects",
        "/about",
        "/",
        `/projects/${ID}/outra`,
        `/projects/${ID}/docs`,
        `/projects/${ID}/docs/a/b`,
        "/projects/nao-e-um-uuid",
        "/projects/nao-e-um-uuid/docs/SETUP.md"
    ])("devolve undefined para %s", (path) => {
        expect(getProjectContext(path)).toBeUndefined()
    })
})
