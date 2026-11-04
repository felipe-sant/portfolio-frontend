import type { Locator } from "@playwright/test"

function luminance([red, green, blue]: number[]) {
    const [r, g, b] = [red, green, blue].map((channel) => {
        const value = channel / 255
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

async function measureBorderContrast(field: Locator): Promise<number> {
    const colors = await field.evaluate((element) => {
        const canvas = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1
        const context = canvas.getContext("2d", { willReadFrequently: true })

        function toRgba(color: string): [number, number, number, number] {
            if (!context) {
                throw new Error("canvas indisponível")
            }
            context.clearRect(0, 0, 1, 1)
            context.fillStyle = "#000"
            context.fillStyle = color
            context.fillRect(0, 0, 1, 1)
            const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
            return [red, green, blue, alpha / 255]
        }

        function findBackground(start: Element): number[] {
            let current: Element | null = start
            while (current) {
                const [red, green, blue, alpha] = toRgba(getComputedStyle(current).backgroundColor)
                if (alpha === 1) {
                    return [red, green, blue]
                }
                current = current.parentElement
            }
            return [255, 255, 255]
        }

        const background = findBackground(element.parentElement ?? element)
        const [borderRed, borderGreen, borderBlue, borderAlpha] = toRgba(
            getComputedStyle(element).borderTopColor
        )
        const border = [borderRed, borderGreen, borderBlue].map(
            (channel, index) => channel * borderAlpha + background[index] * (1 - borderAlpha)
        )
        return { border, background }
    })
    const luminances = [luminance(colors.border), luminance(colors.background)]

    return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05)
}

export default measureBorderContrast
