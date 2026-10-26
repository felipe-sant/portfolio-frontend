import { useState } from "react"
import { useTranslation } from "react-i18next"
import FallbackImage from "@/components/FallbackImage"
import Lightbox from "@/components/Lightbox"
import VisuallyHidden from "@/components/VisuallyHidden"
import css from "@/styles/components/projectGallery.module.css"
import type ProjectImage from "@/types/project/ProjectImage.types"
import publicUrl from "@/utils/publicUrl"

interface ProjectGalleryProps {
    images: ProjectImage[]
}

const THUMBNAIL_SIZES = "(min-width: 640px) 12vw, 6.5rem"

function ProjectGallery({ images }: ProjectGalleryProps) {
    const { t } = useTranslation("project")
    const [activeIndex, setActiveIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const total = images.length
    const active = images[activeIndex]

    if (!active) {
        return <div className={css.placeholder} aria-hidden="true" />
    }

    return (
        <section className={css.gallery} aria-label={t("gallery.label")}>
            <button type="button" className={css.main} onClick={() => setIsLightboxOpen(true)}>
                <FallbackImage
                    className={css.mainImage}
                    alt={active.alt}
                    src={publicUrl(active.small.src)}
                    width={active.small.width}
                    height={active.small.height}
                    fetchPriority="high"
                />
                <VisuallyHidden>{t("gallery.enlarge")}</VisuallyHidden>
            </button>
            <div className={css.meta}>
                <p className={css.caption}>{active.caption}</p>
                {total > 1 && (
                    <p className={css.counter}>
                        {t("gallery.counter", { current: activeIndex + 1, total })}
                    </p>
                )}
            </div>
            {total > 1 && (
                <div role={"group"} aria-label={t("gallery.thumbnails")} className={css.thumbnails}>
                    {images.map((image, index) => (
                        <button
                            key={image.small.src}
                            type="button"
                            className={css.thumbnail}
                            aria-label={t("gallery.thumbnail", { current: index + 1, total })}
                            aria-current={index === activeIndex ? "true" : undefined}
                            onClick={() => setActiveIndex(index)}
                        >
                            <FallbackImage
                                className={css.thumbnailImage}
                                alt={""}
                                decorative
                                src={publicUrl(image.small.src)}
                                srcSet={`${publicUrl(image.small.src)} ${image.small.width}w`}
                                sizes={THUMBNAIL_SIZES}
                                width={image.small.width}
                                height={image.small.height}
                                loading="lazy"
                                decoding="async"
                            />
                        </button>
                    ))}
                </div>
            )}
            <Lightbox
                images={images}
                activeIndex={activeIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                onChange={setActiveIndex}
            />
        </section>
    )
}

export default ProjectGallery
