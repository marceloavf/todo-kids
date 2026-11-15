import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '../../src/database.types.ts'

process.loadEnvFile('.env.local')

export const url = process.env.VITE_SUPABASE_URL!
export const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!

export type Client = SupabaseClient<Database>
export type Family = Awaited<ReturnType<typeof createFamily>>
type Response = { data: unknown; error: { message: string; code?: string } | null }

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
export const PIN = '1234'

const admin = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } })

export function anonClient(): Client {
  return createClient<Database>(url, anonKey, { auth: { persistSession: false } })
}

export async function ok<R extends Response>(query: PromiseLike<R>): Promise<NonNullable<R['data']>> {
  const { data, error } = await query
  if (error) throw new Error(`${error.code}: ${error.message}`)
  return data as NonNullable<R['data']>
}

export async function failure(query: PromiseLike<Response>) {
  const { error } = await query
  if (!error) throw new Error('expected the call to fail')
  return error
}

export async function errorKey(query: PromiseLike<Response>) {
  return (await failure(query)).message
}

// The app can't reach the private schema, so clock-dependent rows are aged straight in Postgres.
export function sql(statement: string) {
  execFileSync('docker', ['exec', 'supabase_db_todo-kids', 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', statement])
}

export async function signedInClient(): Promise<Client> {
  const email = `test-${randomUUID()}@todokids.local`
  const password = randomUUID()
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  const client = anonClient()
  const signIn = await client.auth.signInWithPassword({ email, password })
  if (signIn.error) throw signIn.error
  return client
}

export async function startSession(client: Client, profileId: string, pin: string) {
  const session = await ok(client.rpc('start_guardian_session', { p_profile_id: profileId, p_pin: pin }))
  return session as { ok: boolean; token: string | null; attempts_left: number; locked_until: string | null }
}

export async function createFamily(timezone = 'America/Sao_Paulo') {
  const client = await signedInClient()
  const guardian = await ok(
    client.rpc('create_family', { p_name: 'Família Teste', p_timezone: timezone, p_guardian_name: 'Mamãe', p_pin: PIN }),
  )
  const { token } = await startSession(client, guardian.id, PIN)
  return { client, guardian, token: token! }
}

export function addChild(f: Family, name = 'Lia') {
  return ok(
    f.client.rpc('save_profile', {
      p_token: f.token,
      p_kind: 'child',
      p_name: name,
      p_color: '#f2603f',
      p_avatar: '🦊',
      p_read_aloud: false,
      p_sounds: true,
      p_reduced_motion: false,
    }),
  )
}

export function addRoutine(f: Family, childIds: string[], weekdays = ALL_WEEKDAYS) {
  return ok(
    f.client.rpc('save_routine', { p_token: f.token, p_name: 'Manhã', p_weekdays: weekdays, p_child_ids: childIds }),
  )
}

type TaskInput = {
  name?: string
  points?: number
  requiresApproval?: boolean
  steps?: Json
  id?: string
  routineId?: string
  oneOffDate?: string
  childIds?: string[]
}

export function saveTask(f: Family, input: TaskInput) {
  return f.client.rpc('save_task', {
    p_token: f.token,
    p_name: input.name ?? 'Arrumar a cama',
    p_icon: '🛏️',
    p_description: 'Deixe a cama arrumada.',
    p_steps: input.steps ?? [{ text: 'Estique o lençol', emoji: '🛏️' }],
    p_points: input.points ?? 10,
    p_requires_approval: input.requiresApproval ?? false,
    p_id: input.id,
    p_routine_id: input.routineId,
    p_one_off_date: input.oneOffDate,
    p_child_ids: input.childIds,
  })
}

export async function familyWithTask(task: Omit<TaskInput, 'routineId'> = {}, timezone?: string) {
  const f = await createFamily(timezone)
  const child = await addChild(f)
  const routine = await addRoutine(f, [child.id])
  const created = await ok(saveTask(f, { ...task, routineId: routine.id }))
  return { f, child, routine, task: created }
}

export function complete(f: Family, taskId: string, childId: string) {
  return f.client.rpc('complete_task', { p_task_id: taskId, p_child_id: childId })
}

export function adjust(f: Family, childId: string, amount: number, reason = 'Ajuste de teste') {
  return f.client.rpc('adjust_points', { p_token: f.token, p_child_id: childId, p_amount: amount, p_reason: reason })
}

export async function balance(f: Family, childId: string) {
  const profile = await ok(f.client.from('profiles').select('balance').eq('id', childId).single())
  return profile.balance
}

export function statement(f: Family, childId: string) {
  return ok(f.client.from('statement_entries').select('*').eq('child_id', childId))
}

export async function todayTask(f: Family, taskId: string, childId: string) {
  const rows = await ok(f.client.rpc('today_tasks'))
  return rows.find((row) => row.task_id === taskId && row.child_id === childId)
}
