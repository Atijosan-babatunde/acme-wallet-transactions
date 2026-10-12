import { Button, Icon, type IconName } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './ListStates.module.css'

export interface EmptyStateProps {
  icon: IconName
  tone?: 'primary' | 'danger'
  title: string
  body: string
  action?: { label: string; onClick: () => void; icon?: IconName; variant?: 'primary' | 'secondary' }
  /** Render without the card frame (inside the details drawer). */
  bare?: boolean
}

/** Shared layout for the empty, filtered-empty, error and not-found states in Figma. */
export function EmptyState({ icon, tone = 'primary', title, body, action, bare = false }: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, !bare && styles.card)} role={tone === 'danger' ? 'alert' : undefined}>
      <span className={cx(styles.badge, styles[tone])}>
        <Icon name={icon} size={18} />
      </span>
      <p className={styles.title}>{title}</p>
      <p className={styles.body}>{body}</p>
      {action && (
        <Button
          size="sm"
          variant={action.variant ?? 'secondary'}
          iconLeft={action.icon}
          onClick={action.onClick}
          className={styles.action}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/** First-load placeholder: same frame and row rhythm as the real list. */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading transactions">
      <div className={styles.skeletonHeader}>
        <span className={cx(styles.bone, styles.short)} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <span className={cx(styles.bone, styles.circle)} />
          <span className={styles.skeletonLines}>
            <span className={cx(styles.bone, styles.medium)} />
            <span className={cx(styles.bone, styles.long)} />
          </span>
          <span className={styles.skeletonEnd}>
            <span className={cx(styles.bone, styles.medium)} />
            <span className={cx(styles.bone, styles.tiny)} />
          </span>
        </div>
      ))}
    </div>
  )
}
