import type { Database, Json } from '../database.types.ts'

type RawTodayRow = Database['public']['Functions']['today_tasks']['Returns'][number]

export type Step = { text: string; emoji: string | null }

// The generated type marks the left-joined columns as non-null. They are null for one-off tasks and for tasks with no active completion.
// `rejected_by_name` and `hint` are set only while a task is back to "todo" after a same-day rejection.
export type TodayTask = Omit<
  RawTodayRow,
  'routine_id' | 'routine_name' | 'routine_position' | 'completion_id' | 'rejected_by_name' | 'hint' | 'steps'
> & {
  routine_id: string | null
  routine_name: string | null
  routine_position: number | null
  completion_id: string | null
  rejected_by_name: string | null
  hint: string | null
  steps: Step[]
}

export function parseSteps(json: Json): Step[] {
  if (!Array.isArray(json)) return []
  return json.flatMap((item) =>
    typeof item === 'object' && item !== null && !Array.isArray(item) && typeof item.text === 'string'
      ? [{ text: item.text, emoji: typeof item.emoji === 'string' && item.emoji !== '' ? item.emoji : null }]
      : [],
  )
}

export function parseTodayRows(rows: RawTodayRow[]): TodayTask[] {
  return rows.map((row) => ({ ...row, steps: parseSteps(row.steps) }))
}

export type PinResult = { ok: true; token: string } | { ok: false; attemptsLeft: number; lockedUntil: Date | null }

export function parsePinResult(json: Json): PinResult {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) throw new Error('unexpected start_guardian_session reply')
  if (json.ok === true && typeof json.token === 'string') return { ok: true, token: json.token }
  return {
    ok: false,
    attemptsLeft: typeof json.attempts_left === 'number' ? json.attempts_left : 0,
    lockedUntil: typeof json.locked_until === 'string' ? new Date(json.locked_until) : null,
  }
}
