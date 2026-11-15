import { expect, test } from 'vitest'
import { ERROR_KEYS } from '../error-keys.ts'
import { ERROR_MESSAGES, GENERIC_ERROR, errorMessage } from './errors.ts'
import { parsePinResult, parseSteps, parseTodayRows } from './parse.ts'

test('parseSteps keeps text, turns a missing or empty emoji into null and drops malformed steps', () => {
  expect(
    parseSteps([
      { text: 'Estique o lençol', emoji: '🛏️' },
      { text: 'Puxe o cobertor' },
      { text: 'Ponha o travesseiro', emoji: '' },
      { emoji: '💤' },
      'solto',
      null,
    ]),
  ).toEqual([
    { text: 'Estique o lençol', emoji: '🛏️' },
    { text: 'Puxe o cobertor', emoji: null },
    { text: 'Ponha o travesseiro', emoji: null },
  ])
  expect(parseSteps({ text: 'not a list' })).toEqual([])
})

test('every database error key has its own pt-BR message', () => {
  expect(Object.keys(ERROR_MESSAGES).sort()).toEqual([...ERROR_KEYS].sort())
  for (const key of ERROR_KEYS) {
    expect(errorMessage({ message: key, code: 'P0001' })).toBe(ERROR_MESSAGES[key])
    expect(ERROR_MESSAGES[key]).not.toBe(GENERIC_ERROR)
  }
  expect(errorMessage(new TypeError('Failed to fetch'))).toBe(GENERIC_ERROR)
  expect(errorMessage({ message: 'Invalid login credentials', code: 'invalid_credentials' })).toBe('E-mail ou senha errados.')
})

test('parsePinResult reads the token, the attempts left and the lock time', () => {
  expect(parsePinResult({ ok: true, token: 'abc', attempts_left: 5, locked_until: null })).toEqual({ ok: true, token: 'abc' })
  expect(parsePinResult({ ok: false, token: null, attempts_left: 3, locked_until: null })).toEqual({
    ok: false,
    attemptsLeft: 3,
    lockedUntil: null,
  })
  const locked = parsePinResult({ ok: false, token: null, attempts_left: 0, locked_until: '2026-11-15T17:05:00+00:00' })
  expect(locked.ok === false && locked.lockedUntil?.toISOString()).toBe('2026-11-15T17:05:00.000Z')
})

test('parseTodayRows keeps the rejection note only where the server sends one', () => {
  const row = {
    child_id: 'c1',
    day: '2026-11-15',
    task_id: 't1',
    name: 'Arrumar a cama',
    icon: '🛏️',
    description: '',
    steps: [{ text: 'Estique o lençol' }],
    points: 5,
    requires_approval: true,
    position: 0,
    routine_id: 'r1',
    routine_name: 'Manhã',
    routine_position: 0,
    status: 'todo' as const,
    completion_id: null,
    rejected_by_name: 'Ana',
    hint: 'Falta o travesseiro',
  }
  // The generated row type claims these columns are never null; the server sends null for tasks without a rejection.
  const rows = parseTodayRows([row, { ...row, task_id: 't2', rejected_by_name: null, hint: null }] as unknown as Parameters<typeof parseTodayRows>[0])
  expect(rows.map(({ task_id, rejected_by_name, hint, steps }) => ({ task_id, rejected_by_name, hint, steps }))).toEqual([
    { task_id: 't1', rejected_by_name: 'Ana', hint: 'Falta o travesseiro', steps: [{ text: 'Estique o lençol', emoji: null }] },
    { task_id: 't2', rejected_by_name: null, hint: null, steps: [{ text: 'Estique o lençol', emoji: null }] },
  ])
})
