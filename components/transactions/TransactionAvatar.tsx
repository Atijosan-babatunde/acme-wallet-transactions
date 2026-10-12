import type { Transaction, TransactionType } from '@/types/api'
import { Icon, type IconName } from '@/components/ui'
import { cx } from '@/lib/cx'
import { initials } from '@/lib/transactions/display'
import styles from './TransactionAvatar.module.css'

const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

/** Counterparty initials for transfers, otherwise an icon for the transaction type. */
export function TransactionAvatar({
  transaction,
  size = 'md',
}: {
  transaction: Pick<Transaction, 'type' | 'counterparty'>
  size?: 'md' | 'lg'
}) {
  return (
    <span className={cx(styles.avatar, styles[size])} aria-hidden>
      {transaction.counterparty ? (
        initials(transaction.counterparty)
      ) : (
        <Icon name={TYPE_ICONS[transaction.type]} size={size === 'lg' ? 20 : 18} />
      )}
    </span>
  )
}
