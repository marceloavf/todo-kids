import { expect, test } from '@playwright/test'

test('a guardian can read past 100 tied entries while a new adjustment arrives', async ({ page }) => {
  const { createFamily, addChild, adjust, ok, sql, url } = await import('../tests/db/helpers.ts')
  const family = await createFamily()
  const child = await addChild(family)
  const { data } = await family.client.auth.getSession()
  const login = data.session!
  // One transaction gives every fixture entry the same timestamp.
  sql(`begin;
    set local request.jwt.claim.sub = '${login.user.id}';
    select public.adjust_points('${family.token}', '${child.id}', 1, 'Teste ' || i)
    from generate_series(1, 101) i;
    commit;`)
  const key = 'sb-' + new URL(url).hostname.split('.')[0] + '-auth-token'
  await page.addInitScript(({ key, login }) => localStorage.setItem(key, JSON.stringify(login)), { key, login })
  await page.goto('/')
  await page.getByRole('button', { name: 'Mamãe, pede PIN' }).click()
  for (const digit of '1234') await page.getByRole('button', { name: digit, exact: true }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Extrato' }).click()
  const rows = page.locator('[data-entry="adjustment"]')
  await expect(rows).toHaveCount(100)
  await ok(adjust(family, child.id, 1, 'Novo lançamento'))
  await expect(rows.first()).toContainText('Novo lançamento')
  await page.getByRole('button', { name: 'Ver lançamentos anteriores' }).click()
  await expect(rows).toHaveCount(102)
  expect(new Set(await rows.allTextContents()).size).toBe(102)
  await expect(page.getByRole('button', { name: 'Ver lançamentos anteriores' })).toHaveCount(0)
})
