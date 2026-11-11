import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import isWithinKilobytes from "@scripts/isWithinKilobytes"
import readmeScreenshotPath from "@scripts/readmeScreenshotPath"

const ROOT = process.cwd()
const MAX_LINES = 100
const MAX_KILOBYTES = 300
const PNG_SIGNATURE = "89504e470d0a1a0a"
const FATEC_SITE = "https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/pt-BR/"
const FATEC_REPOSITORY = "https://github.com/fatec-jacarei-dsm-portfolio/ra2581392423047"
const DOCS_ORDER = [
    "docs/README.md",
    "docs/product/overview.md",
    "docs/architecture/frontend.md",
    "docs/adr/README.md",
    "docs/setup/environments.md",
    "docs/setup/development.md"
]
const REMOVED_HEADINGS = [
    "Requisitos do projeto",
    "Requisitos de ambiente",
    "Comandos",
    "Estrutura de `src/` e convenções",
    "Dados do conteúdo",
    "Internacionalização",
    "Design system",
    "Testes e cobertura",
    "CI e git hooks"
]
const LINKED_DOCUMENTS = [
    "README.md",
    "docs/README.md",
    "docs/setup/development.md",
    "docs/architecture/code-structure.md"
]

function readProjectFile(path: string): string {
    return readFileSync(join(ROOT, path), "utf-8")
}

const readme = readProjectFile("README.md")
const packageJson: { homepage: string; engines: { node: string } } = JSON.parse(
    readProjectFile("package.json")
)

