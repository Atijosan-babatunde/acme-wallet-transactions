import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './client'

function mockFetch(status: number, body: unknown) {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(text, { status })))
}

describe('api client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns the body on success', async () => {
    mockFetch(200, { data: { id: 'txn_1' } })
    await expect(api.get('/transactions/txn_1')).resolves.toEqual({ data: { id: 'txn_1' } })
  })

  it('throws an ApiError with the server code and message on 4xx/5xx', async () => {
    mockFetch(422, { error: { code: 'INSUFFICIENT_FUNDS', message: 'Not enough USD' } })
    const error = await api.post('/convert', {}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, code: 'INSUFFICIENT_FUNDS', message: 'Not enough USD' })
  })

  it('throws an ApiError when the error body is not JSON', async () => {
    mockFetch(502, '<html>Bad gateway</html>')
    await expect(api.get('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN' })
  })
})
