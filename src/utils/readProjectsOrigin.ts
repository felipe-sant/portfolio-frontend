type ProjectsOrigin = {
    documentSteps: number
}

function readProjectsOrigin(state: unknown): ProjectsOrigin | undefined {
    if (typeof state !== "object" || state === null || !("fromProjects" in state)) {
        return undefined
    }

    if (state.fromProjects !== true) {
        return undefined
    }

    const steps = "documentSteps" in state ? state.documentSteps : 0

    return { documentSteps: typeof steps === "number" ? steps : 0 }
}

export default readProjectsOrigin
