import type PROJECT_STATUSES from "@/enum/projectStatuses.enum"

type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export default ProjectStatus
