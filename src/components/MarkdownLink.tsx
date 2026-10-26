import type { ComponentPropsWithoutRef, MouseEvent } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import VisuallyHidden from "@/components/VisuallyHidden"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/markdownLink.module.css"
import isUuidV7 from "@/utils/isUuidV7"

const PROJECT_PATTERN = /^project:([^/#]+)(?:\/docs\/([^#]+))?(#.*)?$/i

function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView()
}

function MarkdownLink({ href, children }: ComponentPropsWithoutRef<"a">) {
    const { t } = useTranslation("project")
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()

    if (!href) {
        return <>{children}</>
    }

    if (href.startsWith("#")) {
        return (
            <a className={css.link} href={href} onClick={(event) => scrollToAnchor(event, href)}>
                {children}
            </a>
        )
    }

    const project = PROJECT_PATTERN.exec(href)

    if (project) {
        const [, id, name, hash = ""] = project

        if (!isUuidV7(id)) {
            return <>{children}</>
        }

        const path = name
            ? localizedPath(ROUTES.projectDocument, { id, name: decodeURIComponent(name) })
            : localizedPath(ROUTES.project, { id })

        return (
            <Link className={css.link} to={`${path}${hash}`} viewTransition={viewTransition}>
                {children}
            </Link>
        )
    }

    if (/^mailto:/i.test(href)) {
        return (
            <a className={css.link} href={href}>
                {children}
            </a>
        )
    }

    return (
        <a className={css.link} href={href} target="_blank" rel="noopener noreferrer">
            {children} <VisuallyHidden>{t("markdown.newTab")}</VisuallyHidden>
        </a>
    )
}

export default MarkdownLink
