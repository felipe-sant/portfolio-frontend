type ProfilePhotoTarget = {
    file: string
    size: number
}

const TARGETS: ProfilePhotoTarget[] = [
    { file: "photo-large.webp", size: 362 },
    { file: "photo-small.webp", size: 320 }
]

function profilePhotoTargets(): ProfilePhotoTarget[] {
    return TARGETS.map((target) => ({ ...target }))
}

export default profilePhotoTargets
