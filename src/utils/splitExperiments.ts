import type ProjectSummary from "@/types/project/ProjectSummary.types"

function splitExperiments(items: ProjectSummary[]): {
    main: ProjectSummary[]
    experiments: ProjectSummary[]
} {
    return {
        main: items.filter((item) => !item.experiment),
        experiments: items.filter((item) => item.experiment)
    }
}

export default splitExperiments
