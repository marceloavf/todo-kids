import { expect, test } from 'vitest'
import { addDays, todayIn } from '../../src/guardian/dates.ts'
import { ONE_OFFS, REWARDS, ROUTINES } from '../../scripts/pilot-content.ts'
import { addChild, balance, createFamily, ok } from './helpers.ts'

test('the first child gets the starter catalog without starting points or duplicate records', async () => {
  const f = await createFamily()
  const child = await addChild(f)
  await addChild(f, 'Theo')

  const routines = await ok(f.client.from('routines').select('name, weekdays, child_ids').order('position'))
  expect(routines).toEqual(
    ROUTINES.map(({ name, weekdays }) => ({ name, weekdays, child_ids: [child.id] })),
  )
  const tasks = await ok(f.client.from('tasks').select('name, icon, description, steps, points, requires_approval, child_ids, one_off_date, position, routine:routines(name)').order('position'))
  for (const routine of ROUTINES) {
    const rows = tasks.filter(row => row.routine?.name === routine.name)
    expect(rows).toHaveLength(routine.tasks.length)
    routine.tasks.forEach(({ requiresApproval, ...task }, position) => {
      expect(rows[position]).toMatchObject({ ...task, requires_approval: Boolean(requiresApproval), position })
    })
  }
  const oneOffs = tasks.filter(row => !row.routine)
  expect(oneOffs).toHaveLength(ONE_OFFS.length)
  ONE_OFFS.forEach(({ daysFromToday, task: { requiresApproval, ...task } }, position) => {
    expect(oneOffs[position]).toMatchObject({
      ...task, position, requires_approval: Boolean(requiresApproval), child_ids: [child.id],
      one_off_date: addDays(todayIn(f.timezone), daysFromToday),
    })
  })
  const rewards = await ok(f.client.from('rewards').select('name, icon, cost').order('cost'))
  expect(rewards).toEqual(REWARDS)
  expect(await balance(f, child.id)).toBe(0)
  expect((await ok(f.client.rpc('today_tasks'))).some((task) => task.child_id === child.id)).toBe(true)
})
