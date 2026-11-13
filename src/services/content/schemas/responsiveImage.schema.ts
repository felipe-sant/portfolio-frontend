import { object } from "zod/mini"
import imageAssetSchema from "@/services/content/schemas/imageAsset.schema"
import type ResponsiveImage from "@/types/content/ResponsiveImage.types"
import type { ZodMiniType } from "zod/mini"

const responsiveImageSchema: ZodMiniType<ResponsiveImage> = object({
    large: imageAssetSchema,
    small: imageAssetSchema
})

export default responsiveImageSchema
