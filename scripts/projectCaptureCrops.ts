type CaptureRegion = {
    x: number
    y: number
    width: number
    height: number
}

type CaptureSize = {
    width: number
    height: number
}

type ProjectCaptureCrop = {
    id: string
    region: CaptureRegion
    large: CaptureSize
    small: CaptureSize
}

const SOURCE_WIDTH = 1600
const SMALL_SIZE: CaptureSize = { width: 640, height: 360 }

const REGIONS: Record<string, CaptureRegion> = {
    "01a131fc-d24c-7c70-887b-0d055f57d251": { x: 520, y: 330, width: 640, height: 360 },
    "01a13229-0594-7b2f-a012-ecf61257f6ad": { x: 346, y: 145, width: 912, height: 513 },
    "01a13216-9960-7a66-8288-462bf96ec9a5": { x: 336, y: 84, width: 928, height: 522 },
    "01a13188-a1da-7d4b-901c-e7bcc81d497b": { x: 640, y: 360, width: 960, height: 540 },
    "01a131df-93ee-72f3-8c7a-f67501e47a7a": { x: 440, y: 310, width: 720, height: 405 }
}

function projectCaptureCrops(): ProjectCaptureCrop[] {
    return Object.entries(REGIONS).map(([id, region]) => {
        const width = Math.min(region.width, SOURCE_WIDTH)
        const height = Math.round((width * region.height) / region.width)

        return {
            id,
            region: { ...region },
            large: { width, height },
            small: { ...SMALL_SIZE }
        }
    })
}

export default projectCaptureCrops
