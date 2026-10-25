import css from "@/styles/components/availabilityBadge.module.css"

interface AvailabilityBadgeProps {
    label: string
}

function AvailabilityBadge({ label }: AvailabilityBadgeProps) {
    return (
        <span className={css.badge}>
            <span className={css.dot} aria-hidden="true" />
            {label}
        </span>
    )
}

export default AvailabilityBadge
