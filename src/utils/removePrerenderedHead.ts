function removePrerenderedHead(head: HTMLHeadElement) {
    head.querySelectorAll("title, meta[name='description']").forEach((node) => node.remove())
}

export default removePrerenderedHead
