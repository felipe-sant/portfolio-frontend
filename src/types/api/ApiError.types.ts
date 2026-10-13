type ApiError = {
    error: {
        code: string
        message: string
        fields?: { field: string; code: string; message: string }[]
    }
}

export default ApiError
