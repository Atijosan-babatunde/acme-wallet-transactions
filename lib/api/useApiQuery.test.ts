import { act, renderHook, waitFor } from '@testing-library/react'
import { useApiQuery } from './useApiQuery'

/** A promise we can resolve or reject from the test, plus the signal it was called with. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useApiQuery', () => {
  it('ignores a slow response that arrives after a newer request', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const signals: AbortSignal[] = []
    const fetcher = vi.fn((signal: AbortSignal) => {
      signals.push(signal)
      return signals.length === 1 ? first.promise : second.promise
    })

    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, fetcher), {
      initialProps: { key: 'net' },
    })
    rerender({ key: 'netflix' })
    expect(signals[0].aborted).toBe(true)

    await act(async () => second.resolve('netflix results'))
    await act(async () => first.resolve('stale net results'))
    expect(result.current.data).toBe('netflix results')
  })

  it('keeps previous data visible while the next request loads', async () => {
    const next = deferred<string>()
    const fetcher = vi.fn().mockResolvedValueOnce('page 1').mockReturnValueOnce(next.promise)
    const { result, rerender } = renderHook(({ key }) => useApiQuery(key, fetcher), {
      initialProps: { key: 'p1' },
    })
    await waitFor(() => expect(result.current.data).toBe('page 1'))

    rerender({ key: 'p2' })
    expect(result.current).toMatchObject({ data: 'page 1', isFetching: true })
  })

  it('exposes errors and refetches on retry', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useApiQuery('k', fetcher))
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))

    act(() => result.current.retry())
    await waitFor(() => expect(result.current.data).toBe('ok'))
    expect(result.current.error).toBeUndefined()
  })

  it('does nothing when the key is null', () => {
    const fetcher = vi.fn()
    const { result } = renderHook(() => useApiQuery(null, fetcher))
    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.isFetching).toBe(false)
  })
})
