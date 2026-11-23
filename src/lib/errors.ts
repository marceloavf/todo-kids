import { ERROR_KEYS, type ErrorKey } from '../error-keys.ts'

export const ERROR_MESSAGES: Record<ErrorKey, string> = {
  completion_not_approved: 'Essa conclusão não está aprovada.',
  completion_not_pending: 'Essa conclusão já foi decidida.',
  family_day_changed: 'O dia mudou. Escolha uma tarefa de hoje.',
  family_exists: 'Esta conta já tem uma família.',
  insufficient_balance: 'O saldo não cobre essa recompensa.',
  invalid_amount: 'Digite um valor diferente de zero.',
  invalid_child_ids: 'Escolha filhos desta família.',
  invalid_cost: 'O custo precisa ser maior que zero.',
  invalid_hint: 'A dica pode ter até 120 letras.',
  invalid_pin_format: 'O PIN tem 4 números.',
  invalid_points: 'Os pontos não podem ser negativos.',
  invalid_steps: 'Use no máximo 5 passos, cada um com até 60 letras.',
  invalid_task_target: 'Escolha uma rotina, ou uma data e os filhos.',
  invalid_timezone: 'Esse fuso horário não existe.',
  invalid_weekdays: 'Escolha dias da semana válidos.',
  kind_immutable: 'Um perfil não troca entre responsável e filho.',
  last_guardian: 'A família precisa de pelo menos um responsável.',
  name_required: 'Preencha o nome.',
  not_authorized: 'Digite o PIN de novo.',
  not_found: 'Não encontramos esse item. Ele pode ter sido arquivado.',
  pending_redemption_exists: 'Já tem um pedido esperando o responsável.',
  pin_not_allowed: 'Perfil de filho não tem PIN.',
  pin_required: 'O responsável precisa de um PIN.',
  reason_required: 'Escreva o motivo.',
  redemption_not_pending: 'Esse resgate já foi decidido.',
  task_not_available: 'Essa tarefa não está mais na lista de hoje.',
}

// supabase-js auth errors carry a stable `code`; these are the ones the Entrada forms can hit.
const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha errados.',
  user_already_exists: 'Já existe uma conta com esse e-mail. Entre com ela.',
  email_exists: 'Já existe uma conta com esse e-mail. Entre com ela.',
  weak_password: 'Use uma senha com pelo menos 6 caracteres.',
  email_address_invalid: 'Esse e-mail não parece válido.',
  email_not_confirmed: 'Confirme o e-mail pelo link que enviamos e depois entre.',
  over_request_rate_limit: 'Muitas tentativas. Espere um pouco e tente de novo.',
}

export const GENERIC_ERROR = 'Algo deu errado. Tente de novo.'

export function errorKeyOf(error: unknown): ErrorKey | null {
  const message = typeof error === 'object' && error !== null && 'message' in error ? error.message : null
  return ERROR_KEYS.find((key) => key === message) ?? null
}

export function errorMessage(error: unknown): string {
  const key = errorKeyOf(error)
  if (key) return ERROR_MESSAGES[key]
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  return AUTH_MESSAGES[code] ?? GENERIC_ERROR
}
