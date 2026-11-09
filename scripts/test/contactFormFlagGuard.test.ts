import { spawnSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const FLAG = "VITE_CONTACT_FORM_ENABLED"
const WORKFLOWS_DIRECTORY = ".github/workflows"

const directories: string[] = []

async function createBuild(html: string): Promise<string> {
    const directory = await mkdtemp(join(tmpdir(), "contact-form-guard-"))
    directories.push(directory)
    await mkdir(join(directory, "pt-BR"), { recursive: true })
    await writeFile(join(directory, "pt-BR", "contact.html"), html)
    return directory
}

function listSourceFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) {
            return entry.name === "test" ? [] : listSourceFiles(path)
        }
        return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
    })
}

function runGuard(directory: string) {
    return spawnSync(
        "npx",
        ["tsx", "--tsconfig", "tsconfig.node.json", "scripts/checkContactForm.ts", directory],
        { encoding: "utf-8", shell: true }
    )
}

afterEach(async () => {
    await Promise.all(directories.splice(0).map((d) => rm(d, { recursive: true, force: true })))
})

describe("trava da flag do formulário de Contato", () => {
    it("nenhum workflow define a flag", () => {
        const offenders = readdirSync(WORKFLOWS_DIRECTORY)
            .filter((name) => /\.ya?ml$/.test(name))
            .filter((name) => readFileSync(join(WORKFLOWS_DIRECTORY, name), "utf-8").includes(FLAG))

        expect(offenders).toEqual([])
    })

    it("o .env.example define a flag como false", () => {
        expect(readFileSync(".env.example", "utf-8")).toMatch(new RegExp(`^${FLAG}=false$`, "m"))
    })

    it("só scripts/buildFatecForm.ts liga a flag dentro de scripts/", () => {
        const enablers = listSourceFiles("scripts")
            .filter((file) => {
                const content = readFileSync(file, "utf-8")
                return new RegExp(`${FLAG}\\s*:\\s*"true"`).test(content)
            })
            .map((file) => file.replaceAll("\\", "/"))

        expect(enablers).toEqual(["scripts/buildFatecForm.ts"])
    })

    it("src/ lê a flag só em src/utils/contactFormEnabled.ts", () => {
        const readers = listSourceFiles("src")
            .filter((file) => !file.endsWith(".d.ts"))
            .filter((file) => readFileSync(file, "utf-8").includes(FLAG))
            .map((file) => file.replaceAll("\\", "/"))

        expect(readers).toEqual(["src/utils/contactFormEnabled.ts"])
    })

    it("o package.json tem o script check:contact-form", () => {
        const scripts = JSON.parse(readFileSync("package.json", "utf-8")).scripts

        expect(scripts["check:contact-form"]).toContain("scripts/checkContactForm.ts")
    })

    it("o script sai com 1 e mensagem em português quando o build tem o formulário", async () => {
        const directory = await createBuild('<form id="contact-form"></form>')

        const result = runGuard(directory)

        expect(result.status).toBe(1)
        expect(`${result.stdout}${result.stderr}`).toMatch(/formulário de Contato/)
    }, 30000)

    it("o script sai com 0 quando o build não tem o formulário", async () => {
        const directory = await createBuild("<main><h1>Contato</h1></main>")

        const result = runGuard(directory)

        expect(result.status).toBe(0)
    }, 30000)

    it("o script sai com 1 quando o diretório do build não existe", async () => {
        const result = runGuard(join(tmpdir(), "contact-form-guard-ausente"))

        expect(result.status).toBe(1)
        expect(`${result.stdout}${result.stderr}`).toMatch(/não existe/)
    }, 30000)
})
