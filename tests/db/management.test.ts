import { expect, test } from 'vitest'
import {
  addChild,
  addRoutine,
  adjust,
  createFamily,
  errorKey,
  type Family,
  familyWithTask,
  ok,
  PIN,
  saveTask,
  signedInClient,
  startSession,
  todayTask,
} from './helpers.ts'

function saveProfile(f: Family, input: { kind: 'guardian' | 'child'; id?: string; pin?: string; sounds?: boolean }) {
  return f.client.rpc('save_profile', {
    p_token: f.token,
    p_kind: input.kind,
    p_name: 'Papai',
    p_color: '#2f7de1',
    p_avatar: '🦖',
    p_read_aloud: true,
    p_sounds: input.sounds ?? true,
    p_reduced_motion: false,
    p_id: input.id,
    p_pin: input.pin,
  })
}

test('create_family validates its input and runs once per login', async () => {
  const client = await signedInClient()
  const create = (overrides: object) =>
    client.rpc('create_family', {
      p_name: 'Família',
      p_timezone: 'America/Sao_Paulo',
      p_guardian_name: 'Mamãe',
      p_pin: PIN,
      ...overrides,
    })

  expect(await errorKey(create({ p_timezone: 'Marte/Olimpo' }))).toBe('invalid_timezone')
  expect(await errorKey(create({ p_pin: '12345' }))).toBe('invalid_pin_format')
  expect(await errorKey(create({ p_pin: 'abcd' }))).toBe('invalid_pin_format')
  expect(await errorKey(create({ p_name: ' ' }))).toBe('name_required')
  expect(await ok(client.from('families').select('id'))).toEqual([])

  const guardian = await ok(create({}))

  expect(guardian).toMatchObject({ kind: 'guardian', name: 'Mamãe', balance: 0 })
  expect(await ok(client.from('families').select('name, timezone'))).toEqual([
    { name: 'Família', timezone: 'America/Sao_Paulo' },
  ])
  expect(await errorKey(create({}))).toBe('family_exists')
})

test('save_task accepts up to five well-formed steps and refuses the rest', async () => {
  const { f, routine } = await familyWithTask()
  const step = { text: 'Abra a torneira', emoji: '🚰' }
  const refused = [
    Array(6).fill(step),
    [{ text: '', emoji: null }],
    [{ text: 'x'.repeat(61), emoji: null }],
    [{ text: 'Sem emoji' }],
    [{ text: 'Chave extra', emoji: null, done: true }],
    [{ text: 7, emoji: null }],
    ['Abra a torneira'],
    { text: 'Não é lista', emoji: null },
  ]

  for (const steps of refused) {
    expect(await errorKey(saveTask(f, { routineId: routine.id, steps })), JSON.stringify(steps)).toBe('invalid_steps')
  }
  const saved = await ok(
    saveTask(f, { routineId: routine.id, steps: [...Array(4).fill(step), { text: 'x'.repeat(60), emoji: null }] }),
  )
  expect(saved.steps).toHaveLength(5)
})

test('save_task refuses a wrong target, foreign ids and negative points', async () => {
  const { f, child, routine } = await familyWithTask()
  const other = await createFamily()
  const otherChild = await addChild(other)
  const otherRoutine = await addRoutine(other, [otherChild.id])
  const day = '2030-01-01'

  expect(await errorKey(saveTask(f, {}))).toBe('invalid_task_target')
  expect(await errorKey(saveTask(f, { routineId: routine.id, oneOffDate: day, childIds: [child.id] }))).toBe(
    'invalid_task_target',
  )
  expect(await errorKey(saveTask(f, { oneOffDate: day }))).toBe('invalid_task_target')
  expect(await errorKey(saveTask(f, { routineId: otherRoutine.id }))).toBe('not_found')
  expect(await errorKey(saveTask(f, { oneOffDate: day, childIds: [otherChild.id] }))).toBe('invalid_child_ids')
  expect(await errorKey(saveTask(f, { oneOffDate: day, childIds: [f.guardian.id] }))).toBe('invalid_child_ids')
  expect(await errorKey(saveTask(f, { routineId: routine.id, points: -1 }))).toBe('invalid_points')
  expect(await errorKey(saveTask(f, { routineId: routine.id, name: '  ' }))).toBe('name_required')
})

