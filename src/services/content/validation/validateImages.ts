import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import readImageSize from "@/services/content/readImageSize"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import isNonEmptyString from "@/services/content/validation/isNonEmptyString"
import requireList from "@/services/content/validation/requireList"
import requireText from "@/services/content/validation/requireText"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const MAX_IMAGES = 5
const MAX_ALT_LENGTH = 150
const MAX_LARGE_WIDTH = 1600
const MAX_LARGE_BYTES = 200 * 1024
const MAX_SMALL_BYTES = 80 * 1024
const RATIO_TOLERANCE = 0.01
const WIDESCREEN = 16 / 9
const SQUARE = 1

type Variant = "large" | "small"

function isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0
}

function checkFile(
    asset: Record<string, unknown>,
    variant: Variant,
    path: string,
    snapshot: ContentSnapshot,
    issues: ContentIssue[]
): void {
    const src = asset.src

    if (!isNonEmptyString(src) || src.startsWith("/")) {
        issues.push({
            path: `${path}.src`,
            message: "Deve ser um caminho relativo sem barra inicial ou uma URL https:"
        })
        return
    }
    if (src.startsWith("https://")) {
        return
    }

    const bytes = snapshot.files[src]

    if (!bytes) {
        issues.push({
            path: `${path}.src`,
            message: `Arquivo de imagem inexistente em public/: ${src}`
        })
        return
    }

    const maxBytes = variant === "large" ? MAX_LARGE_BYTES : MAX_SMALL_BYTES
    if (bytes.length > maxBytes) {
        issues.push({
            path: `${path}.src`,
            message: `Arquivo com ${bytes.length} bytes; o limite da variante ${variant} é ${maxBytes}`
        })
    }

    if (!src.endsWith(".webp")) {
        return
    }

    try {
        const actual = readImageSize(bytes)
        if (actual.width !== asset.width || actual.height !== asset.height) {
            issues.push({
                path: `${path}.width`,
                message: `width e height declarados (${String(asset.width)}x${String(asset.height)}) diferem do arquivo (${actual.width}x${actual.height})`
            })
        }
    } catch (error) {
        issues.push({
            path: `${path}.src`,
            message: error instanceof Error ? error.message : String(error)
        })
    }
}

function validateAsset(
    asset: unknown,
    variant: Variant,
    path: string,
    ratio: number,
    snapshot: ContentSnapshot,
    issues: ContentIssue[]
): number | undefined {
    if (!checkObjectKeys(asset, path, ["src", "width", "height"], [], issues)) {
        return undefined
    }
    checkFile(asset, variant, path, snapshot, issues)

    if (!isPositiveInteger(asset.width) || !isPositiveInteger(asset.height)) {
        issues.push({ path, message: "width e height devem ser inteiros positivos" })
        return undefined
    }
    if (Math.abs(asset.width / asset.height - ratio) > RATIO_TOLERANCE) {
        issues.push({
            path,
            message: `A proporção ${asset.width}x${asset.height} deve ser ${ratio === WIDESCREEN ? "16:9" : "1:1"}`
        })
    }
    if (variant === "large" && asset.width > MAX_LARGE_WIDTH) {
        issues.push({
            path: `${path}.width`,
            message: `A variante large tem no máximo ${MAX_LARGE_WIDTH}px de largura`
        })
    }

    return asset.width / asset.height
}

function validateResponsive(
    value: Record<string, unknown>,
    path: string,
    ratio: number,
    snapshot: ContentSnapshot,
    issues: ContentIssue[]
): void {
    const large = validateAsset(value.large, "large", `${path}.large`, ratio, snapshot, issues)
    const small = validateAsset(value.small, "small", `${path}.small`, ratio, snapshot, issues)

    if (large !== undefined && small !== undefined && Math.abs(large - small) > RATIO_TOLERANCE) {
        issues.push({ path, message: "As variantes large e small devem ter a mesma proporção" })
    }
}

function validateImages(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const { projects = [], profile } = snapshot.languages[lang]

        projects.forEach((project, index) => {
            const path = `content/${lang}/projects.json#items[${index}].images`
            const images = requireList(project.images, path, issues)

            if (images.length > MAX_IMAGES) {
                issues.push({ path, message: `${images.length} imagens; o máximo é ${MAX_IMAGES}` })
            }
            images.forEach((image, position) => {
                const imagePath = `${path}[${position}]`
                if (
                    checkObjectKeys(
                        image,
                        imagePath,
                        ["large", "small", "alt"],
                        ["caption"],
                        issues
                    )
                ) {
                    requireText(image, "alt", imagePath, issues, MAX_ALT_LENGTH)
                    requireText(image, "caption", imagePath, issues)
                    validateResponsive(image, imagePath, WIDESCREEN, snapshot, issues)
                }
            })
        })

        if (profile && "photo" in profile) {
            const path = `content/${lang}/profile.json#photo`
            if (checkObjectKeys(profile.photo, path, ["large", "small"], [], issues)) {
                validateResponsive(profile.photo, path, SQUARE, snapshot, issues)
            }
        }
    }

    return issues
}

export default validateImages
