import { number, object, string } from "zod/mini"
import type ImageAsset from "@/types/content/ImageAsset.types"
import type { ZodMiniType } from "zod/mini"

const imageAssetSchema: ZodMiniType<ImageAsset> = object({
    src: string(),
    width: number(),
    height: number()
})

export default imageAssetSchema
