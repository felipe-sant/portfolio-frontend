import css from "@/styles/components/loadError.module.css"
import Button from "@/components/Button"
import Icon from "@/components/Icon"

interface LoadErrorProps {
    title: string
    description?: string
    retryLabel: string
    onRetry: () => void
    id?: string
    announce?: boolean
}

function LoadError({
    title,
    description,
    retryLabel,
    onRetry,
    id,
    announce = true
}: LoadErrorProps) {
    return (
        <div className={css.error} role={announce ? "alert" : undefined} tabIndex={-1} id={id}>
            <Icon name="alert" size={20} />
            <div className={css.text}>
                <p className={css.title}>{title}</p>
                {description && <p className={css.description}>{description}</p>}
            </div>
            <Button variant="secondary" className={css.retry} onClick={onRetry}>
                {retryLabel}
            </Button>
        </div>
    )
}

export default LoadError
