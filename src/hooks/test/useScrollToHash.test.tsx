import { useRef } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import useScrollToHash from "@/hooks/useScrollToHash"

interface HarnessProps {
    hash: string
    isEnabled?: boolean
    withTarget?: boolean
}

function Harness({ hash, isEnabled = true, withTarget = true }: HarnessProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    useScrollToHash(containerRef, hash, isEnabled)

    return (
        <div ref={containerRef} data-testid={"container"}>
            {withTarget ? <h3 id={"seção"}>Seção</h3> : null}
        </div>
    )
}

function Raw() {
    const containerRef = useRef<HTMLDivElement>(null)
    useScrollToHash(containerRef, "#100%", true)

    return (
        <div ref={containerRef}>
            <h3 id={"100%"}>Cem</h3>
        </div>
    )
}

afterEach(() => {
    vi.restoreAllMocks()
    document.getElementById("outside")?.remove()
})

describe("useScrollToHash", () => {
    it("rola na hora até o alvo que já existe no contêiner", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")

        const { getByRole } = render(<Harness hash={"#seção"} />)

        expect(scroll).toHaveBeenCalledTimes(1)
        expect(scroll.mock.contexts[0]).toBe(getByRole("heading", { name: "Seção" }))
    })

    it("decodifica o hash antes de procurar o alvo", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")

        render(<Harness hash={"#se%C3%A7%C3%A3o"} />)

        expect(scroll).toHaveBeenCalledTimes(1)
    })

    it("usa o hash cru quando o decode é inválido e rola até o alvo com esse id", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")

        const { getByRole } = render(<Raw />)

        expect(scroll.mock.contexts).toEqual([getByRole("heading", { name: "Cem" })])
    })

    it("espera o alvo que chega depois e rola uma única vez", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const { getByTestId } = render(<Harness hash={"#seção"} withTarget={false} />)

        expect(scroll).not.toHaveBeenCalled()

        const arriving = document.createElement("h3")
        arriving.id = "seção"
        await act(async () => {
            getByTestId("container").appendChild(arriving)
            await Promise.resolve()
        })

        expect(scroll.mock.contexts).toEqual([arriving])

        await act(async () => {
            getByTestId("container").appendChild(document.createElement("p"))
            await Promise.resolve()
        })

        expect(scroll).toHaveBeenCalledTimes(1)
    })

    it("desconecta o observador ao desmontar e não rola com um alvo que chega depois", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect")
        const { getByTestId, unmount } = render(<Harness hash={"#seção"} withTarget={false} />)
        const container = getByTestId("container")

        unmount()

        expect(disconnect).toHaveBeenCalled()

        const arriving = document.createElement("h3")
        arriving.id = "seção"
        await act(async () => {
            container.appendChild(arriving)
            await Promise.resolve()
        })

        expect(scroll).not.toHaveBeenCalled()
    })

    it.each([[""], ["#"]])("não rola nem observa com o hash %j", async (hash) => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const observe = vi.spyOn(MutationObserver.prototype, "observe")

        render(<Harness hash={hash} />)

        expect(scroll).not.toHaveBeenCalled()
        expect(observe).not.toHaveBeenCalled()
    })

    it("não rola nem observa quando está desabilitado", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const observe = vi.spyOn(MutationObserver.prototype, "observe")

        render(<Harness hash={"#seção"} isEnabled={false} />)

        expect(scroll).not.toHaveBeenCalled()
        expect(observe).not.toHaveBeenCalled()
    })

    it("rola ao habilitar depois, quando o alvo já está no contêiner", () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const { rerender } = render(<Harness hash={"#seção"} isEnabled={false} />)

        rerender(<Harness hash={"#seção"} isEnabled />)

        expect(scroll).toHaveBeenCalledTimes(1)
    })

    it("não rola até um alvo fora do contêiner, só quando ele entra nele", async () => {
        const scroll = vi.spyOn(Element.prototype, "scrollIntoView")
        const outside = document.createElement("h3")
        outside.id = "outside"
        document.body.appendChild(outside)

        const { getByTestId } = render(<Harness hash={"#outside"} withTarget={false} />)

        expect(scroll).not.toHaveBeenCalled()

        await act(async () => {
            getByTestId("container").appendChild(outside)
            await Promise.resolve()
        })

        expect(scroll.mock.contexts).toEqual([outside])
    })
})
