import type ProjectListParams from "@/types/project/ProjectListParams.types"

type NormalizedProjectListParams = Required<
    Pick<ProjectListParams, "lang" | "sort" | "offset" | "limit">
> &
    Pick<ProjectListParams, "q" | "type" | "category" | "featured">

export default NormalizedProjectListParams
