import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import PageMeta from "@/components/PageMeta"
import setLanguage from "@/i18n/setLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import createLanguageLoader from "@/routers/createLanguageLoader"
import ROUTES from "@/routers/paths"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const SITE_URL = "http://localhost:5173"

const DEFAULT_META = (
    <PageMeta
        title={"Título da página"}
        description={"Descrição da página"}
        path={ROUTES.projects}
    />
)

function createPage(meta: ReactNode) {
    return (
        <>
            <h1>{"Página"}</h1>
            {meta}
            <Outlet />
        </>
    )
}

async function renderPage(entry: string, meta: ReactNode = DEFAULT_META) {
    const router = createMemoryRouter(
        SUPPORTED_LANGUAGES.map((language) => ({
            path: `/${language}/*`,
            element: createPage(meta),
            loader: createLanguageLoader(language)
        })),
        { initialEntries: [entry] }
    )
    const utils = render(<RouterProvider router={router} />)
    await screen.findByRole("heading", { name: "Página" })
    return utils
}

function getLink(rel: string, hreflang?: string) {
    const selector =
        hreflang === undefined ? `link[rel="${rel}"]` : `link[rel="${rel}"][hreflang="${hreflang}"]`
    return document.head.querySelector(selector)?.getAttribute("href")
}

function getMeta(key: string) {
    return document.head
        .querySelector(`meta[property="${key}"], meta[name="${key}"]`)
        ?.getAttribute("content")
}

describe("PageMeta", () => {
    it.each(["pt-BR", "en", "es"] as const)(
        "declara canônica autorreferente e hreflang recíprocos em %s",
        async (language) => {
            await renderPage(`/${language}/projects`)

            expect(getLink("canonical")).toBe(`${SITE_URL}/${language}/projects`)
            expect(getLink("alternate", "pt-BR")).toBe(`${SITE_URL}/pt-BR/projects`)
            expect(getLink("alternate", "en")).toBe(`${SITE_URL}/en/projects`)
            expect(getLink("alternate", "es")).toBe(`${SITE_URL}/es/projects`)
            expect(getLink("alternate", "x-default")).toBe(`${SITE_URL}/en/projects`)
            expect(document.head.querySelectorAll("link[rel='alternate'][hreflang]")).toHaveLength(
                4
            )
        }
    )

    it("deixa query e hash fora das URLs", async () => {
        await renderPage("/pt-BR/projects?type=web#a")

        expect(getLink("canonical")).toBe(`${SITE_URL}/pt-BR/projects`)
        expect(getMeta("og:url")).toBe(`${SITE_URL}/pt-BR/projects`)
        expect(getLink("alternate", "en")).toBe(`${SITE_URL}/en/projects`)
    })

    it("declara Open Graph e twitter:card", async () => {
        await renderPage("/pt-BR/projects")

        expect(getMeta("og:title")).toBe("Título da página")
        expect(getMeta("og:description")).toBe("Descrição da página")
        expect(getMeta("og:type")).toBe("website")
        expect(getMeta("og:url")).toBe(getLink("canonical"))
        expect(getMeta("og:image")).toBe(`${SITE_URL}/images/og-site.png`)
        expect(getMeta("og:image:width")).toBe("1200")
        expect(getMeta("og:image:height")).toBe("630")
        expect(getMeta("og:image:alt")).toBe("Gato ao lado do nome Luiz Felipe dos Santos")
        expect(getMeta("og:locale")).toBe("pt_BR")
        expect(
            Array.from(document.head.querySelectorAll('meta[property="og:locale:alternate"]')).map(
                (meta) => meta.getAttribute("content")
            )
        ).toEqual(["en_US", "es_ES"])
        expect(getMeta("twitter:card")).toBe("summary_large_image")
    })

    it("usa og:locale do idioma ativo", async () => {
        await renderPage("/es/projects")

        expect(getMeta("og:locale")).toBe("es_ES")
        expect(getMeta("og:image:alt")).toBe("Gato junto al nombre Luiz Felipe dos Santos")
    })

    it("atualiza as tags quando o idioma muda", async () => {
        await renderPage("/pt-BR/projects")

        await act(async () => {
            await setLanguage("en")
        })

        expect(getLink("canonical")).toBe(`${SITE_URL}/en/projects`)
        expect(getMeta("og:locale")).toBe("en_US")
        expect(getMeta("og:image:alt")).toBe("Cat next to the name Luiz Felipe dos Santos")
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "mantém a imagem padrão de 1200 por 630 sem as props de imagem em %s",
        async (language) => {
            await renderPage(`/${language}/projects`)

            expect(getMeta("og:image")).toBe(`${SITE_URL}/images/og-site.png`)
            expect(getMeta("og:image:width")).toBe("1200")
            expect(getMeta("og:image:height")).toBe("630")
        }
    )

    it("usa a imagem, o alt e as dimensões recebidos", async () => {
        await renderPage(
            "/pt-BR/projects",
            <PageMeta
                title={"Projeto"}
                description={"Resumo"}
                path={ROUTES.projects}
                image={"images/projects/x-large.webp"}
                imageAlt={"Captura do projeto"}
                imageWidth={1600}
                imageHeight={900}
            />
        )

        expect(getMeta("og:image")).toBe(`${SITE_URL}/images/projects/x-large.webp`)
        expect(getMeta("og:image:alt")).toBe("Captura do projeto")
        expect(getMeta("og:image:width")).toBe("1600")
        expect(getMeta("og:image:height")).toBe("900")
    })

    it("declara og:type article e o nome exato do documento na canônica e nos hreflang", async () => {
        await renderPage(
            "/en/projects",
            <PageMeta
                title={"Documento"}
                description={"Resumo"}
                path={ROUTES.projectDocument}
                params={{ id: "abc", name: "SETUP.md" }}
                type={"article"}
            />
        )

        expect(getMeta("og:type")).toBe("article")
        expect(getLink("canonical")).toBe(`${SITE_URL}/en/projects/abc/docs/SETUP.md`)
        expect(getLink("alternate", "es")).toBe(`${SITE_URL}/es/projects/abc/docs/SETUP.md`)
        expect(getLink("alternate", "pt-BR")).toBe(`${SITE_URL}/pt-BR/projects/abc/docs/SETUP.md`)
        expect(getLink("alternate", "x-default")).toBe(`${SITE_URL}/en/projects/abc/docs/SETUP.md`)
        expect(getMeta("og:locale")).toBe("en_US")
        expect(getMeta("twitter:card")).toBe("summary_large_image")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = await renderPage("/pt-BR/projects")

        await expectNoAxeViolations(container)
    }, 15000)
})
