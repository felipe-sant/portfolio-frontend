import buildProjectDetail from "@/services/content/buildProjectDetail"
import findProjectDocument from "@/services/content/findProjectDocument"
import findProjectRecord from "@/services/content/findProjectRecord"
import listProjectFilterOptions from "@/services/content/listProjectFilterOptions"
import listProjects from "@/services/content/listProjects"
import loadProfile from "@/services/content/loadProfile"
import loadProjectDocument from "@/services/content/loadProjectDocument"
import loadProjectRecords from "@/services/content/loadProjectRecords"
import sortProjectDocuments from "@/services/content/sortProjectDocuments"
import validateId from "@/services/content/validateId"
import validateLang from "@/services/content/validateLang"
import validateProjectListParams from "@/services/content/validateProjectListParams"
import api from "@/store/api"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectFilterOptions from "@/types/project/ProjectFilterOptions.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"
import type ProjectPage from "@/types/project/ProjectPage.types"
import type ProjectsQueryArgs from "@/types/project/ProjectsQueryArgs.types"
import projectsPageSize from "@/utils/projectsPageSize"
import runQueryFn from "@/utils/runQueryFn"

type GetProjectArgs = {
    id: string
    lang: SupportedLanguage
}

type GetProjectFilterOptionsArgs = {
    lang: SupportedLanguage
}

type GetProjectDocumentContentArgs = GetProjectArgs & {
    documentId: string
}

const projectsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getProjects: build.query<ProjectPage, ProjectListParams>({
            queryFn: (params) =>
                runQueryFn(async () => {
                    const normalized = validateProjectListParams(params)
                    const records = await loadProjectRecords(normalized.lang)
                    return listProjects(records, normalized)
                })
        }),
        getProjectsPages: build.infiniteQuery<ProjectPage, ProjectsQueryArgs, number>({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage) => {
                    const next = lastPage.offset + lastPage.items.length

                    return next < lastPage.total ? next : undefined
                }
            },
            queryFn: ({ queryArg, pageParam }) =>
                runQueryFn(async () => {
                    const normalized = validateProjectListParams({
                        ...queryArg,
                        offset: pageParam,
                        limit: projectsPageSize
                    })
                    const records = await loadProjectRecords(normalized.lang)
                    return listProjects(records, normalized)
                })
        }),
        getProjectFilterOptions: build.query<ProjectFilterOptions, GetProjectFilterOptionsArgs>({
            queryFn: ({ lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    const [records, profile] = await Promise.all([
                        loadProjectRecords(lang),
                        loadProfile(lang)
                    ])
                    return listProjectFilterOptions(records, profile.stack, lang)
                })
        }),
        getProject: build.query<ProjectDetail, GetProjectArgs>({
            queryFn: ({ id, lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    validateId(id)
                    const records = await loadProjectRecords(lang)
                    return buildProjectDetail(findProjectRecord(records, id), records)
                })
        }),
        getProjectDocuments: build.query<ListResponse<ProjectDocument>, GetProjectArgs>({
            queryFn: ({ id, lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    validateId(id)
                    const record = findProjectRecord(await loadProjectRecords(lang), id)
                    return { items: sortProjectDocuments(record.documents) }
                })
        }),
        getProjectDocumentContent: build.query<string, GetProjectDocumentContentArgs>({
            queryFn: ({ id, documentId, lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    validateId(id)
                    validateId(documentId)
                    const record = findProjectRecord(await loadProjectRecords(lang), id)
                    const document = findProjectDocument(record, documentId)
                    return await loadProjectDocument(lang, id, document)
                })
        })
    })
})

export default projectsApi
