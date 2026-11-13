import { useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import ROUTES from "@/routers/paths"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import buildBreadcrumbJsonLd from "@/utils/buildBreadcrumbJsonLd"
import buildProjectsJsonLd from "@/utils/buildProjectsJsonLd"

function useProjectsSeo(firstPageItems: ProjectSummary[] | undefined) {
    const { t } = useTranslation(["projects", "common"])
    const language = useLanguage()

    return {
        jsonLd: firstPageItems
            ? buildProjectsJsonLd(
                  language,
                  { title: t("meta.title"), description: t("meta.description") },
                  firstPageItems
              )
            : undefined,
        breadcrumbJsonLd: firstPageItems
            ? buildBreadcrumbJsonLd(language, [
                  { name: t("common:navigation.home"), path: ROUTES.home },
                  { name: t("common:navigation.projects"), path: ROUTES.projects }
              ])
            : undefined
    }
}

export default useProjectsSeo
