import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/database.types.ts'
import { ONE_OFFS, REWARDS, ROUTINES, type SeedTask } from './pilot-content.ts'

const CHILDREN = [
  { name: 'Lia', avatar: '🦊', color: '#f2603f', startingBalance: 60 },
  { name: 'Theo', avatar: '🦖', color: '#2f7de1', startingBalance: 35 },
]

function required(key: string) {
  const value = process.env[key]
  if (!value?.trim()) throw new Error(`Missing ${key}`)
  return value
}

const hosted = process.argv.includes('--hosted')
const url = new URL(required(hosted ? 'SUPABASE_URL' : 'VITE_SUPABASE_URL'))
const key = required(hosted ? 'SUPABASE_PUBLISHABLE_KEY' : 'VITE_SUPABASE_ANON_KEY')
if (hosted) {
  if (url.protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS')
  if (!key.startsWith('sb_publishable_')) throw new Error('Use a Supabase publishable key for hosted seeding')
} else if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
  throw new Error('npm run seed targets local Supabase. Use the hosted seed workflow for a hosted project.')
}

const email = hosted ? required('SEED_GUARDIAN_EMAIL') : 'demo@todokids.local'
const password = hosted ? required('SEED_GUARDIAN_PASSWORD') : 'todokids-demo'
const pin = hosted ? required('SEED_GUARDIAN_PIN') : '1234'
if (!/^\d{4}$/.test(pin)) throw new Error('SEED_GUARDIAN_PIN must be four digits')

const auth = { persistSession: false, autoRefreshToken: false }
const client = createClient<Database>(url.origin, key, { auth })

async function ok<R extends { data: unknown; error: { message: string } | null }>(query: PromiseLike<R>) {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as NonNullable<R['data']>
}

let signIn = await client.auth.signInWithPassword({ email, password })
if (!hosted && signIn.error?.code === 'invalid_credentials') {
  const admin = createClient(url.origin, required('SUPABASE_SERVICE_ROLE_KEY'), { auth })
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error) throw created.error
  signIn = await client.auth.signInWithPassword({ email, password })
}
if (signIn.error) throw new Error(`Seed guardian sign-in failed (${signIn.error.code ?? 'unknown error'})`)

const profiles = await ok(client.from('profiles').select('*'))
const guardian =
  profiles.find((p) => p.kind === 'guardian' && !p.archived_at) ??
  (await ok(
    client.rpc('create_family', {
      p_name: 'Família Demo',
      p_timezone: 'America/Sao_Paulo',
      p_guardian_name: 'Mamãe',
      p_pin: pin,
    }),
  ))

const session = (await ok(client.rpc('start_guardian_session', { p_profile_id: guardian.id, p_pin: pin }))) as {
  ok: boolean
  token: string
}
if (!session.ok) throw new Error('The seed guardian PIN was refused')
const token = session.token

const childIds: string[] = []
for (const child of CHILDREN) {
  const saved = await ok(
    client.rpc('save_profile', {
      p_token: token,
      p_id: profiles.find((p) => p.kind === 'child' && p.name === child.name)?.id,
      p_kind: 'child',
      p_name: child.name,
      p_color: child.color,
      p_avatar: child.avatar,
      p_read_aloud: false,
      p_sounds: true,
      p_reduced_motion: false,
    }),
  )
  childIds.push(saved.id)
}

const routines = await ok(client.from('routines').select('*'))
const tasks = await ok(client.from('tasks').select('*'))

function saveTask(task: SeedTask, target: { p_routine_id: string } | { p_one_off_date: string; p_child_ids: string[] }) {
  const routineId = 'p_routine_id' in target ? target.p_routine_id : null
  const date = 'p_one_off_date' in target ? target.p_one_off_date : null
  return ok(
    client.rpc('save_task', {
      p_token: token,
      p_id: tasks.find((t) => t.routine_id === routineId && t.one_off_date === date && t.name === task.name)?.id,
      p_name: task.name,
      p_icon: task.icon,
      p_description: task.description,
      p_steps: task.steps,
      p_points: task.points,
      p_requires_approval: task.requiresApproval ?? false,
      ...target,
    }),
  )
}

for (const routine of ROUTINES) {
  const saved = await ok(
    client.rpc('save_routine', {
      p_token: token,
      p_id: routines.find((r) => r.name === routine.name)?.id,
      p_name: routine.name,
      p_weekdays: routine.weekdays,
      p_child_ids: childIds,
    }),
  )
  for (const task of routine.tasks) await saveTask(task, { p_routine_id: saved.id })
}

// The server owns "today", so the one-off date comes from it and not from this machine's clock.
const today = (await ok(client.rpc('today_tasks')))[0]!.day
for (const { daysFromToday, task } of ONE_OFFS) {
  const date = new Date(today + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  await saveTask(task, { p_one_off_date: date.toISOString().slice(0, 10), p_child_ids: childIds })
}

const rewards = await ok(client.from('rewards').select('*'))
for (const reward of REWARDS) {
  await ok(
    client.rpc('save_reward', {
      p_token: token,
      p_id: rewards.find((r) => r.name === reward.name)?.id,
      p_name: reward.name,
      p_icon: reward.icon,
      p_cost: reward.cost,
    }),
  )
}

for (const [i, child] of CHILDREN.entries()) {
  const entries = await ok(client.from('statement_entries').select('id').eq('child_id', childIds[i]!).limit(1))
  if (entries.length === 0) {
    await ok(
      client.rpc('adjust_points', {
        p_token: token,
        p_child_id: childIds[i]!,
        p_amount: child.startingBalance,
        p_reason: 'Saldo inicial',
      }),
    )
  }
}

await ok(client.rpc('end_guardian_session', { p_token: token }))

const count = async (table: 'profiles' | 'routines' | 'tasks' | 'rewards' | 'statement_entries') =>
  (await client.from(table).select('id', { count: 'exact', head: true })).count
console.log(
  'Demo family ready.',
  `profiles=${await count('profiles')} routines=${await count('routines')} tasks=${await count('tasks')}`,
  `rewards=${await count('rewards')} statement_entries=${await count('statement_entries')}`,
)
