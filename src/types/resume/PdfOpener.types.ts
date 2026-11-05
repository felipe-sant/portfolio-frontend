import type PdfLoadingTask from "@/types/resume/PdfLoadingTask.types"

type PdfOpener = (url: string) => PdfLoadingTask

export default PdfOpener
