import { expect, test } from 'vitest'
import { balance, complete, errorKey, familyWithTask, ok, statement, todayTask } from './helpers.ts'

test('a task without approval credits its points when the child completes it', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })

  const completion = await ok(complete(f, task.id, child.id))

  expect(completion).toMatchObject({ status: 'approved', points: 10 })
  expect(await balance(f, child.id)).toBe(10)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'done', completion_id: completion.id })
  expect(await statement(f, child.id)).toMatchObject([
    { kind: 'completion', requested_amount: 10, amount: 10, description: task.name, completion_id: completion.id },
  ])
})

test('a task with approval stays pending without credit until a guardian approves', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true })

  const completion = await ok(complete(f, task.id, child.id))

  expect(completion.status).toBe('pending')
  expect(await balance(f, child.id)).toBe(0)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'pending' })

  const decided = await ok(
    f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [completion.id], p_approve: true }),
  )

  expect(decided).toMatchObject([{ id: completion.id, status: 'approved', decided_by: f.guardian.id }])
  expect(await balance(f, child.id)).toBe(10)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'done' })
  expect(await statement(f, child.id)).toMatchObject([{ kind: 'completion', amount: 10, guardian_id: f.guardian.id }])
})

test('a rejection returns the task to todo the same day and the child can complete it again', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const first = await ok(complete(f, task.id, child.id))

  await ok(f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [first.id], p_approve: false }))

  expect(await balance(f, child.id)).toBe(0)
  expect(await statement(f, child.id)).toEqual([])
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'todo', completion_id: null })

  const second = await ok(complete(f, task.id, child.id))

  expect(second.id).not.toBe(first.id)
  expect(second.status).toBe('pending')
})

test('a rejection shows who asked and the hint until the child completes the task again', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const first = await ok(complete(f, task.id, child.id))

  const [rejected] = await ok(
    f.client.rpc('decide_completions', {
      p_token: f.token, p_completion_ids: [first.id], p_approve: false, p_hint: '  Guarde os sapatos também.  ',
    }),
  )

  expect(rejected!.hint).toBe('Guarde os sapatos também.')
  expect(await todayTask(f, task.id, child.id)).toMatchObject({
    status: 'todo', rejected_by_name: f.guardian.name, hint: 'Guarde os sapatos também.',
  })

  await ok(complete(f, task.id, child.id))

  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'pending', rejected_by_name: null, hint: null })
})

test('a hint is dropped on approval and refused above 120 characters', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const completion = await ok(complete(f, task.id, child.id))

  expect(
    await errorKey(
      f.client.rpc('decide_completions', {
        p_token: f.token, p_completion_ids: [completion.id], p_approve: false, p_hint: 'x'.repeat(121),
      }),
    ),
  ).toBe('invalid_hint')

  const [approved] = await ok(
    f.client.rpc('decide_completions', {
      p_token: f.token, p_completion_ids: [completion.id], p_approve: true, p_hint: 'ignorada',
    }),
  )

  expect(approved!.hint).toBeNull()
})

test('repeating complete_task returns the same completion and credits once', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })

  const first = await ok(complete(f, task.id, child.id))
  const second = await ok(complete(f, task.id, child.id))

  expect(second.id).toBe(first.id)
  expect(await balance(f, child.id)).toBe(10)
})

test('concurrent complete_task calls credit once', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })

  const completions = await Promise.all(Array.from({ length: 8 }, () => ok(complete(f, task.id, child.id))))

  expect(new Set(completions.map((c) => c.id)).size).toBe(1)
  expect(await balance(f, child.id)).toBe(10)
  expect(await statement(f, child.id)).toHaveLength(1)
})

test('only pending completions can be decided, and a stale batch decides nothing', async () => {
  const { f, child, routine, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const other = await ok(
    f.client.rpc('save_task', {
      p_token: f.token,
      p_name: 'Escovar os dentes',
      p_icon: '🪥',
      p_description: '',
      p_steps: [],
      p_points: 5,
      p_requires_approval: true,
      p_routine_id: routine.id,
    }),
  )
  const decidedBefore = await ok(complete(f, task.id, child.id))
  const stillPending = await ok(complete(f, other.id, child.id))
  await ok(f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [decidedBefore.id], p_approve: true }))

  const key = await errorKey(
    f.client.rpc('decide_completions', {
      p_token: f.token,
      p_completion_ids: [decidedBefore.id, stillPending.id],
      p_approve: true,
    }),
  )

  expect(key).toBe('completion_not_pending')
  expect(await balance(f, child.id)).toBe(10)
  expect(await todayTask(f, other.id, child.id)).toMatchObject({ status: 'pending' })
})

test('two guardians approving the same completion at once credit it once', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const completion = await ok(complete(f, task.id, child.id))
  const approve = () =>
    f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [completion.id], p_approve: true })

  const results = await Promise.all([approve(), approve(), approve()])

  expect(results.map((r) => r.error?.message ?? 'ok').sort()).toEqual([
    'completion_not_pending',
    'completion_not_pending',
    'ok',
  ])
  expect(await balance(f, child.id)).toBe(10)
})

test('two children in one routine keep separate completions and points', async () => {
  const { f, child, routine, task } = await familyWithTask({ points: 10 })
  const sibling = await ok(
    f.client.rpc('save_profile', {
      p_token: f.token,
      p_kind: 'child',
      p_name: 'Theo',
      p_color: '#2f7de1',
      p_avatar: '🦖',
      p_read_aloud: false,
      p_sounds: true,
      p_reduced_motion: false,
    }),
  )
  await ok(
    f.client.rpc('save_routine', {
      p_token: f.token,
      p_id: routine.id,
      p_name: routine.name,
      p_weekdays: routine.weekdays,
      p_child_ids: [child.id, sibling.id],
    }),
  )

  await ok(complete(f, task.id, child.id))

  expect(await balance(f, child.id)).toBe(10)
  expect(await balance(f, sibling.id)).toBe(0)
  expect(await todayTask(f, task.id, sibling.id)).toMatchObject({ status: 'todo' })
})

test('an older card cannot post a completion into a new family day', async () => {
  const { f, child, task } = await familyWithTask()
  expect(await errorKey(f.client.rpc('complete_task', {
    p_task_id: task.id, p_child_id: child.id, p_expected_day: '2000-01-01',
  }))).toBe('family_day_changed')
  expect(await statement(f, child.id)).toEqual([])
  expect(await balance(f, child.id)).toBe(0)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'todo' })
})
