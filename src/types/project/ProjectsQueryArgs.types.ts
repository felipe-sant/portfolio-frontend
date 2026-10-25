import type ProjectListParams from "@/types/project/ProjectListParams.types"

type ProjectsQueryArgs = Omit<ProjectListParams, "offset" | "limit">

export default ProjectsQueryArgs
