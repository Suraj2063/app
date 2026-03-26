import { cn, getStatusColor } from '../utils/helpers'

interface BadgeProps {
  status: string
  label?: string
  className?: string
}

export default function StatusBadge({ status, label, className }: BadgeProps) {
  const colorClass = getStatusColor(status)
  const displayLabel = label || status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())

  return (
    <span className={cn(colorClass, className)}>
      {displayLabel}
    </span>
  )
}
