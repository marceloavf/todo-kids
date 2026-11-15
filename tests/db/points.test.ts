import { expect, test } from 'vitest'
import { adjust, balance, complete, errorKey, familyWithTask, ok, statement } from './helpers.ts'

test('a reversal after the points were spent takes what is left and stops at zero', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })
  const completion = await ok(complete(f, task.id, child.id))
  await ok(adjust(f, child.id, -7, 'Gastou na feira'))

  const entry = await ok(f.client.rpc('reverse_completion', { p_token: f.token, p_completion_id: completion.id }))

  expect(entry).toMatchObject({
    kind: 'reversal',
    requested_amount: -10,
    amount: -3,
    description: task.name,
    completion_id: completion.id,
    guardian_id: f.guardian.id,
  })
  expect(await balance(f, child.id)).toBe(0)
})

test('a reversed completion cannot be reversed again and frees the task for the day', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })
  const completion = await ok(complete(f, task.id, child.id))
  await ok(f.client.rpc('reverse_completion', { p_token: f.token, p_completion_id: completion.id }))

  const key = await errorKey(f.client.rpc('reverse_completion', { p_token: f.token, p_completion_id: completion.id }))
  const again = await ok(complete(f, task.id, child.id))

  expect(key).toBe('completion_not_approved')
  expect(again.id).not.toBe(completion.id)
  expect(await balance(f, child.id)).toBe(10)
})

test('a negative adjustment larger than the balance is capped and records both amounts', async () => {
  const { f, child } = await familyWithTask()
  await ok(adjust(f, child.id, 20, 'Bônus'))

  const entry = await ok(adjust(f, child.id, -50, 'Desconto'))

  expect(entry).toMatchObject({ kind: 'adjustment', requested_amount: -50, amount: -20, description: 'Desconto' })
  expect(await balance(f, child.id)).toBe(0)
})

test('an adjustment needs a reason and a nonzero amount', async () => {
  const { f, child } = await familyWithTask()

  expect(await errorKey(adjust(f, child.id, 10, '   '))).toBe('reason_required')
  expect(await errorKey(adjust(f, child.id, 0, 'Nada'))).toBe('invalid_amount')
  expect(await errorKey(adjust(f, f.guardian.id, 10, 'Responsável não tem saldo'))).toBe('not_found')
  expect(await statement(f, child.id)).toEqual([])
})

test('the balance equals the sum of the statement after a mixed sequence', async () => {
  const { f, child, task } = await familyWithTask({ points: 10 })
  const reward = await ok(f.client.rpc('save_reward', { p_token: f.token, p_name: 'Sorvete', p_icon: '🍦', p_cost: 15 }))

  const completion = await ok(complete(f, task.id, child.id))
  await ok(adjust(f, child.id, 25, 'Bônus'))
  const redemption = await ok(f.client.rpc('request_redemption', { p_reward_id: reward.id, p_child_id: child.id }))
  await ok(f.client.rpc('decide_redemption', { p_token: f.token, p_redemption_id: redemption.id, p_confirm: true }))
  await ok(adjust(f, child.id, -15, 'Desconto'))
  await ok(f.client.rpc('reverse_completion', { p_token: f.token, p_completion_id: completion.id }))
  await ok(complete(f, task.id, child.id))

  const entries = await statement(f, child.id)

  expect(entries.map((e) => e.amount).sort((a, b) => a - b)).toEqual([-15, -15, -5, 10, 10, 25])
  expect(await balance(f, child.id)).toBe(10)
  expect(entries.reduce((sum, e) => sum + e.amount, 0)).toBe(10)
})
