import { expect, test } from 'vitest'
import { balance, complete, type Family, familyWithTask, ok, saveTask, todayTask } from './helpers.ts'

// These two zones never share a calendar date, so switching the family between them moves "today".
const YESTERDAY_ZONE = 'Pacific/Pago_Pago'
const TODAY_ZONE = 'Pacific/Kiritimati'

async function moveTo(f: Family, timezone: string) {
  await ok(f.client.rpc('update_family', { p_token: f.token, p_name: 'Família Teste', p_timezone: timezone }))
  f.timezone = timezone
}

function decide(f: Family, completionId: string, approve: boolean) {
  return ok(
    f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [completionId], p_approve: approve }),
  )
}

test('an approval after midnight credits the points and leaves the new day untouched', async () => {
  const { f, child, task } = await familyWithTask({ points: 10, requiresApproval: true }, YESTERDAY_ZONE)
  const completion = await ok(complete(f, task.id, child.id))

  await moveTo(f, TODAY_ZONE)
  const today = await todayTask(f, task.id, child.id)
  expect(today).toMatchObject({ status: 'todo', completion_id: null })
  expect(today!.day > completion.day).toBe(true)

  const [approved] = await decide(f, completion.id, true)

  expect(approved).toMatchObject({ status: 'approved', day: completion.day })
  expect(await balance(f, child.id)).toBe(10)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'todo', completion_id: null })
})

test('a rejection after midnight leaves that day without a completion and the new day untouched', async () => {
  const { f, child, routine, task } = await familyWithTask({ points: 10, requiresApproval: true }, YESTERDAY_ZONE)
  const kept = await ok(saveTask(f, { name: 'Guardar os brinquedos', requiresApproval: true, routineId: routine.id }))
  const rejected = await ok(complete(f, task.id, child.id))
  const pending = await ok(complete(f, kept.id, child.id))

  await moveTo(f, TODAY_ZONE)
  await decide(f, rejected.id, false)

  expect(await balance(f, child.id)).toBe(0)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'todo', completion_id: null })

  const next = await ok(complete(f, task.id, child.id))
  expect(next.day > rejected.day).toBe(true)

  await moveTo(f, YESTERDAY_ZONE)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ day: rejected.day, status: 'todo', completion_id: null })
  expect(await todayTask(f, kept.id, child.id)).toMatchObject({ status: 'pending', completion_id: pending.id })
})
