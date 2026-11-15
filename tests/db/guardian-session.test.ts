import { expect, test } from 'vitest'
import {
  addChild,
  adjust,
  balance,
  type Client,
  createFamily,
  errorKey,
  ok,
  PIN,
  sql,
  startSession,
} from './helpers.ts'

const NIL = '00000000-0000-0000-0000-000000000000'

function guardianCalls(client: Client, token: string, childId: string) {
  return {
    decide_completions: client.rpc('decide_completions', { p_token: token, p_completion_ids: [NIL], p_approve: true }),
    reverse_completion: client.rpc('reverse_completion', { p_token: token, p_completion_id: NIL }),
    adjust_points: client.rpc('adjust_points', { p_token: token, p_child_id: childId, p_amount: 5, p_reason: 'x' }),
    decide_redemption: client.rpc('decide_redemption', { p_token: token, p_redemption_id: NIL, p_confirm: true }),
    save_routine: client.rpc('save_routine', { p_token: token, p_name: 'x', p_weekdays: [1], p_child_ids: [] }),
    archive_routine: client.rpc('archive_routine', { p_token: token, p_id: NIL }),
    set_routine_order: client.rpc('set_routine_order', { p_token: token, p_ids: [] }),
    save_task: client.rpc('save_task', {
      p_token: token,
      p_name: 'x',
      p_icon: 'x',
      p_description: '',
      p_steps: [],
      p_points: 1,
      p_requires_approval: false,
      p_one_off_date: '2030-01-01',
      p_child_ids: [childId],
    }),
    archive_task: client.rpc('archive_task', { p_token: token, p_id: NIL }),
    set_task_order: client.rpc('set_task_order', { p_token: token, p_routine_id: NIL, p_task_ids: [] }),
    save_reward: client.rpc('save_reward', { p_token: token, p_name: 'x', p_icon: 'x', p_cost: 1 }),
    archive_reward: client.rpc('archive_reward', { p_token: token, p_id: NIL }),
    save_profile: client.rpc('save_profile', {
      p_token: token,
      p_kind: 'child',
      p_name: 'x',
      p_color: 'x',
      p_avatar: 'x',
      p_read_aloud: false,
      p_sounds: true,
      p_reduced_motion: false,
    }),
    archive_profile: client.rpc('archive_profile', { p_token: token, p_id: childId }),
    update_family: client.rpc('update_family', { p_token: token, p_name: 'x', p_timezone: 'UTC' }),
  }
}

async function expectAllRefused(calls: ReturnType<typeof guardianCalls>) {
  const names = Object.keys(calls)
  const keys = await Promise.all(Object.values(calls).map(errorKey))
  expect(Object.fromEntries(names.map((name, i) => [name, keys[i]]))).toEqual(
    Object.fromEntries(names.map((name) => [name, 'not_authorized'])),
  )
}

test('the right PIN returns a token that authorizes guardian functions', async () => {
  const f = await createFamily()
  const child = await addChild(f)

  const session = await startSession(f.client, f.guardian.id, PIN)

  expect(session).toMatchObject({ ok: true, attempts_left: 5, locked_until: null })
  expect(session.token).toMatch(/^[0-9a-f]{64}$/)
  await ok(f.client.rpc('adjust_points', { p_token: session.token!, p_child_id: child.id, p_amount: 5, p_reason: 'Bônus' }))
  expect(await balance(f, child.id)).toBe(5)
})

test('a wrong PIN fails without a token and uses up an attempt', async () => {
  const f = await createFamily()

  expect(await startSession(f.client, f.guardian.id, '0000')).toEqual({
    ok: false,
    token: null,
    attempts_left: 4,
    locked_until: null,
  })
  expect(await startSession(f.client, f.guardian.id, '9999')).toMatchObject({ ok: false, attempts_left: 3 })
  expect(await startSession(f.client, f.guardian.id, PIN)).toMatchObject({ ok: true, attempts_left: 5 })
  expect(await startSession(f.client, f.guardian.id, '0000')).toMatchObject({ ok: false, attempts_left: 4 })
})

test('five wrong PINs lock the profile, and the right PIN fails until the lock ends', async () => {
  const f = await createFamily()
  for (let left = 4; left >= 1; left--) {
    expect(await startSession(f.client, f.guardian.id, '0000')).toMatchObject({ ok: false, attempts_left: left })
  }

  const fifth = await startSession(f.client, f.guardian.id, '0000')

  expect(fifth).toMatchObject({ ok: false, token: null, attempts_left: 0 })
  const lockedMs = new Date(fifth.locked_until!).getTime() - Date.now()
  expect(lockedMs).toBeGreaterThan(4 * 60_000)
  expect(lockedMs).toBeLessThanOrEqual(5 * 60_000 + 5_000)
  expect(await startSession(f.client, f.guardian.id, PIN)).toMatchObject({ ok: false, token: null, attempts_left: 0 })

  sql(`update private.guardian_credentials set locked_until = now() - interval '1 second' where profile_id = '${f.guardian.id}'`)

  expect(await startSession(f.client, f.guardian.id, PIN)).toMatchObject({ ok: true, attempts_left: 5 })
})

test('every guardian function refuses a missing or unknown token', async () => {
  const f = await createFamily()
  const child = await addChild(f)

  await expectAllRefused(guardianCalls(f.client, '', child.id))
  await expectAllRefused(guardianCalls(f.client, 'f'.repeat(64), child.id))
  expect(await balance(f, child.id)).toBe(0)
})

test('a token from another family is refused', async () => {
  const mine = await createFamily()
  const theirs = await createFamily()
  const child = await addChild(mine)
  const theirChild = await addChild(theirs)

  await expectAllRefused(guardianCalls(mine.client, theirs.token, child.id))
  expect(await errorKey(adjust(mine, theirChild.id, 5))).toBe('not_found')
  expect(await balance(theirs, theirChild.id)).toBe(0)
})

test('an expired token is refused', async () => {
  const f = await createFamily()
  const child = await addChild(f)

  sql(`update private.guardian_sessions set expires_at = now() - interval '1 second' where profile_id = '${f.guardian.id}'`)

  await expectAllRefused(guardianCalls(f.client, f.token, child.id))
})

test('using a token extends it, so only 15 idle minutes expire it', async () => {
  const f = await createFamily()
  const child = await addChild(f)
  sql(`update private.guardian_sessions set expires_at = now() + interval '5 seconds' where profile_id = '${f.guardian.id}'`)

  await ok(adjust(f, child.id, 5))
  sql(`update private.guardian_sessions set expires_at = expires_at - interval '14 minutes' where profile_id = '${f.guardian.id}'`)

  await ok(adjust(f, child.id, 5))
  expect(await balance(f, child.id)).toBe(10)
})

test('ending the session revokes the token', async () => {
  const f = await createFamily()
  const child = await addChild(f)

  await ok(f.client.rpc('end_guardian_session', { p_token: f.token }))

  expect(await errorKey(adjust(f, child.id, 5))).toBe('not_authorized')
})

test('a child profile cannot start a guardian session', async () => {
  const f = await createFamily()
  const child = await addChild(f)

  expect(await errorKey(f.client.rpc('start_guardian_session', { p_profile_id: child.id, p_pin: PIN }))).toBe('not_found')
})
