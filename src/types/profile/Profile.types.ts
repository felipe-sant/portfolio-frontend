import type ResponsiveImage from "@/types/content/ResponsiveImage.types"
import type StackGroup from "@/types/content/StackGroup.types"
import type Availability from "@/types/profile/Availability.types"
import type ContactChannels from "@/types/profile/ContactChannels.types"
import type Location from "@/types/profile/Location.types"
import type SocialLinks from "@/types/profile/SocialLinks.types"

type Profile = {
    role: string
    homeIntro: string
    summary: string
    location: Location
    availability: Availability
    photo?: ResponsiveImage
    aboutParagraphs: string[]
    workPrinciples: string[]
    stack: StackGroup[]
    contact: ContactChannels
    links: SocialLinks
}

export default Profile
