'use client'
import { Drawer } from '@/components/ui'
import { hasActiveFilters } from '@/lib/transactions/params'
import { FilterBar } from './FilterBar'
import { EmptyState, ListSkeleton } from './ListStates'
import { Pagination } from './Pagination'
import { TransactionDetails } from './TransactionDetails'
import { TransactionList } from './TransactionList'
import { PAGE_SIZE, useTransactionDetails, useTransactions } from './useTransactions'
import { useTransactionParams } from './useTransactionParams'
import styles from './page.module.css'

const plural = (n: number, word: string) => `${n.toLocaleString('en-NG')} ${word}${n === 1 ? '' : 's'}`

export function TransactionsView() {
  const nav = useTransactionParams()
  const { params } = nav
  const list = useTransactions(params)
  const details = useTransactionDetails(params.txn, list.data?.items)
  const filtered = hasActiveFilters(params)

  const items = list.data?.items ?? []
  const meta = list.data?.meta
  const total = meta?.total ?? 0

  const goToPage = (page: number) => {
    nav.setPage(page)
    window.scrollTo({ top: 0 })
  }

  let content
  if (list.error) {
    content = (
      <EmptyState
        icon="alert"
        tone="danger"
        title="We couldn't load your transactions"
        body="Check your connection and try again."
        action={{ label: 'Try again', icon: 'refresh', variant: 'primary', onClick: list.retry }}
      />
    )
  } else if (list.isInitialLoading) {
    content = <ListSkeleton />
  } else if (items.length === 0 && filtered) {
    content = (
      <EmptyState
        icon="search"
        title="No transactions match your filters"
        body="Try a different search term or remove some filters."
        action={{ label: 'Clear filters', onClick: nav.clearFilters }}
      />
    )
  } else if (items.length === 0 && params.page > 1) {
    // e.g. an old shared link to page 9 after the history shrank.
    content = (
      <EmptyState
        icon="search"
        title="This page is empty"
        body="There are fewer transactions than when this link was made."
        action={{ label: 'Go to first page', onClick: () => goToPage(1) }}
      />
    )
  } else if (items.length === 0) {
    content = (
      <EmptyState
        icon="inbox"
        title="No transactions yet"
        body="When you add money, send a transfer or pay with your card, it will show up here."
      />
    )
  } else {
    content = (
      <>
        <TransactionList items={items} isStale={list.isFetching} onSelect={(tx) => nav.openDetails(tx.id)} />
        {meta && meta.totalPages > 1 && (
          <Pagination
            page={params.page}
            totalPages={meta.totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={goToPage}
          />
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        {/* Announced to screen readers when results change. */}
        <p className={styles.subtitle} aria-live="polite">
          {list.data && !list.error ? plural(total, filtered ? 'result' : 'transaction') : ' '}
        </p>
      </header>

      <FilterBar
        params={params}
        onSearch={nav.setSearch}
        onFilter={nav.setFilters}
        onClear={nav.clearFilters}
      />

      {content}

      <Drawer open={Boolean(params.txn)} title="Transaction details" onClose={nav.closeDetails}>
        <TransactionDetails {...details} onBack={nav.closeDetails} />
      </Drawer>
    </div>
  )
}
