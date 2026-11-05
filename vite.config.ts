import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { loadEnv, type Plugin } from "vite"
import { defineConfig, configDefaults, coverageConfigDefaults } from "vitest/config"
import react from "@vitejs/plugin-react"
import resolveBase from "./scripts/resolveBase.ts"
import resolveSiteUrl from "./scripts/resolveSiteUrl.ts"

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"))

const serverEntries = {
    "entry-server": fileURLToPath(new URL("./src/entry-server.tsx", import.meta.url)),
    routes: fileURLToPath(new URL("./src/routers/routes.tsx", import.meta.url)),
    prerenderRoutes: fileURLToPath(new URL("./src/prerender/prerenderRoutes.ts", import.meta.url))
}

const markdownCharset: Plugin = {
    name: "markdown-charset",
    configureServer(server) {
        server.middlewares.use((request, response, next) => {
            if (request.url?.split("?")[0].endsWith(".md")) {
                response.setHeader("Content-Type", "text/markdown; charset=utf-8")
            }
            next()
        })
    }
}

export default defineConfig(({ command, mode, isSsrBuild }) => {
    if (command === "build") {
        resolveSiteUrl(loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL)
    }

    return {
        base: resolveBase(process.env.BASE_PATH),
        build: isSsrBuild ? { rollupOptions: { input: serverEntries } } : {},
        publicDir: isSsrBuild ? false : "public",
        plugins: [react(), markdownCharset],
        define: {
            __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
            __APP_VERSION__: JSON.stringify(version)
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                "@scripts": fileURLToPath(new URL("./scripts", import.meta.url))
            }
        },
        test: {
            environment: "jsdom",
            pool: "vmThreads",
            setupFiles: ["./src/setupTests.ts"],
            globalSetup: ["./src/testUtils/prerenderGlobalSetup.ts"],
            exclude: [...configDefaults.exclude, ".claude/**", "e2e/**"],
            coverage: {
                provider: "v8",
                reporter: ["text", "json", "json-summary", "html"],
                exclude: [
                    ...coverageConfigDefaults.exclude,
                    "src/entry-client.tsx",
                    "src/types/**",
                    "vite.config.ts",
                    "scripts/buildFatec.ts",
                    "scripts/generateOgImage.ts",
                    "scripts/generateResume.ts",
                    "scripts/prerender.ts",
                    "scripts/prepareRelease.ts",
                    "scripts/previewFatec.ts",
                    "scripts/publishFatecDocs.ts",
                    "src/setupTests.ts",
                    "src/testUtils/prerenderGlobalSetup.ts"
                ],
                thresholds: {
                    statements: 80,
                    branches: 80,
                    functions: 80,
                    lines: 80
                }
            }
        }
    }
})
