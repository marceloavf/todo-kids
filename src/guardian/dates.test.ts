import { describe, expect, it } from 'vitest'
import { addDays, dayLabel, todayIn, WEEKDAYS } from './dates.ts'

describe('guardian dates', () => {
  it('reads today in the family timezone, not the device one', () => {
    const instant = new Date('2026-11-15T12:00:00Z')
    expect(todayIn('Pacific/Kiritimati', instant)).toBe('2026-11-16')
    expect(todayIn('Pacific/Pago_Pago', instant)).toBe('2026-11-15')
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-11-15', -14)).toBe('2026-11-01')
  })

  it('labels days relative to today', () => {
    expect(dayLabel('2026-11-15', '2026-11-15')).toBe('hoje')
    expect(dayLabel('2026-11-14', '2026-11-15')).toBe('ontem')
    expect(dayLabel('2026-11-16', '2026-11-15')).toBe('amanhã')
    expect(dayLabel('2026-11-10', '2026-11-15')).toMatch(/10\/11/)
  })

  it('names weekdays from Sunday, matching Postgres dow', () => {
    expect(WEEKDAYS).toHaveLength(7)
    expect(WEEKDAYS[0]).toMatch(/^dom/)
    expect(WEEKDAYS[1]).toMatch(/^seg/)
  })
})
