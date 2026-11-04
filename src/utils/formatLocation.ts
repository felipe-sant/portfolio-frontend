import type Location from "@/types/profile/Location.types"

const LOCATION_SEPARATOR = " · "

function formatLocation({ city, region }: Pick<Location, "city" | "region">): string {
    return [city, region].join(LOCATION_SEPARATOR)
}

export default formatLocation
