// Days are ISO `YYYY-MM-DD` strings, the same shape Postgres `date` columns arrive in.

/** Today's date in the family's timezone. The server decides "today" the same way. */
export function todayIn(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const shortDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' })

/** "hoje", "ontem", "amanhã", or a short weekday and date. */
export function dayLabel(day: string, today: string): string {
  if (day === today) return 'hoje'
  if (day === addDays(today, -1)) return 'ontem'
  if (day === addDays(today, 1)) return 'amanhã'
  return shortDate.format(new Date(`${day}T00:00:00Z`))
}

/** Short weekday names indexed like Postgres `extract(dow)`: 0 is Sunday. 2023-01-01 was a Sunday. */
export const WEEKDAYS: readonly string[] = Array.from({ length: 7 }, (_, dow) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + dow))),
)
