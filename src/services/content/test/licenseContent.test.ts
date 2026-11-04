import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import validateContent from "@/services/content/validation/validateContent"
import readContentSnapshot from "@/testUtils/readContentSnapshot"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

const MIT_A = "c5014515256bb0c9f4a8f05c0b82a34df0377d31"
const MIT_B = "b7a1dc633da60f60cc3fe44ad9077ff11059e289"

const LICENSES = [
    {
        project: "01a13188-a1da-7d4b-901c-e7bcc81d497b",
        id: "01a17614-ccc2-7606-871c-ba17eec301fc",
        sha: MIT_A,
        updatedAt: "2025-12-11"
    },
    {
        project: "01a131df-93ee-72f3-8c7a-f67501e47a7a",
        id: "01a17614-cf8e-7df8-b3f6-49262756aa73",
        sha: MIT_A,
        updatedAt: "2025-06-29"
    },
    {
        project: "01a131fc-d24c-7c70-887b-0d055f57d251",
        id: "01a17614-d25b-7f9b-93ba-cef6dc876729",
        sha: MIT_B,
        updatedAt: "2024-12-27"
    },
    {
        project: "01a13216-9960-7a66-8288-462bf96ec9a5",
        id: "01a17614-d52d-7268-a4ed-2bffa6df5ed1",
        sha: MIT_A,
        updatedAt: "2025-06-19"
    },
    {
        project: "01a13229-0594-7b2f-a012-ecf61257f6ad",
        id: "01a17614-d80b-747f-b18e-8afa792f30d5",
        sha: MIT_B,
        updatedAt: "2024-09-08"
    },
    {
        project: "01a1323d-b9bc-73c0-8bac-2e93e30ee193",
        id: "01a17614-dada-7f65-aa85-da32106d31cf",
        sha: MIT_B,
        updatedAt: "2026-04-15"
    }
]

function root(...parts: string[]) {
    return join(process.cwd(), "public", "content", ...parts)
}

async function readProjects(language: string): Promise<ProjectRecord[]> {
    const parsed: { items: ProjectRecord[] } = JSON.parse(
        await readFile(root(language, "projects.json"), "utf-8")
    )

    return parsed.items
}

function gitBlobSha(content: Buffer) {
    return createHash("sha1").update(`blob ${content.length}\0`).update(content).digest("hex")
}

describe.each(SUPPORTED_LANGUAGES)("LICENSE dos projetos reais em %s", (language) => {
    it.each(LICENSES)(
        "declara o LICENSE de $project como texto neutro em inglês, depois dos outros documentos",
        async ({ project, id, updatedAt }) => {
            const record = (await readProjects(language)).find((item) => item.id === project)
            const names = record?.documents.map((document) => document.name)

            expect(names?.[0]).toBe("README.md")
            expect(names?.at(-1)).toBe("LICENSE")
            expect(record?.documents.at(-1)).toEqual({
                id,
                name: "LICENSE",
                format: "text",
                translated: false,
                contentLanguage: "en",
                updatedAt
            })
        }
    )
})

describe("LICENSE dos projetos reais", () => {
    it.each(LICENSES)(
        "copia literal do repositório em shared de $project",
        async ({ project, sha }) => {
            const content = await readFile(root("shared", "projects", project, "docs", "LICENSE"))

            expect(content.length).toBeGreaterThan(0)
            expect(gitBlobSha(content)).toBe(sha)
        }
    )

    it("não exige LICENSE: o conteúdo continua válido sem o documento e sem o arquivo", async () => {
        const snapshot = await readContentSnapshot()

        for (const language of SUPPORTED_LANGUAGES) {
            for (const project of snapshot.languages[language].projects ?? []) {
                project.documents = project.documents.filter(
                    (document) => document.name !== "LICENSE"
                )
            }
        }
        for (const file of Object.keys(snapshot.files)) {
            if (file.endsWith("/docs/LICENSE")) {
                delete snapshot.files[file]
            }
        }

        expect(validateContent(snapshot)).toEqual([])
    })
})
