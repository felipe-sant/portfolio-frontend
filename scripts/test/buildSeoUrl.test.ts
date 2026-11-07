// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import ROUTES from "@/routers/paths"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

const ORIGIN = "https://example.com"

describe("buildSeoUrl", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it("monta a URL de página sob a raiz sem barra duplicada nem final", () => {
        expect(buildSeoUrl(ORIGIN, "/", "/pt-BR")).toBe("https://example.com/pt-BR")
        expect(buildSeoUrl(ORIGIN, "/", "/en/projects/")).toBe("https://example.com/en/projects")
    })

    it("inclui o subcaminho da Fatec", () => {
        expect(buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, "/pt-BR")).toBe(
            `${FATEC_SITE_URL}/ra2581392423047/pt-BR`
        )
    })

    it("mantém o nome do arquivo para robots.txt e cv/", () => {
        expect(buildSeoUrl(ORIGIN, "/", "robots.txt")).toBe("https://example.com/robots.txt")
        expect(buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, "cv/cv-en.pdf")).toBe(
            `${FATEC_SITE_URL}/ra2581392423047/cv/cv-en.pdf`
        )
    })

    it.each([
        ["/", "pt-BR", ROUTES.home, "/pt-BR", undefined],
        ["/", "en", ROUTES.projects, "/en/projects", undefined],
        [
            FATEC_BASE_PATH,
            "es",
            ROUTES.projectDocument,
            "/es/projects/abc/docs/SETUP.md",
            { id: "abc", name: "SETUP.md" }
        ]
    ] as const)(
        "é idêntica à canônica de buildAbsoluteUrl com base %s em %s",
        (base, language, route, path, params) => {
            vi.stubEnv("VITE_SITE_URL", ORIGIN)
            vi.stubEnv("BASE_URL", base)

            expect(buildSeoUrl(ORIGIN, base, path)).toBe(buildAbsoluteUrl(route, language, params))
        }
    )
})
