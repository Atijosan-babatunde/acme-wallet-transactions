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

  it('pushes when a search starts or is cleared, replaces while refining it', () => {
    const { result, rerender } = renderHook(() => useTransactionParams())
    act(() => result.current.setSearch('rent'))
    expect(router.push).toHaveBeenLastCalledWith('/transactions?q=rent&type=deposit', { scroll: false })

    search = 'q=rent&type=deposit'
    rerender()
    act(() => result.current.setSearch('rental'))
    expect(router.replace).toHaveBeenLastCalledWith('/transactions?q=rental&type=deposit', { scroll: false })

    act(() => result.current.setSearch(''))
    expect(router.push).toHaveBeenLastCalledWith('/transactions?type=deposit', { scroll: false })
  })

  it('pushes for filters and pages', () => {
    const { result } = renderHook(() => useTransactionParams())
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
