import { loadEnv } from "vite"
import resolveSiteUrl from "@scripts/resolveSiteUrl"

function resolveSeoOrigin(directory = process.cwd()): string {
    return resolveSiteUrl(loadEnv("production", directory, "VITE_").VITE_SITE_URL)
}

export default resolveSeoOrigin
