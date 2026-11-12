import { array, boolean, email, object, optional, regex, string } from "zod/mini"
import responsiveImageSchema from "@/services/content/schemas/responsiveImage.schema"
import stackGroupSchema from "@/services/content/schemas/stackGroup.schema"
import type Profile from "@/types/profile/Profile.types"
import type { ZodMiniType } from "zod/mini"

const profileSchema: ZodMiniType<Profile> = object({
    role: string(),
    homeIntro: string(),
    summary: string(),
    location: object({
        city: string(),
        region: string(),
        countryCode: string().check(regex(/^[A-Z]{2}$/)),
        detail: optional(string())
    }),
    availability: object({
        isAvailable: boolean(),
        label: string()
    }),
    photo: optional(responsiveImageSchema),
    aboutParagraphs: array(string()),
    workPrinciples: array(string()),
    stack: array(stackGroupSchema),
    contact: object({
        email: email(),
        responseTime: optional(
            object({
                label: string(),
                detail: optional(string())
            })
        )
    }),
    links: object({
        github: optional(string()),
        linkedin: optional(string())
    })
})

export default profileSchema
