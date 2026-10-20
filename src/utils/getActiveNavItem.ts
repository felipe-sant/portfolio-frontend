import ROUTES from "@/routers/paths"
import type NavItemId from "@/types/navigation/NavItemId.types"

function isSection(pathname: string, section: string): boolean {
    return pathname === section || pathname.startsWith(`${section}/`)
}

function getActiveNavItem(pathname: string): NavItemId | undefined {
    if (pathname === ROUTES.home) {
        return "home"
    }

    if (isSection(pathname, ROUTES.projects)) {
        return "projects"
    }

    if (pathname === ROUTES.about) {
        return "about"
    }

    if (pathname === ROUTES.contact) {
        return "contact"
    }

    return undefined
}

export default getActiveNavItem