function slugify(heading: string): string {
    return heading
        .toLowerCase()
        .replace(/`/g, "")
        .replace(/[^\p{L}\p{N}\- _]/gu, "")
        .trim()
        .replace(/ /g, "-")
}

function listAnchors(path: string): string[] {
    return readProjectFile(path)
        .split("\n")
        .filter((line) => /^#{1,6} /.test(line))
        .map((line) => slugify(line.replace(/^#{1,6} /, "")))
}

function listTargets(path: string): string[] {
    const content = readProjectFile(path)
    const markdownTargets = Array.from(content.matchAll(/\]\(([^)\s]+)\)/g), (match) => match[1])
    const attributeTargets = Array.from(
        content.matchAll(/\b(?:src|srcset)="([^"]+)"/g),
        (match) => match[1]
    )
    return [...markdownTargets, ...attributeTargets]
}

function isLocal(target: string): boolean {
    return !/^(https?:|mailto:)/.test(target)
}

function listBadges(): string[] {
    return Array.from(
        readme.matchAll(/\[!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)/g),
        (match) => match[0]
    )
}

function listHeadings(): string[] {
    return readme
        .split("\n")
        .filter((line) => /^#{2,6} /.test(line))
        .map((line) => line.replace(/^#{2,6} /, ""))
}

function readDocsSection(): string {
    const start = readme.indexOf("## Por onde começar a ler `docs/`")
    return readme.slice(start).split(/\n## /)[0]
}

describe("README.md", () => {
    it("tem de 4 a 6 badges", () => {
        const badges = listBadges()

        expect(badges.length).toBeGreaterThanOrEqual(4)
        expect(badges.length).toBeLessThanOrEqual(6)
    })

    it("tem o badge de CI apontando para o ci.yml e o de licença apontando para o LICENSE", () => {
        const badges = listBadges()

        expect(
            badges.some(
                (badge) =>
                    badge.includes("/actions/workflows/ci.yml/badge.svg") &&
                    badge.endsWith("/actions/workflows/ci.yml)")
            )
        ).toBe(true)
        expect(
            badges.some(
                (badge) => badge.includes("/github/license/") && badge.endsWith("](LICENSE)")
            )
        ).toBe(true)
    })

    it("tem o badge do Node com o valor do engines.node do package.json", () => {
        const match = readme.match(/img\.shields\.io\/badge\/node-([^-)]+)-/)

        expect(match).not.toBeNull()
        expect(decodeURIComponent(match?.[1] ?? "")).toBe(packageJson.engines.node)
    })

    it("tem o link Ver o site igual ao homepage do package.json", () => {
        const match = readme.match(/\[Ver o site\]\(([^)]+)\)/)

        expect(match?.[1]).toBe(packageJson.homepage)
    })

    it("resume o perfil como Junior full stack developer com React, TypeScript e Node.js", () => {
        const summary = readme.split("\n")[2]

        expect(summary).toContain(
            "a Junior full stack developer working with React, TypeScript and Node.js"
        )
    })

    it("cita o site e o repositório da Fatec", () => {
        expect(readme).toContain(`](${FATEC_SITE})`)
        expect(readme).toContain(`](${FATEC_REPOSITORY})`)
    })

    it("começa por título, resumo em inglês, badges, link do site e capturas, nessa ordem", () => {
        const positions = [
            readme.indexOf("# Portfólio"),
            readme.indexOf("Personal portfolio"),
            readme.indexOf("[!["),
            readme.indexOf("[Ver o site]"),
            readme.indexOf("<picture>")
        ]

        expect(positions.every((position) => position >= 0)).toBe(true)
        expect(positions).toEqual(positions.toSorted((a, b) => a - b))
    })

    it("mostra a captura escura por prefers-color-scheme e a clara como padrão", () => {
        expect(readme).toContain('<source media="(prefers-color-scheme: dark)"')
        expect(readme).toContain(readmeScreenshotPath("dark"))
        expect(readme).toContain(`src="${readmeScreenshotPath("light")}"`)
    })

    it("tem até 100 linhas", () => {
        expect(readme.split("\n").length).toBeLessThanOrEqual(MAX_LINES)
    })

    it("não tem as seções que foram para docs/", () => {
        const headings = listHeadings()

        for (const removed of REMOVED_HEADINGS) {
            expect(headings).not.toContain(removed)
        }
    })

    it("não tem comentário HTML", () => {
        expect(readme).not.toContain("<!--")
    })

    it("lista os documentos de docs/ na ordem de leitura", () => {
        const targets = Array.from(
            readDocsSection().matchAll(/\]\(([^)\s]+)\)/g),
            (match) => match[1]
        )

        expect(targets.slice(0, DOCS_ORDER.length)).toEqual(DOCS_ORDER)
    })
})

describe("imagens do README.md", () => {
    const images = listTargets("README.md").filter(
        (target) => isLocal(target) && target.endsWith(".png")
    )

    it("referencia as duas capturas", () => {
        expect(new Set(images)).toEqual(
            new Set([readmeScreenshotPath("light"), readmeScreenshotPath("dark")])
        )
    })

    it.each([readmeScreenshotPath("light"), readmeScreenshotPath("dark")])(
        "%s existe, é um PNG de 1280 por 800 e pesa até 300 KB",
        (path) => {
            const file = readFileSync(join(ROOT, path))

            expect(file.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE)
            expect(file.readUInt32BE(16)).toBe(1280)
            expect(file.readUInt32BE(20)).toBe(800)
            expect(isWithinKilobytes(statSync(join(ROOT, path)).size, MAX_KILOBYTES)).toBe(true)
        }
    )
})

describe("links dos documentos", () => {
    it.each(LINKED_DOCUMENTS)("todo link relativo de %s resolve para arquivo existente", (path) => {
        const broken = listTargets(path)
            .filter((target) => isLocal(target))
            .filter((target) => !target.startsWith("#"))
            .filter(
                (target) => !existsSync(resolve(dirname(join(ROOT, path)), target.split("#")[0]))
            )

        expect(broken).toEqual([])
    })

    it.each(LINKED_DOCUMENTS)("toda âncora de link relativo de %s existe no destino", (path) => {
        const broken = listTargets(path)
            .filter((target) => isLocal(target) && target.includes("#"))
            .filter((target) => {
                const [file, anchor] = target.split("#")
                const destination = file ? join(dirname(path), file) : path
                return destination.endsWith(".md") && !listAnchors(destination).includes(anchor)
            })

        expect(broken).toEqual([])
    })
})

describe("docs/README.md", () => {
    const index = readProjectFile("docs/README.md")

    it("lista no índice os dois arquivos que receberam o conteúdo do README", () => {
        expect(index).toContain("](setup/development.md)")
        expect(index).toContain("](architecture/code-structure.md)")
    })
})
