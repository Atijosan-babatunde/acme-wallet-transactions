'use client'
import { type ReactNode, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Icon, Money } from '@/components/ui'
import { StatusBadge, TransactionAvatar } from '@/components/transactions'
import { cx } from '@/lib/cx'
import { formatDateTime, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import { isCredit } from '@/lib/transactions/display'
import { EmptyState } from './ListStates'
import styles from './TransactionDetails.module.css'

export interface TransactionDetailsProps {
  transaction: Transaction | undefined
  isLoading: boolean
  notFound: boolean
  error: unknown
  retry: () => void
  onBack: () => void
}

export function TransactionDetails({
  transaction,
  isLoading,
  notFound,
  error,
  retry,
  onBack,
}: TransactionDetailsProps) {
  if (transaction) return <Details tx={transaction} />
  if (isLoading) return <DetailsSkeleton />
  if (notFound) {
    return (
      <EmptyState
        bare
        icon="search"
        title="Transaction not found"
        body="It may have been removed, or the link is wrong."
        action={{ label: 'Back to transactions', onClick: onBack }}
      />
    )
  }
  if (error) {
    return (
      <EmptyState
        bare
        icon="alert"
        tone="danger"
        title="We couldn't load this transaction"
        body="Check your connection and try again."
        action={{ label: 'Try again', icon: 'refresh', variant: 'primary', onClick: retry }}
      />
    )
  }
  return null
}

function Details({ tx }: { tx: Transaction }) {
  const credit = isCredit(tx.type)
  const typeLabel = TRANSACTION_TYPE_LABELS[tx.type]
  const headline = tx.counterparty
    ? `${typeLabel} ${credit ? 'from' : 'to'} ${tx.counterparty}`
    : tx.narration

  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <TransactionAvatar transaction={tx} size="lg" />
        <p className={styles.headline}>{headline}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.amount}
        />
        <StatusBadge status={tx.status} />
      </div>

      <section className={styles.section} aria-labelledby="details-heading">
        <h3 id="details-heading" className={styles.heading}>
          Details
        </h3>
        <dl className={styles.rows}>
          <Row label="Reference">
            <span className={styles.reference}>
              {tx.reference}
              <CopyButton value={tx.reference} />
            </span>
          </Row>
          <Row label="Date">{formatDateTime(tx.createdAt)}</Row>
          <Row label="Type">{typeLabel}</Row>
          {tx.counterparty && <Row label="Counterparty">{tx.counterparty}</Row>}
          {/* Unsanitised upstream text: rendered as text only. */}
          <Row label="Narration">{tx.narration}</Row>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="summary-heading">
        <h3 id="summary-heading" className={styles.heading}>
          Summary
        </h3>
        <dl className={styles.rows}>
          <Row label="Amount">
            <Money amount={tx.amount} currency={tx.currency} />
          </Row>
          <Row label="Fee">
            <Money amount={tx.fee} currency={tx.currency} />
          </Row>
          {/* API.md: the fee is charged on top of the amount, so a debit costs amount + fee.
              For credits there is no meaningful "total" (a conversion's fee was paid from the
              source wallet), so we don't invent one. */}
          {!credit && (
            <Row label="Total" strong>
              <Money amount={tx.amount + tx.fee} currency={tx.currency} />
            </Row>
          )}
        </dl>
      </section>
    </div>
  )
}

function Row({ label, strong = false, children }: { label: string; strong?: boolean; children: ReactNode }) {
  return (
    <div className={cx(styles.row, strong && styles.total)}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <button
        type="button"
        className={styles.copy}
        aria-label="Copy reference"
        onClick={() => {
          navigator.clipboard?.writeText(value).then(
            () => {
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            },
            () => {} // Clipboard blocked (permissions/insecure context): the reference is still selectable.
          )
        }}
      >
        <Icon name="copy" size={14} />
      </button>
      <span className={styles.copied} aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </>
  )
}

function DetailsSkeleton() {
  return (
    <div className={styles.details} aria-busy="true" aria-label="Loading transaction">
      <div className={styles.hero}>
        <span className={cx(styles.bone, styles.circle)} />
        <span className={cx(styles.bone, styles.w40)} />
        <span className={cx(styles.bone, styles.w50, styles.tall)} />
        <span className={cx(styles.bone, styles.w20)} />
      </div>
      <div className={styles.rows}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <span className={cx(styles.bone, styles.w20)} />
            <span className={cx(styles.bone, styles.w40)} />
          </div>
        ))}
      </div>
    </div>
  )
}
