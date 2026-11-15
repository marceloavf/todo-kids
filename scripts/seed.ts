import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/database.types.ts'

const EMAIL = 'demo@todokids.local'
const PASSWORD = 'todokids-demo'
const PIN = '1234'
const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

const CHILDREN = [
  { name: 'Lia', avatar: '🦊', color: '#f2603f', startingBalance: 60 },
  { name: 'Theo', avatar: '🦖', color: '#2f7de1', startingBalance: 35 },
]

type SeedTask = {
  name: string
  icon: string
  description: string
  steps: { text: string; emoji: string | null }[]
  points: number
  requiresApproval?: boolean
}

const ROUTINES: { name: string; tasks: SeedTask[] }[] = [
  {
    name: 'Manhã',
    tasks: [
      {
        name: 'Arrumar a cama',
        icon: '🛏️',
        description: 'Deixe a cama pronta para a noite.',
        steps: [
          { text: 'Estique o lençol', emoji: '🛏️' },
          { text: 'Puxe o cobertor até em cima', emoji: null },
          { text: 'Ponha o travesseiro no lugar', emoji: '💤' },
        ],
        points: 5,
      },
      {
        name: 'Escovar os dentes',
        icon: '🪥',
        description: 'Dentes limpos antes de sair.',
        steps: [
          { text: 'Ponha pasta na escova', emoji: '🪥' },
          { text: 'Escove todos os dentes', emoji: '🦷' },
          { text: 'Enxágue a boca', emoji: '🚰' },
        ],
        points: 5,
      },
      {
        name: 'Vestir a roupa',
        icon: '👕',
        description: 'Troque o pijama pela roupa do dia.',
        steps: [
          { text: 'Tire o pijama', emoji: null },
          { text: 'Vista a roupa separada', emoji: '👕' },
          { text: 'Guarde o pijama', emoji: '🧺' },
        ],
        points: 5,
      },
      {
        name: 'Tomar café da manhã',
        icon: '🥣',
        description: 'Coma à mesa e leve a louça para a pia.',
        steps: [
          { text: 'Sente à mesa', emoji: '🪑' },
          { text: 'Leve o prato para a pia', emoji: '🍽️' },
        ],
        points: 10,
      },
    ],
  },
  {
    name: 'Depois da escola',
    tasks: [
      {
        name: 'Guardar a mochila',
        icon: '🎒',
        description: 'A mochila fica no lugar dela.',
        steps: [
          { text: 'Tire a lancheira', emoji: '🍱' },
          { text: 'Pendure a mochila', emoji: '🎒' },
        ],
        points: 5,
      },
      {
        name: 'Fazer a lição',
        icon: '📚',
        description: 'Faça a lição de casa e mostre para um adulto.',
        steps: [
          { text: 'Abra a agenda', emoji: '📒' },
          { text: 'Faça os exercícios', emoji: '✏️' },
          { text: 'Mostre para um adulto', emoji: '👀' },
        ],
        points: 20,
        requiresApproval: true,
      },
      {
        name: 'Guardar os brinquedos',
        icon: '🧸',
        description: 'Cada brinquedo volta para a caixa.',
        steps: [
          { text: 'Junte os brinquedos do chão', emoji: '🧸' },
          { text: 'Ponha tudo na caixa', emoji: '📦' },
        ],
        points: 10,
        requiresApproval: true,
      },
      {
        name: 'Dar comida ao cachorro',
        icon: '🐶',
        description: 'O pote do cachorro fica cheio.',
        steps: [
          { text: 'Pegue a ração', emoji: '🥫' },
          { text: 'Encha o pote', emoji: '🥣' },
          { text: 'Troque a água', emoji: '💧' },
        ],
        points: 10,
      },
    ],
  },
]

const ONE_OFF: SeedTask = {
  name: 'Levar o lixo para fora',
  icon: '🗑️',
  description: 'Hoje passa o caminhão do lixo.',
  steps: [
    { text: 'Feche o saco', emoji: '🗑️' },
    { text: 'Leve até a lixeira da rua', emoji: '🚛' },
  ],
  points: 15,
}

const REWARDS = [
  { name: 'Sorvete', icon: '🍦', cost: 50 },
  { name: '30 minutos de videogame', icon: '🎮', cost: 80 },
  { name: 'Cinema em casa', icon: '🎬', cost: 100 },
  { name: 'Passeio no parque', icon: '🛝', cost: 150 },
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
  return ok(
    client.rpc('save_task', {
      p_token: token,
      p_id: tasks.find((t) => t.routine_id === routineId && t.name === task.name)?.id,
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
      p_weekdays: ALL_WEEKDAYS,
      p_child_ids: childIds,
    }),
  )
  for (const task of routine.tasks) await saveTask(task, { p_routine_id: saved.id })
}

// The server owns "today", so the one-off date comes from it and not from this machine's clock.
const today = (await ok(client.rpc('today_tasks')))[0]!.day
await saveTask(ONE_OFF, { p_one_off_date: today, p_child_ids: childIds })

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
