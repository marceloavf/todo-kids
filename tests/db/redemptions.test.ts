import { expect, test } from 'vitest'
import { addChild, adjust, balance, createFamily, errorKey, type Family, ok, statement } from './helpers.ts'

async function familyWithReward(cost: number, startingBalance: number) {
  const f = await createFamily()
  const child = await addChild(f)
  const reward = await ok(f.client.rpc('save_reward', { p_token: f.token, p_name: 'Cinema', p_icon: '🎬', p_cost: cost }))
  if (startingBalance > 0) await ok(adjust(f, child.id, startingBalance, 'Saldo inicial'))
  return { f, child, reward }
}

function request(f: Family, rewardId: string, childId: string) {
  return f.client.rpc('request_redemption', { p_reward_id: rewardId, p_child_id: childId })
}

function decide(f: Family, redemptionId: string, confirm: boolean) {
  return f.client.rpc('decide_redemption', { p_token: f.token, p_redemption_id: redemptionId, p_confirm: confirm })
}

test('a redemption is refused when the balance does not cover the cost', async () => {
  const { f, child, reward } = await familyWithReward(50, 49)

  expect(await errorKey(request(f, reward.id, child.id))).toBe('insufficient_balance')
  expect(await ok(f.client.from('redemptions').select('id'))).toEqual([])
})

test('a child holds one pending redemption at a time', async () => {
  const { f, child, reward } = await familyWithReward(50, 200)
  const first = await ok(request(f, reward.id, child.id))

  expect(await errorKey(request(f, reward.id, child.id))).toBe('pending_redemption_exists')

  await ok(decide(f, first.id, false))
  const second = await ok(request(f, reward.id, child.id))

  expect(second.status).toBe('pending')
  expect(await balance(f, child.id)).toBe(200)
})

test('confirming debits the cost the reward had at request time', async () => {
  const { f, child, reward } = await familyWithReward(50, 80)
  const redemption = await ok(request(f, reward.id, child.id))
  expect(await balance(f, child.id)).toBe(80)
  await ok(
    f.client.rpc('save_reward', { p_token: f.token, p_id: reward.id, p_name: 'Cinema', p_icon: '🎬', p_cost: 70 }),
  )

  const confirmed = await ok(decide(f, redemption.id, true))

  expect(confirmed).toMatchObject({ status: 'confirmed', cost: 50, decided_by: f.guardian.id })
  expect(await balance(f, child.id)).toBe(30)
  expect((await statement(f, child.id)).find((e) => e.kind === 'redemption')).toMatchObject({
    requested_amount: -50,
    amount: -50,
    description: 'Cinema',
    redemption_id: redemption.id,
    guardian_id: f.guardian.id,
  })
  expect(await errorKey(decide(f, redemption.id, false))).toBe('redemption_not_pending')
})

test('once an adjustment removes the cover, confirming is blocked and refusing still works', async () => {
  const { f, child, reward } = await familyWithReward(50, 60)
  const redemption = await ok(request(f, reward.id, child.id))
  await ok(adjust(f, child.id, -20, 'Desconto'))

  expect(await errorKey(decide(f, redemption.id, true))).toBe('insufficient_balance')
  expect(await balance(f, child.id)).toBe(40)
  expect(await ok(f.client.from('redemptions').select('status').eq('id', redemption.id).single())).toEqual({
    status: 'pending',
  })

  const refused = await ok(decide(f, redemption.id, false))

  expect(refused.status).toBe('refused')
  expect(await balance(f, child.id)).toBe(40)
  expect((await statement(f, child.id)).filter((e) => e.kind === 'redemption')).toEqual([])
})

test('two guardians confirming the same redemption at once debit it once', async () => {
  const { f, child, reward } = await familyWithReward(50, 120)
  const redemption = await ok(request(f, reward.id, child.id))

  const results = await Promise.all([decide(f, redemption.id, true), decide(f, redemption.id, true)])

  expect(results.map((r) => r.error?.message ?? 'ok').sort()).toEqual(['ok', 'redemption_not_pending'])
  expect(await balance(f, child.id)).toBe(70)
})
