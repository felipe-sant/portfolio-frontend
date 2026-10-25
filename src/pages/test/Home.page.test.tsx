import { beforeEach, describe, expect, it } from "vitest"
import { act, screen } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import HomePage from "@/pages/Home.page"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"

const SITE_URL = "http://localhost:5173"

function renderHomePage() {
    return renderWithStore(<HomePage />)
}

function readJsonLd() {
    const script = document.querySelector('script[type="application/ld+json"]')
    return JSON.parse(script?.textContent ?? "null")
}

beforeEach(() => {
    stubContentFetch({
        "content/pt-BR/profile.json": buildProfile({
            links: { github: "https://github.com/example" }
        }),
        "content/en/profile.json": buildProfile(),
        "content/es/profile.json": buildProfile()
    })
})

describe("HomePage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = renderHomePage()

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza o título principal", () => {
        renderHomePage()

        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
    })

    it("renderiza a frase de apresentação", () => {
        renderHomePage()

        expect(
            screen.getByText("Trabalho em produtos web de ponta a ponta, do banco à interface.")
        ).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        renderHomePage()

        expect(document.title).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato."
        )
    })

    it("traduz título e meta description quando o idioma é en", async () => {
        await setLanguage("en")

        renderHomePage()

        expect(document.title).toBe("Luiz Felipe dos Santos · Full stack developer")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfolio of Luiz Felipe dos Santos, full stack developer in TypeScript: projects, background and contact."
        )
    })

    it("traduz os metadados quando o idioma é es", async () => {
        await setLanguage("es")

        renderHomePage()

        expect(document.title).toBe("Luiz Felipe dos Santos · Desarrollador full stack")
    })

    it("atualiza texto, metadados e lang do html ao trocar o idioma com a página aberta", async () => {
        renderHomePage()
        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()

        await act(() => setLanguage("es"))

        expect(
            screen.getByRole("heading", { name: "Desarrollador full stack en TypeScript" })
        ).toBeInTheDocument()
        expect(document.title).toBe("Luiz Felipe dos Santos · Desarrollador full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portafolio de Luiz Felipe dos Santos, desarrollador full stack en TypeScript: proyectos, trayectoria y contacto."
        )
        expect(document.documentElement.lang).toBe("es")
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "declara canônica, quatro hreflang e JSON-LD em %s",
        async (language) => {
            await setLanguage(language)

            renderHomePage()

            expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
                `${SITE_URL}/${language}`
            )
            expect(document.head.querySelectorAll("link[rel='alternate'][hreflang]")).toHaveLength(
                4
            )
            const [website, person] = readJsonLd()["@graph"]
            expect(website["@type"]).toBe("WebSite")
            expect(website.inLanguage).toBe(language)
            expect(person["@id"]).toBe(`${SITE_URL}/${language}#person`)
            expect(website.publisher["@id"]).toBe(person["@id"])
        }
    )

    it("completa sameAs e knowsAbout com o perfil carregado", async () => {
        renderHomePage()

        await act(async () => {
            await Promise.resolve()
        })

        await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        await expect.poll(() => readJsonLd()["@graph"][1].knowsAbout).toEqual(["TypeScript"])
        expect(readJsonLd()["@graph"][1].sameAs).toEqual(["https://github.com/example"])
    })
})
