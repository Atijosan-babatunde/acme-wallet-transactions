import type { Transaction } from '@/types/api'
import { groupByDay, initials, isCredit, pageRange } from './display'

const tx = (id: string, createdAt: string) => ({ id, createdAt }) as Transaction

describe('isCredit', () => {
  it('treats deposits, incoming transfers and conversions as credits', () => {
    expect(isCredit('conversion')).toBe(true)
    expect(isCredit('transfer_in')).toBe(true)
    expect(isCredit('card_payment')).toBe(false)
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words, splitting on hyphens', () => {
    expect(initials('Kwame Mensah')).toBe('KM')
    expect(initials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initials('ada')).toBe('A')
  })
})

describe('groupByDay', () => {
  // Local-time constructors so the test passes in any time zone.
  const now = new Date(2026, 9, 12, 15, 0)
  const at = (d: number, h: number) => new Date(2026, 9, d, h, 0).toISOString()

  it('labels today and yesterday and dates older days', () => {
    const groups = groupByDay(
      [tx('a', at(12, 9)), tx('b', at(12, 1)), tx('c', at(11, 22)), tx('d', at(5, 10))],
      now
    )
    expect(groups.map((g) => [g.label, g.items.map((t) => t.id)])).toEqual([
      ['Today', ['a', 'b']],
      ['Yesterday', ['c']],
      ['Mon, 5 Oct 2026', ['d']],
    ])
  })
})

describe('pageRange', () => {
  it('matches the design at the start', () => {
    expect(pageRange(1, 12)).toEqual([1, 2, 3, 'gap', 12])
  })

  it('shows neighbours in the middle and at the end', () => {
    expect(pageRange(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    expect(pageRange(12, 12)).toEqual([1, 'gap', 10, 11, 12])
  })

  it('fills a single-page gap with the number instead of an ellipsis', () => {
    expect(pageRange(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
  })

  it('handles tiny totals', () => {
    expect(pageRange(1, 1)).toEqual([1])
    expect(pageRange(2, 3)).toEqual([1, 2, 3])
  })
})
