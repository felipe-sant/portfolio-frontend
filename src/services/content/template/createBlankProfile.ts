import type Profile from "@/types/profile/Profile.types"

function createBlankProfile(): Profile {
    return {
        role: "",
        homeIntro: "",
        summary: "",
        location: { city: "", region: "", countryCode: "", detail: "" },
        availability: { isAvailable: false, label: "" },
        photo: {
            large: { src: "", width: 0, height: 0 },
            small: { src: "", width: 0, height: 0 }
        },
        aboutParagraphs: [""],
        workPrinciples: [""],
        stack: [{ category: "frontend", items: [{ name: "", isPrimary: false }] }],
        contact: { email: "", responseTime: { label: "", detail: "" } },
        links: { github: "", linkedin: "" }
    }
}

export default createBlankProfile
