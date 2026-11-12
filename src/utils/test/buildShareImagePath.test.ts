import { describe, expect, it } from "vitest"
import SHARE_PAGES from "@/enum/sharePages.enum"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import buildShareImagePath from "@/utils/buildShareImagePath"

describe("buildShareImagePath", () => {
    it("devolve o caminho relativo da imagem da página no idioma", () => {
        expect(buildShareImagePath("home", "pt-BR")).toBe("images/share/pt-BR/home.png")
    })

    it("devolve um caminho único por página e idioma", () => {
        const paths = SHARE_PAGES.flatMap((page) =>
            SUPPORTED_LANGUAGES.map((language) => buildShareImagePath(page, language))
        )

        expect(new Set(paths).size).toBe(SHARE_PAGES.length * SUPPORTED_LANGUAGES.length)
    })
})
