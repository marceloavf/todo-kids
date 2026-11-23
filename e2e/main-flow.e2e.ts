import { randomUUID } from 'node:crypto'
import { expect, test, type Locator, type Page } from '@playwright/test'

const PIN = '4321'
const GUARDIAN = 'Responsável Teste'

async function enterPin(page: Page) {
  await page.getByRole('button', { name: `${GUARDIAN}, pede PIN` }).click()
  for (const digit of PIN) await page.getByRole('button', { name: digit, exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Seções do responsável' })).toBeVisible()
}

/** From the child's screen to the guardian's, through the armed "Trocar" card and the PIN. */
async function switchToGuardian(page: Page) {
  await page.getByRole('button', { name: 'Trocar de perfil' }).click()
  const leave = page.getByRole('dialog').getByRole('button', { name: 'Trocar', exact: true })
  await expect(leave).toHaveAttribute('aria-disabled', 'false')
  await leave.click()
  await enterPin(page)
}

const nameField = (page: Page) => page.getByRole('textbox', { name: 'Nome', exact: true })

const tab = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Seções do responsável' }).getByRole('button', { name }).click()

/** Opens a task card from its tile and taps "Fiz!" once the card arms. Tiles ignore taps right after a mark, so the open retries. */
async function markThroughCard(page: Page, tile: Locator) {
  const dialog = page.getByRole('dialog')
  await expect(async () => {
    await tile.click()
    await expect(dialog).toBeVisible({ timeout: 1000 })
  }).toPass()
  const done = dialog.getByRole('button', { name: 'Fiz!' })
  await expect(done).toHaveAttribute('aria-disabled', 'false')
  await done.click()
  await expect(dialog).toBeHidden()
}

async function setupFamily(page: Page) {
  page.on('dialog', (dialog) => void dialog.accept())
  await page.goto('/')

  if (process.env.VITE_FAMILY_PILOT === 'true') {
    process.loadEnvFile('.env.local')
    await expect(page.getByRole('button', { name: 'Criar família' })).toHaveCount(0)
    const refused = await page.request.post(`${process.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
      headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
      data: { email: `fictional-${randomUUID()}@todokids.local`, password: randomUUID() },
    })
    expect(await refused.text()).toContain('responsável pelo piloto')
    expect(refused.ok()).toBe(false)
    await page.getByLabel('E-mail').fill(process.env.PILOT_TEST_EMAIL!)
    await page.getByLabel('Senha').fill(process.env.PILOT_TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Entrar' }).click()
  } else {
    await page.getByRole('button', { name: 'Criar família' }).click()
    await page.getByLabel('E-mail').fill(`e2e-${randomUUID()}@todokids.local`)
    await page.getByLabel('Senha').fill(randomUUID())
  }
  await page.getByLabel('Nome da família').fill('Família E2E')
  await page.getByLabel('Seu nome').fill(GUARDIAN)
  await page.getByLabel('PIN do responsável').fill(PIN)
  await page.getByRole('button', { name: 'Criar família' }).click()
  await enterPin(page)

  await tab(page, 'Família')
  await page.getByRole('button', { name: 'Novo filho' }).click()
  await nameField(page).fill('Bia')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Bia' })).toBeVisible()

  await tab(page, 'Rotinas')
  await page.getByRole('button', { name: 'Nova', exact: true }).click()
  await nameField(page).fill('Antes do almoço')
  const weekdays = page.getByRole('group', { name: 'Dias da semana' }).getByRole('button')
  await expect(weekdays).toHaveCount(7)
  for (const day of await weekdays.all()) await expect(day).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Bia' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Salvar rotina' }).click()
  await page.getByRole('button', { name: /^Antes do almoço/ }).click()

  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await nameField(page).fill('Guardar o boné')
  await page.getByRole('textbox', { name: 'Pontos', exact: true }).fill('5')
  await page.getByRole('button', { name: 'Salvar tarefa' }).click()
  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await nameField(page).fill('Lição de casa')
  await page.getByRole('textbox', { name: 'Pontos', exact: true }).fill('10')
  await page.getByRole('checkbox', { name: 'Exige aprovação' }).check()
  await page.getByRole('button', { name: 'Salvar tarefa' }).click()
  await expect(page.getByRole('button', { name: /^Lição de casa/ })).toBeVisible()

  await tab(page, 'Recompensas')
  await page.getByRole('button', { name: 'Nova', exact: true }).click()
  await nameField(page).fill('Escolher o lanche')
  await page.getByRole('textbox', { name: 'Custo em pontos', exact: true }).fill('20')
  await page.getByRole('button', { name: 'Salvar recompensa' }).click()
  await expect(page.getByRole('button', { name: /^Escolher o lanche/ })).toBeVisible()
}

test('a new family sets up a day, the child marks it, the guardian rejects with a hint, approves and adjusts', async ({ page }) => {
  await setupFamily(page)
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.getByRole('button', { name: 'Bia' }).click()
  const saldo = (points: number) => page.getByRole('status', { name: `Saldo: ${points} pontos` })
  await expect(saldo(0)).toBeVisible()

  const routine = page.getByRole('region', { name: 'Antes do almoço' })
  await expect(routine.getByRole('button').first()).toHaveAccessibleName(/^Guardar o boné\. Tarefa 1\./)
  await expect(routine.getByRole('button').nth(1)).toHaveAccessibleName(/^Lição de casa\. Tarefa 2\./)
  await markThroughCard(page, routine.getByRole('button', { name: /^Guardar o boné\./ }))
  await expect(saldo(5)).toBeVisible()

  const homework = page.getByRole('button', { name: /^Lição de casa\./ })
  await markThroughCard(page, homework)
  // A single guardian in the family, so the child sees whose look the task waits for.
  await expect(homework).toHaveAccessibleName(/Esperando Responsável Teste ver/)
  await expect(page.getByText('1 feita · 1 esperando')).toBeVisible()
  await expect(saldo(5)).toBeVisible()

  await switchToGuardian(page)
  const pending = page.getByRole('listitem').filter({ hasText: 'Lição de casa' })
  await pending.getByRole('button', { name: 'Reprovar', exact: true }).click()
  await pending.getByRole('textbox', { name: /^Dica para Bia/ }).fill('Falta guardar o caderno')
  await pending.getByRole('button', { name: 'Reprovar', exact: true }).click()
  await expect(page.getByText('Nada esperando você.')).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await page.getByRole('button', { name: 'Bia' }).click()
  await expect(homework).toHaveAccessibleName(/Responsável Teste pediu para fazer de novo$/)
  await homework.click()
  const card = page.getByRole('dialog')
  await expect(card.getByText('Responsável Teste pediu para fazer de novo.')).toBeVisible()
  await expect(card.getByText('Dica: Falta guardar o caderno')).toBeVisible()
  const again = card.getByRole('button', { name: 'Fiz!' })
  await expect(again).toHaveAttribute('aria-disabled', 'false')
  await again.click()
  await expect(card).toBeHidden()
  await expect(homework).toHaveAccessibleName(/Esperando Responsável Teste ver/)

  await switchToGuardian(page)
  await pending.getByRole('button', { name: 'Aprovar', exact: true }).click()
  await expect(page.getByText('Nada esperando você.')).toBeVisible()
  await expect(page.getByLabel('Saldo de Bia: 15 pontos')).toBeVisible()

  await tab(page, 'Extrato')
  await expect(saldo(15)).toBeVisible()
  const entries = page.locator('[data-entry]')
  await expect(entries.filter({ hasText: 'Conclusão: Guardar o boné' })).toContainText('+5')
  await expect(entries.filter({ hasText: 'Conclusão: Lição de casa' })).toContainText(`por ${GUARDIAN}`)
  await expect(entries.filter({ hasText: 'Conclusão: Lição de casa' })).toContainText('+10')

  await page.getByText('Ajuste', { exact: true }).click()
  await page.getByText('Desconto', { exact: true }).click()
  await page.getByRole('textbox', { name: 'Pontos', exact: true }).fill('100')
  await page.getByRole('textbox', { name: 'Motivo', exact: true }).fill('Desconto maior que o saldo')
  await page.getByRole('button', { name: 'Descontar' }).click()
  await expect(saldo(0)).toBeVisible()
  await expect(entries.filter({ hasText: 'Ajuste: Desconto maior que o saldo' })).toContainText('pedido −100, saiu −15')

  // The approval reaches the child as a short notice on the next open, not a full-screen party.
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.getByRole('button', { name: 'Bia' }).click()
  await expect(page.getByText('Responsável Teste viu!')).toBeVisible()
  await expect(page.getByText('1 tarefa · +10')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('a dedicated child device pairs, earns and spends points, then loses access', async ({ page, browser, baseURL }) => {
  await setupFamily(page)
  await tab(page, 'Família')
  await page.getByRole('button', { name: 'Novo filho' }).click()
  await nameField(page).fill('Léo')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.getByRole('button', { name: 'Bia' }).click()
  await page.getByRole('button', { name: 'Vincular aparelho' }).click()
  const code = await page.getByText(/^[A-HJ-NP-Z2-9]{6}$/).innerText()
  const device = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
  try {
    const child = await device.newPage()
    await child.goto('/')
    await child.getByRole('button', { name: 'Tenho um código' }).click()
    await child.getByLabel('Código de vínculo').fill(code)
    await child.getByRole('button', { name: 'Vincular', exact: true }).click()
    const balance = (points: number) => child.getByRole('status', { name: `Saldo: ${points} pontos` })
    await expect(balance(0)).toBeVisible()
    await child.reload()
    await expect(balance(0)).toBeVisible()
    await expect(child.getByRole('button', { name: 'Trocar de perfil' })).toHaveCount(0)
    await expect(page.getByText('Vinculado!')).toBeVisible()
    const homework = child.getByRole('button', { name: /^Lição de casa\./ })
    await homework.click()
    await expect(child.getByRole('dialog')).toContainText('Lição de casa')
    await tab(page, 'Rotinas')
    await page.getByRole('button', { name: /^Antes do almoço/ }).click()
    const move = page.getByRole('button', { name: 'Subir Lição de casa' })
    await move.focus()
    await move.press('Enter')
    await expect(page.getByRole('status').filter({ hasText: 'Lição de casa, posição 1.' })).toBeVisible()
    await expect(move).toBeFocused()
    await child.getByRole('button', { name: 'Fechar', exact: true }).click()
    await expect(homework).toHaveAccessibleName(/^Lição de casa\. Tarefa 1\./)
    await tab(page, 'Início')
    await markThroughCard(child, homework)
    await page.getByRole('button', { name: 'Aprovar', exact: true }).click()
    await expect(balance(10)).toBeVisible()
    await tab(page, 'Recompensas')
    await page.getByRole('button', { name: /^Escolher o lanche/ }).click()
    await page.getByRole('textbox', { name: 'Custo em pontos' }).fill('10')
    await page.getByRole('button', { name: 'Salvar recompensa' }).click()
    await child.getByRole('button', { name: 'Recompensas', exact: true }).click()
    await child.getByRole('button', { name: /^Escolher o lanche.*Custa 10/ }).click()
    await child.getByRole('button', { name: 'Quero!' }).click()
    await tab(page, 'Início')
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(balance(0)).toBeVisible()
    await tab(page, 'Família')
    await page.getByRole('button', { name: 'Bia' }).click()
    await page.getByRole('button', { name: 'Desvincular' }).click()
    await expect(child.getByRole('button', { name: 'Tenho um código' })).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'Vincular aparelho' }).click()
    const replacement = await page.getByText(/^[A-HJ-NP-Z2-9]{6}$/).innerText()
    await child.getByRole('button', { name: 'Tenho um código' }).click()
    await child.getByLabel('Código de vínculo').fill(replacement)
    await child.getByRole('button', { name: 'Vincular', exact: true }).click()
    await expect(balance(0)).toBeVisible()
  } finally {
    await device.close()
  }
})
