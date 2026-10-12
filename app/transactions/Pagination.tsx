'use client'
import { Icon } from '@/components/ui'
import { cx } from '@/lib/cx'
import { pageRange } from '@/lib/transactions/display'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        Showing {first.toLocaleString('en-NG')}–{last.toLocaleString('en-NG')} of{' '}
        {total.toLocaleString('en-NG')}
      </p>

      <div className={styles.controls}>
        <button type="button" className={styles.step} onClick={() => onChange(page - 1)} disabled={page <= 1}>
          <Icon name="chevron-left" size={16} />
          <span className={styles.prevLong}>Previous</span>
          <span className={styles.prevShort}>Prev</span>
        </button>

        <ol className={styles.pages}>
          {pageRange(page, totalPages).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className={styles.gap} aria-hidden>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={cx(styles.page, item === page && styles.current)}
                  onClick={() => onChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            )
          )}
        </ol>

        <p className={styles.pageOf}>
          Page {page} of {totalPages}
        </p>

        <button
          type="button"
          className={styles.step}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </nav>
  )
}
