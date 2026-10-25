/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_SITE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const __BUILD_YEAR__: number
declare const __APP_VERSION__: string
