import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import validateLang from "@/services/content/validateLang"
import type NormalizedProjectListParams from "@/types/project/NormalizedProjectListParams.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"

type RawProjectListParams = { [Key in keyof ProjectListParams]?: unknown }
type FieldIssue = { field: string; code: string; message: string }

const DEFAULT_SORT = "recent"
const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 9
const MAX_QUERY_LENGTH = 100
const MAX_LIMIT = 50
const MAX_FILTER_VALUES = 10
const MAX_TECH_LENGTH = 100
const YEAR_PATTERN = /^\d{4}$/

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
    return options.some((option) => option === value)
}

function invalidValue(field: string, message: string): FieldIssue {
    return { field, code: "INVALID_VALUE", message }
}

function isValidList(value: unknown, isValidItem: (item: string) => boolean): boolean {
    return (
        Array.isArray(value) &&
        value.length <= MAX_FILTER_VALUES &&
        value.every((item) => typeof item === "string" && isValidItem(item))
    )
}

function pickList(value: unknown): string[] | undefined {
    return Array.isArray(value) && value.length > 0 ? value.map(String) : undefined
}

function validateProjectListParams(params: RawProjectListParams): NormalizedProjectListParams {
    validateLang(params.lang)

    const issues: FieldIssue[] = []
    const { q, type, category, tech, year, featured, sort, offset, limit } = params

    if (q !== undefined && typeof q !== "string") {
        issues.push(invalidValue("q", "Use um texto."))
    } else if (q !== undefined && q.length > MAX_QUERY_LENGTH) {
        issues.push({
            field: "q",
            code: "TOO_LONG",
            message: `Use no máximo ${MAX_QUERY_LENGTH} caracteres.`
        })
    }

    if (type !== undefined && !isOneOf(PROJECT_TYPES, type)) {
        issues.push(invalidValue("type", `Use ${PROJECT_TYPES.join(", ")}.`))
    }

    if (category !== undefined && !isOneOf(PROJECT_CATEGORIES, category)) {
        issues.push(invalidValue("category", `Use ${PROJECT_CATEGORIES.join(", ")}.`))
    }

    if (
        tech !== undefined &&
        !isValidList(tech, (item) => item.length >= 1 && item.length <= MAX_TECH_LENGTH)
    ) {
        issues.push(
            invalidValue(
                "tech",
                `Use até ${MAX_FILTER_VALUES} textos de 1 a ${MAX_TECH_LENGTH} caracteres.`
            )
        )
    }

    if (year !== undefined && !isValidList(year, (item) => YEAR_PATTERN.test(item))) {
        issues.push(invalidValue("year", `Use até ${MAX_FILTER_VALUES} anos com quatro dígitos.`))
    }

    if (featured !== undefined && featured !== true) {
        issues.push(invalidValue("featured", "Use true."))
    }

    if (sort !== undefined && !isOneOf(PROJECT_SORTS, sort)) {
        issues.push(invalidValue("sort", `Use ${PROJECT_SORTS.join(", ")}.`))
    }

    if (offset !== undefined && !(Number.isInteger(offset) && Number(offset) >= 0)) {
        issues.push(invalidValue("offset", "Use um inteiro maior ou igual a 0."))
    }

    if (
        limit !== undefined &&
        !(Number.isInteger(limit) && Number(limit) >= 1 && Number(limit) <= MAX_LIMIT)
    ) {
        issues.push(invalidValue("limit", `Use um inteiro de 1 a ${MAX_LIMIT}.`))
    }

    if (issues.length > 0) {
        throw new ContentException(
            createContentError(
                400,
                "INVALID_PARAMETER",
                "Um ou mais parâmetros da consulta são inválidos.",
                issues
            )
        )
    }

    return {
        lang: params.lang,
        q: typeof q === "string" ? q : undefined,
        type: isOneOf(PROJECT_TYPES, type) ? type : undefined,
        category: isOneOf(PROJECT_CATEGORIES, category) ? category : undefined,
        tech: pickList(tech),
        year: pickList(year),
        featured: featured === true ? true : undefined,
        sort: isOneOf(PROJECT_SORTS, sort) ? sort : DEFAULT_SORT,
        offset: typeof offset === "number" ? offset : DEFAULT_OFFSET,
        limit: typeof limit === "number" ? limit : DEFAULT_LIMIT
    }
}

export default validateProjectListParams
