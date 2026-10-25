import css from "@/styles/components/loadError.module.css"
import Button from "@/components/Button"
import Icon from "@/components/Icon"

interface LoadErrorProps {
    title: string
    description: string
    retryLabel: string
    onRetry: () => void
    id?: string
}

function LoadError({ title, description, retryLabel, onRetry, id }: LoadErrorProps) {
    return (
        <div className={css.error} role={"alert"} tabIndex={-1} id={id}>
            <Icon name="alert" size={20} />
            <div className={css.text}>
                <p className={css.title}>{title}</p>
                <p className={css.description}>{description}</p>
            </div>
            <Button variant="secondary" className={css.retry} onClick={onRetry}>
                {retryLabel}
            </Button>
        </div>
    )
}

export default LoadError
