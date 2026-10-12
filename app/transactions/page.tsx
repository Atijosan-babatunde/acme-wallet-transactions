import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListSkeleton } from './ListStates'
import { TransactionsView } from './TransactionsView'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  return (
    // TransactionsView reads the URL (useSearchParams), so Next requires a Suspense boundary.
    // The fallback mirrors the page header so the first paint doesn't jump.
    <Suspense
      fallback={
        <div className={styles.page}>
          <h1 className={styles.title}>Transactions</h1>
          <ListSkeleton />
        </div>
      }
    >
      <TransactionsView />
    </Suspense>
  )
}
