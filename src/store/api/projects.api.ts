import buildProjectDetail from "@/services/content/buildProjectDetail"
import findProjectDocument from "@/services/content/findProjectDocument"
import findProjectRecord from "@/services/content/findProjectRecord"
import listProjects from "@/services/content/listProjects"
import loadProjectDocument from "@/services/content/loadProjectDocument"
import loadProjectRecords from "@/services/content/loadProjectRecords"
import sortProjectDocuments from "@/services/content/sortProjectDocuments"
import toQueryError from "@/services/content/toQueryError"
import validateId from "@/services/content/validateId"
import validateLang from "@/services/content/validateLang"
import validateProjectListParams from "@/services/content/validateProjectListParams"
import api from "@/store/api"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"
import type ProjectPage from "@/types/project/ProjectPage.types"

type GetProjectArgs = {
    id: string
    lang: SupportedLanguage
}

type GetProjectDocumentContentArgs = GetProjectArgs & {
    documentId: string
}

const projectsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getProjects: build.query<ProjectPage, ProjectListParams>({
            queryFn: async (params) => {
                try {
                    const normalized = validateProjectListParams(params)
                    const records = await loadProjectRecords(normalized.lang)
                    return { data: listProjects(records, normalized) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        }),
        getProject: build.query<ProjectDetail, GetProjectArgs>({
            queryFn: async ({ id, lang }) => {
                try {
                    validateLang(lang)
                    validateId(id)
                    const records = await loadProjectRecords(lang)
                    return { data: buildProjectDetail(findProjectRecord(records, id), records) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        }),
        getProjectDocuments: build.query<ListResponse<ProjectDocument>, GetProjectArgs>({
            queryFn: async ({ id, lang }) => {
                try {
                    validateLang(lang)
                    validateId(id)
                    const record = findProjectRecord(await loadProjectRecords(lang), id)
                    return { data: { items: sortProjectDocuments(record.documents) } }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        }),
        getProjectDocumentContent: build.query<string, GetProjectDocumentContentArgs>({
            queryFn: async ({ id, documentId, lang }) => {
                try {
                    validateLang(lang)
                    validateId(id)
                    validateId(documentId)
                    const record = findProjectRecord(await loadProjectRecords(lang), id)
                    const document = findProjectDocument(record, documentId)
                    return { data: await loadProjectDocument(lang, id, document) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        })
    })
})

export default projectsApi
