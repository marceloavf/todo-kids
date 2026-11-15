import { expect, test } from 'vitest'
import {
  addChild,
  addRoutine,
  ALL_WEEKDAYS,
  balance,
  complete,
  errorKey,
  familyWithTask,
  ok,
  saveTask,
  todayTask,
} from './helpers.ts'

function addDays(day: string, days: number) {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

test('a routine task applies only on the weekdays of its routine', async () => {
  const { f, child, task } = await familyWithTask()
  const { day } = (await todayTask(f, task.id, child.id))!
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay()
  const dueToday = await addRoutine(f, [child.id], [weekday])
  const otherDays = await addRoutine(f, [child.id], ALL_WEEKDAYS.filter((d) => d !== weekday))
  const due = await ok(saveTask(f, { routineId: dueToday.id }))
  const notDue = await ok(saveTask(f, { routineId: otherDays.id }))

  expect(await todayTask(f, due.id, child.id)).toMatchObject({ status: 'todo' })
  expect(await todayTask(f, notDue.id, child.id)).toBeUndefined()
  expect(await errorKey(complete(f, notDue.id, child.id))).toBe('task_not_available')
  expect((await ok(complete(f, due.id, child.id))).day).toBe(day)
})

test('a task cannot be completed by a child it is not assigned to', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })
  const sibling = await addChild(f, 'Theo')

  expect(await todayTask(f, task.id, sibling.id)).toBeUndefined()
  expect(await errorKey(complete(f, task.id, sibling.id))).toBe('task_not_available')
  expect(await errorKey(complete(f, task.id, f.guardian.id))).toBe('task_not_available')
  expect(await balance(f, sibling.id)).toBe(0)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ status: 'todo' })
})

test('a one-off task applies on its date to its children, after the routine tasks', async () => {
  const { f, child, task } = await familyWithTask()
  const sibling = await addChild(f, 'Theo')
  const { day } = (await todayTask(f, task.id, child.id))!
  const today = await ok(saveTask(f, { name: 'Levar o lixo', points: 5, oneOffDate: day, childIds: [child.id] }))
  const tomorrow = await ok(saveTask(f, { oneOffDate: addDays(day, 1), childIds: [child.id] }))

  const rows = (await ok(f.client.rpc('today_tasks'))).filter((row) => row.child_id === child.id)

  expect(rows.map((row) => row.task_id)).toEqual([task.id, today.id])
  expect(rows[1]).toMatchObject({ routine_id: null, routine_name: null, name: 'Levar o lixo' })
  expect(await errorKey(complete(f, tomorrow.id, child.id))).toBe('task_not_available')
  expect(await errorKey(complete(f, today.id, sibling.id))).toBe('task_not_available')
  expect((await ok(complete(f, today.id, child.id))).status).toBe('approved')
  expect(await balance(f, child.id)).toBe(5)
})

test('a completion keeps the points the task had, even after the task is edited', async () => {
  const { f, child, routine, task } = await familyWithTask({ points: 10, requiresApproval: true })
  const completion = await ok(complete(f, task.id, child.id))

  await ok(saveTask(f, { id: task.id, routineId: routine.id, points: 99, requiresApproval: true }))
  await ok(f.client.rpc('decide_completions', { p_token: f.token, p_completion_ids: [completion.id], p_approve: true }))

  expect(await balance(f, child.id)).toBe(10)
  expect(await todayTask(f, task.id, child.id)).toMatchObject({ points: 99, status: 'done' })
})

test('archived tasks and routines leave the day and cannot be completed', async () => {
  const { f, child, routine, task } = await familyWithTask()
  const other = await ok(saveTask(f, { name: 'Escovar os dentes', routineId: routine.id }))

  await ok(f.client.rpc('archive_task', { p_token: f.token, p_id: task.id }))

  expect(await todayTask(f, task.id, child.id)).toBeUndefined()
  expect(await errorKey(complete(f, task.id, child.id))).toBe('task_not_available')
  expect(await todayTask(f, other.id, child.id)).toMatchObject({ status: 'todo' })

  await ok(f.client.rpc('archive_routine', { p_token: f.token, p_id: routine.id }))

  expect(await ok(f.client.rpc('today_tasks'))).toEqual([])
  expect(await errorKey(complete(f, other.id, child.id))).toBe('task_not_available')
})

test('today_tasks follows the order the guardian set', async () => {
  const { f, child, routine, task } = await familyWithTask()
  const second = await ok(saveTask(f, { name: 'Escovar os dentes', routineId: routine.id }))
  const earlier = await addRoutine(f, [child.id])
  const first = await ok(saveTask(f, { name: 'Tomar café', routineId: earlier.id }))

  await ok(f.client.rpc('set_routine_order', { p_token: f.token, p_ids: [earlier.id, routine.id] }))
  await ok(
    f.client.rpc('set_task_order', { p_token: f.token, p_routine_id: routine.id, p_task_ids: [second.id, task.id] }),
  )

  const rows = await ok(f.client.rpc('today_tasks'))

  expect(rows.map((row) => row.task_id)).toEqual([first.id, second.id, task.id])
})
