import type { MouseEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import readProjectsOrigin from "@/utils/readProjectsOrigin"

function useBackToProjects() {
    const location = useLocation()
    const navigate = useNavigate()
    const localizedPath = useLocalizedPath()
    const origin = readProjectsOrigin(location.state)

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (!origin || event.defaultPrevented || event.button !== 0) {
            return
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return
        }

        event.preventDefault()
        void navigate(-(origin.documentSteps + 1))
    }

    return { to: localizedPath(ROUTES.projects), onClick: handleClick }
}

export default useBackToProjects
