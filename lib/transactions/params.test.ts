import { buildSearch, hasActiveFilters, parseParams } from './params'

const sp = (qs: string) => new URLSearchParams(qs)

describe('parseParams', () => {
  it('reads valid params', () => {
    expect(parseParams(sp('q=netflix&type=card_payment&status=pending&page=3&txn=txn_1'))).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'pending',
      page: 3,
      txn: 'txn_1',
    })
  })

  it('falls back to defaults for invalid or hand-edited values', () => {
    expect(parseParams(sp('type=bogus&status=reversed&page=-2'))).toEqual({
      q: '',
      type: undefined,
      status: undefined,
      page: 1,
      txn: undefined,
    })
    expect(parseParams(sp('page=1.5')).page).toBe(1)
    expect(parseParams(sp('page=abc')).page).toBe(1)
  })
})

describe('buildSearch', () => {
  it('resets to page 1 when a filter changes', () => {
    expect(buildSearch(sp('page=4&type=deposit'), { status: 'failed' })).toBe('?type=deposit&status=failed')
  })

  it('keeps the page when only the page or details change', () => {
    expect(buildSearch(sp('page=4'), { txn: 'txn_9' })).toBe('?page=4&txn=txn_9')
    expect(buildSearch(sp('page=4&txn=txn_9'), { txn: undefined })).toBe('?page=4')
  })

  it('omits defaults and trims the search term', () => {
    expect(buildSearch(sp('q=old&page=2'), { q: '   ' })).toBe('')
    expect(buildSearch(sp(''), { q: '  netflix ' })).toBe('?q=netflix')
  })

  it('preserves params it does not own, like __scenario', () => {
    expect(buildSearch(sp('__scenario=slow'), { page: 2 })).toBe('?__scenario=slow&page=2')
  })
})

describe('hasActiveFilters', () => {
  it('ignores page and details', () => {
    expect(hasActiveFilters({ q: '', page: 3 })).toBe(false)
    expect(hasActiveFilters({ q: 'x', page: 1 })).toBe(true)
  })
})
