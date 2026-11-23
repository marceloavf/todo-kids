import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/database.types.ts'
import { ONE_OFFS, REWARDS, ROUTINES, type SeedTask } from './pilot-content.ts'

const EMAIL = 'demo@todokids.local'
const PASSWORD = 'todokids-demo'
const PIN = '1234'

const CHILDREN = [
  { name: 'Lia', avatar: '🦊', color: '#f2603f', startingBalance: 60 },
  { name: 'Theo', avatar: '🦖', color: '#2f7de1', startingBalance: 35 },
]

const url = process.env.VITE_SUPABASE_URL!
const client = createClient<Database>(url, process.env.VITE_SUPABASE_ANON_KEY!, { auth: { persistSession: false } })

async function ok<R extends { data: unknown; error: { message: string } | null }>(query: PromiseLike<R>) {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as NonNullable<R['data']>
}

if ((await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })).error) {
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const created = await admin.auth.admin.createUser({ email: EMAIL, password: PASSWORD, email_confirm: true })
  if (created.error) throw created.error
  const signIn = await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (signIn.error) throw signIn.error
}

const profiles = await ok(client.from('profiles').select('*'))
const guardian =
  profiles.find((p) => p.kind === 'guardian' && !p.archived_at) ??
  (await ok(
    client.rpc('create_family', {
      p_name: 'Família Demo',
      p_timezone: 'America/Sao_Paulo',
      p_guardian_name: 'Mamãe',
      p_pin: PIN,
    }),
  ))

const session = (await ok(client.rpc('start_guardian_session', { p_profile_id: guardian.id, p_pin: PIN }))) as {
  ok: boolean
  token: string
}
if (!session.ok) throw new Error(`PIN ${PIN} was refused for the demo guardian`)
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
  `Demo family ready: ${EMAIL} / ${PASSWORD}, PIN ${PIN}.`,
  `profiles=${await count('profiles')} routines=${await count('routines')} tasks=${await count('tasks')}`,
  `rewards=${await count('rewards')} statement_entries=${await count('statement_entries')}`,
)
