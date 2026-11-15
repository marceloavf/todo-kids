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

test('a new family sets up a day, the child marks it, the guardian rejects with a hint, approves and adjusts', async ({ page }) => {
  page.on('dialog', (dialog) => void dialog.accept())
  await page.goto('/')

  await page.getByRole('button', { name: 'Criar família' }).click()
  await page.getByLabel('E-mail').fill(`e2e-${randomUUID()}@todokids.local`)
  await page.getByLabel('Senha').fill(randomUUID())
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
  await nameField(page).fill('Manhã')
  const weekdays = page.getByRole('group', { name: 'Dias da semana' }).getByRole('button')
  await expect(weekdays).toHaveCount(7)
  for (const day of await weekdays.all()) await expect(day).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Bia' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Salvar rotina' }).click()
  await page.getByRole('button', { name: /^Manhã/ }).click()

  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await nameField(page).fill('Arrumar a cama')
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
  await nameField(page).fill('Sorvete')
  await page.getByRole('textbox', { name: 'Custo em pontos', exact: true }).fill('20')
  await page.getByRole('button', { name: 'Salvar recompensa' }).click()
  await expect(page.getByRole('button', { name: /^Sorvete/ })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).click()
  await page.getByRole('button', { name: 'Bia' }).click()
  const saldo = (points: number) => page.getByRole('status', { name: `Saldo: ${points} pontos` })
  await expect(saldo(0)).toBeVisible()

  await markThroughCard(page, page.getByRole('button', { name: /^Arrumar a cama\./ }))
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
  await expect(entries.filter({ hasText: 'Conclusão: Arrumar a cama' })).toContainText('+5')
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
