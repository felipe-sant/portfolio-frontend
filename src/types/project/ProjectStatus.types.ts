import type PROJECT_STATUSES from "@/services/content/projectStatuses"

type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export default ProjectStatus
