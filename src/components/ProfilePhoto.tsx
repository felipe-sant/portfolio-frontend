import { useTranslation } from "react-i18next"
import FallbackImage from "@/components/FallbackImage"
import css from "@/styles/components/profilePhoto.module.css"
import type ResponsiveImage from "@/types/content/ResponsiveImage.types"
import publicUrl from "@/utils/publicUrl"

interface ProfilePhotoProps {
    photo?: ResponsiveImage
}

const PHOTO_SIZES = "(min-width: 1000px) 15rem, (min-width: 600px) 24vw, 9rem"

function ProfilePhoto({ photo }: ProfilePhotoProps) {
    const { t } = useTranslation(["about", "common"])

    if (!photo) {
        return <div className={css.placeholder} aria-hidden="true" />
    }

    return (
        <FallbackImage
            className={css.photo}
            placeholderClassName={css.placeholder}
            alt={t("about:hero.photoAlt", { name: t("common:authorName") })}
            src={publicUrl(photo.small.src)}
            srcSet={`${publicUrl(photo.small.src)} ${photo.small.width}w, ${publicUrl(photo.large.src)} ${photo.large.width}w`}
            sizes={PHOTO_SIZES}
            width={photo.small.width}
            height={photo.small.height}
            fetchPriority="high"
        />
    )
}

export default ProfilePhoto
