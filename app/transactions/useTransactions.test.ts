import { renderHook, waitFor } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'
import { useTransactionDetails } from './useTransactions'

vi.mock('@/lib/api/endpoints', () => ({ getTransaction: vi.fn(), getTransactions: vi.fn() }))

const tx = { id: 'txn_1', reference: 'ACM-1' } as Transaction

describe('useTransactionDetails', () => {
  // Braces matter: a function returned from beforeEach is run by Vitest as a teardown hook.
  beforeEach(() => {
    vi.mocked(getTransaction).mockReset()
  })

  it('uses the row from the list without fetching', () => {
    const { result } = renderHook(() => useTransactionDetails('txn_1', [tx]))
    expect(result.current).toMatchObject({ transaction: tx, isLoading: false })
    expect(getTransaction).not.toHaveBeenCalled()
  })

  it('fetches by id when opened from a link', async () => {
    vi.mocked(getTransaction).mockResolvedValue({ data: tx })
    const { result } = renderHook(() => useTransactionDetails('txn_1', []))
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.transaction).toEqual(tx))
  })

  it('reports not found for a 404', async () => {
    vi.mocked(getTransaction).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Not found'))
    const { result } = renderHook(() => useTransactionDetails('txn_missing', []))
    await waitFor(() => expect(result.current.notFound).toBe(true))
    expect(result.current.transaction).toBeUndefined()
  })
})
