interface PdfRenderTask {
    promise: Promise<void>
    cancel(): void
}

export default PdfRenderTask
