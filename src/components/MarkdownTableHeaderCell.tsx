import type { ComponentPropsWithoutRef } from "react"
import type { ExtraProps } from "react-markdown"

function MarkdownTableHeaderCell({ style, children }: ComponentPropsWithoutRef<"th"> & ExtraProps) {
    return (
        <th scope="col" style={style}>
            {children}
        </th>
    )
}

export default MarkdownTableHeaderCell
