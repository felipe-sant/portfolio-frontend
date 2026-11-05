import type { Locator } from "@playwright/test"

async function readCanvasPixels(canvas: Locator) {
    return canvas.evaluate((element) => {
        const target = element as HTMLCanvasElement
        const context = target.getContext("2d")

        if (!context || target.width === 0 || target.height === 0) {
            return { width: target.width, height: target.height, inkPixels: 0 }
        }

        const data = context.getImageData(0, 0, target.width, target.height).data
        let inkPixels = 0

        for (let index = 0; index < data.length; index += 4) {
            const isVisible = data[index + 3] > 0
            const isDark = data[index] < 200 || data[index + 1] < 200 || data[index + 2] < 200

            if (isVisible && isDark) {
                inkPixels += 1
            }
        }

        return { width: target.width, height: target.height, inkPixels }
    })
}

export default readCanvasPixels
