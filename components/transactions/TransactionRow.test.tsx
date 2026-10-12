import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const base: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'bill_payment',
  status: 'successful',
  currency: 'USD',
  amount: 4599,
  fee: 0,
  narration: 'Bill payment - Spectranet',
  counterparty: null,
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionRow', () => {
  it('renders narration as text, never as HTML', () => {
    const narration = 'Bill payment <img src="x" onerror="alert(1)">'
    const { container } = render(<TransactionRow transaction={{ ...base, narration }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(narration)).toBeInTheDocument()
  })

  it('shows the fee in the transaction currency and major units', () => {
    render(<TransactionRow transaction={{ ...base, fee: 30 }} />)
    expect(screen.getByText(/Fee \$0\.30/)).toBeInTheDocument()
  })

  it('labels the status in text and shows counterparty initials', () => {
    render(
      <TransactionRow
        transaction={{ ...base, type: 'transfer_out', status: 'pending', counterparty: 'Kwame Mensah' }}
        timeOnly
      />
    )
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('KM')).toBeInTheDocument()
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
  })
})