test('routines and rewards refuse invalid values', async () => {
  const f = await createFamily()
  const other = await createFamily()
  const otherChild = await addChild(other)
  const routine = (weekdays: number[], childIds: string[]) =>
    f.client.rpc('save_routine', { p_token: f.token, p_name: 'Manhã', p_weekdays: weekdays, p_child_ids: childIds })
  const reward = (cost: number) =>
    f.client.rpc('save_reward', { p_token: f.token, p_name: 'Cinema', p_icon: '🎬', p_cost: cost })

  expect(await errorKey(routine([7], []))).toBe('invalid_weekdays')
  expect(await errorKey(routine([1], [otherChild.id]))).toBe('invalid_child_ids')
  expect(await errorKey(reward(0))).toBe('invalid_cost')
  expect(await errorKey(f.client.rpc('archive_reward', { p_token: f.token, p_id: otherChild.id }))).toBe('not_found')
  expect(await errorKey(f.client.rpc('update_family', { p_token: f.token, p_name: 'x', p_timezone: 'Lua' }))).toBe(
    'invalid_timezone',
  )
})

test('a profile keeps its kind, and its options can change', async () => {
  const f = await createFamily()
  const child = await ok(saveProfile(f, { kind: 'child' }))

  expect(await errorKey(saveProfile(f, { kind: 'guardian', id: child.id, pin: '4321' }))).toBe('kind_immutable')
  expect(await errorKey(saveProfile(f, { kind: 'child', pin: '4321' }))).toBe('pin_not_allowed')

  const updated = await ok(saveProfile(f, { kind: 'child', id: child.id, sounds: false }))

  expect(updated).toMatchObject({ id: child.id, kind: 'child', sounds: false, read_aloud: true })
})

test('a new guardian needs a PIN, and saving a PIN for a guardian resets it', async () => {
  const f = await createFamily()

  expect(await errorKey(saveProfile(f, { kind: 'guardian' }))).toBe('pin_required')
  expect(await errorKey(saveProfile(f, { kind: 'guardian', pin: '12a4' }))).toBe('invalid_pin_format')

  const guardian = await ok(saveProfile(f, { kind: 'guardian', pin: '4321' }))
  expect(await startSession(f.client, guardian.id, '4321')).toMatchObject({ ok: true })

  await ok(saveProfile(f, { kind: 'guardian', id: guardian.id }))
  expect(await startSession(f.client, guardian.id, '4321')).toMatchObject({ ok: true })

  await ok(saveProfile(f, { kind: 'guardian', id: guardian.id, pin: '8765' }))
  expect(await startSession(f.client, guardian.id, '4321')).toMatchObject({ ok: false })
  expect(await startSession(f.client, guardian.id, '8765')).toMatchObject({ ok: true })
})

test('the last guardian cannot be archived, and an archived guardian loses access', async () => {
  const f = await createFamily()
  const archive = (token: string, id: string) => f.client.rpc('archive_profile', { p_token: token, p_id: id })

  expect(await errorKey(archive(f.token, f.guardian.id))).toBe('last_guardian')

  const second = await ok(saveProfile(f, { kind: 'guardian', pin: '4321' }))
  const { token } = await startSession(f.client, second.id, '4321')
  await ok(archive(token!, f.guardian.id))

  expect(await errorKey(saveProfile(f, { kind: 'child' }))).toBe('not_authorized')
  expect(await errorKey(f.client.rpc('start_guardian_session', { p_profile_id: f.guardian.id, p_pin: PIN }))).toBe(
    'not_found',
  )
  expect(await errorKey(archive(token!, second.id))).toBe('last_guardian')
})

test('an archived child leaves the day and keeps the balance', async () => {
  const { f, child, task } = await familyWithTask()
  await ok(adjust(f, child.id, 30))

  await ok(f.client.rpc('archive_profile', { p_token: f.token, p_id: child.id }))

  expect(await todayTask(f, task.id, child.id)).toBeUndefined()
  const archived = await ok(f.client.from('profiles').select('balance, archived_at').eq('id', child.id).single())
  expect(archived.balance).toBe(30)
  expect(archived.archived_at).not.toBeNull()
})
