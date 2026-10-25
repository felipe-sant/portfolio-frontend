import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import useFocusOnError from "@/hooks/useFocusOnError"
import { useRef } from "react"

interface HarnessProps {
    error?: string
    enabled: boolean
}

function Harness({ error, enabled }: HarnessProps) {
    const ref = useRef<HTMLInputElement>(null)
    useFocusOnError(ref, error, enabled)

    return <input ref={ref} aria-label="Campo" />
}

describe("useFocusOnError", () => {
    it("foca o campo quando o erro aparece", () => {
        const { rerender } = render(<Harness enabled />)

        expect(screen.getByLabelText("Campo")).not.toHaveFocus()

        rerender(<Harness enabled error="Informe o campo" />)

        expect(screen.getByLabelText("Campo")).toHaveFocus()
    })

    it("não foca quando está desligado", () => {
        const { rerender } = render(<Harness enabled={false} />)

        rerender(<Harness enabled={false} error="Informe o campo" />)

        expect(screen.getByLabelText("Campo")).not.toHaveFocus()
    })

    it("não foca sem erro", () => {
        render(<Harness enabled />)

        expect(screen.getByLabelText("Campo")).not.toHaveFocus()
    })
})
