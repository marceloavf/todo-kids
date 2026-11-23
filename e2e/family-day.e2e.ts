import { expect, test } from '@playwright/test'
import { existsSync } from 'node:fs'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

test('a paired phone recovers its identity and tasks, then closes yesterday’s card at family midnight', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 650 })
  const now = new Date('2026-11-24T02:58:00Z')
  await page.clock.install({ time: now })
  const authKey = 'sb-' + new URL(process.env.VITE_SUPABASE_URL!).hostname.split('.')[0] + '-auth-token'
  const exp = Math.round(now.getTime() / 1000) + 7 * 86400
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const user = { id: 'fictional-device', aud: 'authenticated', role: 'authenticated', is_anonymous: true }
  const jwt = [encode({ alg: 'HS256', typ: 'JWT' }), encode({ ...user, sub: user.id, exp }), 'ZmFrZQ'].join('.')
  await page.addInitScript(({ authKey, session }) => localStorage.setItem(authKey, JSON.stringify(session)), {
    authKey, session: { user, access_token: jwt, refresh_token: 'fixture', token_type: 'bearer', expires_at: exp },
  })
  let lookupFails = true
  let tasksFail = true
  let day = '2026-11-23'
  let empty = false
  let approved = false
  let submissions = 0
  await page.route('**/rest/v1/**', async route => {
    const name = new URL(route.request().url()).pathname.split('/').at(-1)
    if ((name === 'device_child_id' && lookupFails) || (name === 'today_tasks' && tasksFail)) {
      return route.fulfill({ status: 400, json: { message: 'simulated read failure' } })
    }
    let data: unknown = []
    if (name === 'device_child_id') data = 'child'
    if (name === 'profiles') data = [{ id: 'child', kind: 'child', name: 'Bia', balance: 100, avatar: '🐱', color: '#ffffff', reduced_motion: true }]
    if (name === 'families') data = { timezone: 'America/Sao_Paulo' }
    if (name === 'complete_task') submissions++
    if (name === 'today_tasks' && !empty) data = [{
      task_id: 'recurring', child_id: 'child', routine_id: 'morning', routine_name: 'Manhã', day,
      name: 'Preparar a mochila para a escola', icon: '🎒', status: approved ? 'done' : 'todo', points: 1,
      steps: [{ text: 'Guarde o caderno' }], requires_approval: true,
    }]
    return route.fulfill({ json: data })
  })
  await page.goto('/')
  await page.clock.runFor(150)
  const retry = page.getByRole('button', { name: 'Tentar de novo', exact: true })
  await expect(retry).toBeVisible()
  lookupFails = false
  await retry.click()
  await page.clock.runFor(1800)
  await expect(page.getByText('Não conseguimos carregar suas tarefas.')).toBeVisible()
  await expect(page.getByText('Nada para hoje!')).toHaveCount(0)
  tasksFail = false
  await retry.click()
  const task = page.getByRole('button', { name: /^Preparar a mochila/ })
  await expect(task).toBeVisible()
  await task.focus()
  await task.press('Enter')
  await page.clock.runFor(600)
  await expect(page.getByRole('dialog')).toContainText('Guarde o caderno')
  await page.addStyleTag({ content: 'html { font-size: 200% }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Escape')
  await page.clock.runFor(1000)
  await expect(task).toBeFocused()
  await task.press('Enter')
  await page.clock.runFor(600)
  day = '2026-11-24'
  empty = true
  await page.clock.fastForward(125000)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('O dia mudou. Escolha uma tarefa de hoje.')).toBeVisible()
  await expect(page.getByText('Nada para hoje!')).toBeVisible()
  empty = false
  day = '2026-11-25'
  await page.clock.setSystemTime(new Date('2026-11-25T04:00:00Z'))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(task).toBeVisible()
  await task.focus()
  await task.press('Enter')
  await expect(page.getByRole('dialog')).toContainText('Guarde o caderno')
  // A guardian decision on another device reaches the open card through a refetch.
  approved = true
  await page.evaluate(() => window.dispatchEvent(new Event('visibilitychange')))
  await expect(page.getByRole('dialog', { name: 'Dia completo!' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await expect(page.getByRole('dialog')).toBeFocused()
  await page.clock.runFor(800)
  await page.keyboard.press('Escape')
  await page.clock.runFor(800)
  await expect(page.getByRole('dialog')).toContainText('Guarde o caderno')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(submissions).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
