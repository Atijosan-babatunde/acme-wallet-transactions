import { act, renderHook } from '@testing-library/react'
import { useTransactionParams } from './useTransactionParams'

const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
let search = ''

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/transactions',
  useSearchParams: () => new URLSearchParams(search),
}))

describe('useTransactionParams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    search = 'type=deposit&page=3'
  })

  it('replaces history for search but pushes for filters and pages', () => {
    const { result } = renderHook(() => useTransactionParams())
    act(() => result.current.setSearch('rent'))
    expect(router.replace).toHaveBeenCalledWith('/transactions?q=rent&type=deposit', { scroll: false })

    act(() => result.current.setFilters({ status: 'failed' }))
    expect(router.push).toHaveBeenLastCalledWith('/transactions?type=deposit&status=failed', {
      scroll: false,
    })

    act(() => result.current.setPage(4))
    expect(router.push).toHaveBeenLastCalledWith('/transactions?type=deposit&page=4', { scroll: false })
  })

  it('closing details opened in-app goes back instead of adding an entry', () => {
    const { result } = renderHook(() => useTransactionParams())
    act(() => result.current.openDetails('txn_1'))
    expect(router.push).toHaveBeenCalledWith('/transactions?type=deposit&page=3&txn=txn_1', { scroll: false })

    act(() => result.current.closeDetails())
    expect(router.back).toHaveBeenCalledOnce()
  })

  it('closing details opened from a link replaces the URL', () => {
    search = 'txn=txn_1'
    const { result } = renderHook(() => useTransactionParams())
    act(() => result.current.closeDetails())
    expect(router.back).not.toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith('/transactions', { scroll: false })
  })
})
