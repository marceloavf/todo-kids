import type { SupabaseClient } from '@supabase/supabase-js'
import { beforeAll, expect, test } from 'vitest'
import {
  adjust,
  anonClient,
  complete,
  createFamily,
  failure,
  type Family,
  familyWithTask,
  ok,
  serviceRoleKey,
  signedInClient,
  url,
} from './helpers.ts'

const NIL = '00000000-0000-0000-0000-000000000000'

let a: Family
let childId: string
let taskId: string
let tables: string[]

beforeAll(async () => {
  const response = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}` },
  })
  const paths = Object.keys((await response.json()).paths)
  tables = paths.filter((path) => path !== '/' && !path.startsWith('/rpc/')).map((path) => path.slice(1))

  const seeded = await familyWithTask({ points: 10 })
  a = seeded.f
  childId = seeded.child.id
  taskId = seeded.task.id
  await ok(complete(a, taskId, childId))
  await ok(adjust(a, childId, 50))
  const reward = await ok(a.client.rpc('save_reward', { p_token: a.token, p_name: 'Cinema', p_icon: '🎬', p_cost: 20 }))
  await ok(a.client.rpc('request_redemption', { p_reward_id: reward.id, p_child_id: childId }))
})

test('a family reads its own rows and another family reads none of them', async () => {
  const b = await createFamily()
  const untyped = (f: Family) => f.client as unknown as SupabaseClient

  expect(tables.sort()).toEqual(
    ['completions', 'families', 'profiles', 'redemptions', 'rewards', 'routines', 'statement_entries', 'tasks'],
  )
  for (const table of tables) {
    const own = await ok(untyped(a).from(table).select('id'))
    const others = await ok(untyped(b).from(table).select('id'))
    expect(own.length, `${table} rows of family A`).toBeGreaterThan(0)
    expect(others.filter((row) => own.some((mine) => mine.id === row.id)), `${table} rows seen by family B`).toEqual([])
  }
  expect(await ok(b.client.from('profiles').select('id').eq('id', childId))).toEqual([])
  expect(await ok(b.client.rpc('today_tasks'))).toEqual([])
})

test('another family cannot act on this family through the functions', async () => {
  const b = await createFamily()

  expect((await failure(complete(b, taskId, childId))).message).toBe('task_not_available')
  expect((await failure(adjust(b, childId, 5))).message).toBe('not_found')
  expect(
    (await failure(b.client.rpc('start_guardian_session', { p_profile_id: a.guardian.id, p_pin: '1234' }))).message,
  ).toBe('not_found')
})

test('the app role cannot write to any table directly', async () => {
  const client = a.client as unknown as SupabaseClient

  for (const table of tables) {
    expect((await failure(client.from(table).insert({ id: NIL }))).code, `insert into ${table}`).toBe('42501')
    expect((await failure(client.from(table).update({ id: NIL }).eq('id', NIL))).code, `update ${table}`).toBe('42501')
    expect((await failure(client.from(table).delete().eq('id', NIL))).code, `delete from ${table}`).toBe('42501')
  }
})

test('a visitor without a session can neither read nor call anything', async () => {
  const anon = anonClient()
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const listing = await fetch(`${url}/rest/v1/`, { headers: { apikey: anonKey, authorization: `Bearer ${anonKey}` } })

  expect(Object.keys((await listing.json()).paths), 'tables and functions PostgREST offers to anon').toEqual(['/'])

  expect((await failure(anon.from('profiles').select('id'))).code).toBe('42501')
  expect((await failure(anon.rpc('today_tasks'))).code).toBe('42501')
  expect((await failure(anon.rpc('complete_task', { p_task_id: taskId, p_child_id: childId }))).code).toBe('42501')
  expect(
    (await failure(anon.rpc('start_guardian_session', { p_profile_id: a.guardian.id, p_pin: '1234' }))).code,
  ).toBe('42501')
})

test('the private schema is unreachable through the API', async () => {
  const client = (await signedInClient()) as unknown as SupabaseClient

  for (const table of ['guardian_credentials', 'guardian_sessions']) {
    expect((await failure(client.schema('private').from(table).select('*'))).code).toBe('PGRST106')
  }
  expect((await failure(client.schema('private').rpc('require_guardian', { p_token: a.token }))).code).toBe('PGRST106')
  expect((await failure(client.rpc('require_guardian', { p_token: a.token }))).code).toBe('PGRST202')
})
