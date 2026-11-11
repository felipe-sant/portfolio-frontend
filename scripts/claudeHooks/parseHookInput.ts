type HookInput = {
    toolName: string | undefined
    command: string | undefined
    cwd: string | undefined
    filePath: string | undefined
}

function asString(value: unknown) {
    return typeof value === "string" ? value : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseHookInput(raw: string): HookInput | null {
    let parsed: unknown
    try {
        parsed = JSON.parse(raw)
    } catch {
        return null
    }
    if (!isRecord(parsed) || !isRecord(parsed.tool_input)) {
        return null
    }
    return {
        toolName: asString(parsed.tool_name),
        command: asString(parsed.tool_input.command),
        cwd: asString(parsed.cwd),
        filePath: asString(parsed.tool_input.file_path)
    }
}

export default parseHookInput
