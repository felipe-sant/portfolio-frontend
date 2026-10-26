let rendererPromise: Promise<typeof import("@/components/MarkdownDocument")> | undefined

function loadMarkdownRenderer() {
    rendererPromise ??= import("@/components/MarkdownDocument")

    return rendererPromise
}

export default loadMarkdownRenderer
