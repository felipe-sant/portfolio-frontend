function removePrerenderedHead(head: HTMLHeadElement) {
    head.querySelectorAll("title, meta[name='description'], meta[name='robots']").forEach((node) =>
        node.remove()
    )
}

export default removePrerenderedHead
