import { expect, test } from 'vitest'
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
  const tasks = await ok(f.client.from('tasks').select('name'))
  expect(tasks.map(({ name }) => name).sort()).toEqual(
    [...ROUTINES.flatMap(({ tasks }) => tasks), ...ONE_OFFS.map(({ task }) => task)].map(({ name }) => name).sort(),
  )
  const rewards = await ok(f.client.from('rewards').select('name, icon, cost').order('cost'))
  expect(rewards).toEqual(REWARDS)
  expect(await balance(f, child.id)).toBe(0)
  expect((await ok(f.client.rpc('today_tasks'))).some((task) => task.child_id === child.id)).toBe(true)
})
