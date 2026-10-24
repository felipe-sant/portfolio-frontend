import profileApi from "@/store/api/profile.api"
import projectsApi from "@/store/api/projects.api"
import timelineApi from "@/store/api/timeline.api"
import type PrerenderRoute from "@/types/prerender/PrerenderRoute.types"

const prerenderRoutes: PrerenderRoute[] = [
    {
        pattern: "",
        scope: "none",
        queries: () => []
    },
    {
        pattern: "projects",
        scope: "none",
        queries: (lang) => [
            (dispatch) => dispatch(projectsApi.endpoints.getProjects.initiate({ lang }))
        ]
    },
    {
        pattern: "about",
        scope: "none",
        queries: (lang) => [
            (dispatch) => dispatch(profileApi.endpoints.getProfile.initiate({ lang })),
            (dispatch) => dispatch(timelineApi.endpoints.getTimeline.initiate({ lang }))
        ]
    },
    {
        pattern: "contact",
        scope: "none",
        queries: () => []
    },
    {
        pattern: "projects/:id",
        scope: "project",
        queries: (lang, { id }) => [
            (dispatch) => dispatch(projectsApi.endpoints.getProject.initiate({ id, lang })),
            (dispatch) => dispatch(projectsApi.endpoints.getProjectDocuments.initiate({ id, lang }))
        ]
    },
    {
        pattern: "projects/:id/docs/:name",
        scope: "document",
        queries: (lang, { id, documentId }) => [
            (dispatch) => dispatch(projectsApi.endpoints.getProject.initiate({ id, lang })),
            (dispatch) =>
                dispatch(projectsApi.endpoints.getProjectDocuments.initiate({ id, lang })),
            (dispatch) =>
                dispatch(
                    projectsApi.endpoints.getProjectDocumentContent.initiate({
                        id,
                        documentId,
                        lang
                    })
                )
        ]
    }
]

export default prerenderRoutes
