import {
    array,
    boolean,
    enum as enumeration,
    minLength,
    object,
    optional,
    regex,
    string
} from "zod/mini"
import DOCUMENT_FORMATS from "@/enum/documentFormats.enum"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_STATUSES from "@/enum/projectStatuses.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import imageAssetSchema from "@/services/content/schemas/imageAsset.schema"
import responsiveImageSchema from "@/services/content/schemas/responsiveImage.schema"
import stackGroupSchema from "@/services/content/schemas/stackGroup.schema"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type { ZodMiniType } from "zod/mini"

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const projectRecordSchema: ZodMiniType<ProjectRecord> = object({
    id: string(),
    title: string(),
    summary: string(),
    date: string().check(regex(MONTH_PATTERN)),
    types: array(enumeration(PROJECT_TYPES)).check(minLength(1)),
    category: enumeration(PROJECT_CATEGORIES),
    featured: boolean(),
    experiment: boolean(),
    cardTechnologies: array(string()),
    cover: optional(responsiveImageSchema),
    role: string(),
    duration: string(),
    team: string(),
    status: enumeration(PROJECT_STATUSES),
    stack: array(stackGroupSchema),
    demoUrl: optional(string()),
    repositoryUrl: optional(string()),
    images: array(
        object({
            large: imageAssetSchema,
            small: imageAssetSchema,
            alt: string(),
            caption: optional(string())
        })
    ),
    documents: array(
        object({
            id: string(),
            name: string(),
            format: enumeration(DOCUMENT_FORMATS),
            translated: boolean(),
            contentLanguage: optional(enumeration(SUPPORTED_LANGUAGES)),
            updatedAt: optional(string().check(regex(DAY_PATTERN)))
        })
    ),
    related: array(object({ id: string() })),
    updatedAt: optional(string().check(regex(DAY_PATTERN)))
})

export default projectRecordSchema
