import { describe, expect, it } from "vitest"
import aboutElementIds from "@/utils/aboutElementIds"

describe("aboutElementIds", () => {
    it("mantém os quatro ids de foco da página Informações", () => {
        expect(aboutElementIds).toEqual({
            profileHeading: "about-hero-heading",
            profileAlert: "about-profile-alert",
            timelineHeading: "about-trajectory-heading",
            timelineAlert: "about-timeline-alert"
        })
    })
})
