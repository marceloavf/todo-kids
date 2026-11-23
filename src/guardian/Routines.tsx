import { Archive, ChevronRight, Pencil, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Emoji } from '../lib/Emoji.tsx'
import { useProfiles } from '../lib/queries.ts'
import { navigate } from '../lib/route.ts'
import { useGuardian } from '../lib/session.tsx'
import { useAction, useFamilyToday, useRoutines, useRoutineTasks, useUpcomingOneOffs, type Routine, type Task } from './data.ts'
import { dayLabel, WEEKDAYS } from './dates.ts'
import { CARD, Chips, confirmed, DANGER, ErrorText, Field, Header, ICON_BUTTON, INPUT, moved, MoveButtons, PRIMARY, Section, SECONDARY } from './ui.tsx'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export function weekdaysText(days: readonly number[]): string {
  if (days.length === 7) return 'Todos os dias'
  if (days.length === 0) return 'Nenhum dia'
  return ALL_DAYS.filter((d) => days.includes(d)).map((d) => WEEKDAYS[d]).join(' ')
}

function useChildNames() {
  const { data: profiles = [] } = useProfiles()
  const children = profiles.filter((p) => p.kind === 'child')
  return { children, names: (ids: readonly string[] | null) => children.filter((c) => ids?.includes(c.id)).map((c) => c.name).join(', ') || 'Nenhum filho' }
}

/** Rotinas tab: the routines in order, then the upcoming Tarefas avulsas. */
export function Routines() {
  const { callGuardian } = useGuardian()
  const { data: routines = [], isPending } = useRoutines()
  const { names } = useChildNames()
  const action = useAction()

  const [announcement, announce] = useState('')
  const move = (from: number, to: number) =>
    action.mutate(() => callGuardian('set_routine_order', { p_ids: moved(routines, from, to).map((r) => r.id) }), { onSuccess: () => announce(`${routines[from].name}, posição ${to + 1}.`) })

  return (
    <>
      <Header title="Rotinas">
        <button onClick={() => navigate('responsavel/rotinas/nova')} className={PRIMARY}>
          <Plus aria-hidden className="size-5" /> Nova
        </button>
      </Header>
      {routines.length > 1 && <p className="text-sm font-semibold text-muted">Use as setas para escolher a ordem das rotinas na tela Hoje.</p>}
      <ErrorText>{action.errorText}</ErrorText>
      {!isPending && routines.length === 0 && <p className={`${CARD} p-4 font-semibold text-muted`}>Nenhuma rotina ainda.</p>}
      <p role="status" className="sr-only">{announcement}</p>
      <ul className="flex flex-col gap-2">
        {routines.map((routine, i) => (
          <li key={routine.id} className={`${CARD} flex items-center gap-2 p-2`}>
            <button onClick={() => navigate(`responsavel/rotinas/${routine.id}`)} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 p-1 text-left">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-black">{routine.name}</span>
                <span className="block text-sm font-bold text-muted">{weekdaysText(routine.weekdays)}</span>
                <span className="block truncate text-sm font-semibold text-muted">{names(routine.child_ids)}</span>
              </span>
              <ChevronRight aria-hidden className="shrink-0 text-muted" />
            </button>
            <MoveButtons busy={action.isPending} name={routine.name} index={i} count={routines.length} onMove={(to) => move(i, to)} />
          </li>
        ))}
      </ul>
      <OneOffs />
    </>
  )
}

function OneOffs() {
  const today = useFamilyToday()
  const { data: tasks = [], isPending } = useUpcomingOneOffs(today)
  const { names } = useChildNames()
  const action = useAction()

  return (
    <Section title="Tarefas avulsas">
      <button onClick={() => navigate('responsavel/rotinas/avulsa/nova')} className={`${SECONDARY} w-full`}>
        <Plus aria-hidden className="size-5" /> Nova tarefa avulsa
      </button>
      <ErrorText>{action.errorText}</ErrorText>
      {!isPending && tasks.length === 0 && <p className="font-semibold text-muted">Nenhuma tarefa avulsa de hoje em diante.</p>}
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className={`${CARD} flex items-center gap-2 p-2`}>
            <button onClick={() => navigate(`responsavel/rotinas/avulsa/${task.id}`)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 p-1 text-left">
              <Emoji emoji={task.icon} className="size-9 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-black">{task.name}</span>
                <span className="block truncate text-sm font-bold text-muted">
                  {today && task.one_off_date ? dayLabel(task.one_off_date, today) : ''} · {names(task.child_ids)}
                </span>
              </span>
            </button>
            <ArchiveTaskButton task={task} action={action} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

function ArchiveTaskButton({ task, action }: { task: Task; action: ReturnType<typeof useAction> }) {
  const { callGuardian } = useGuardian()
  return (
    <button
      aria-label={`Arquivar ${task.name}`}
      disabled={action.isPending}
      onClick={() =>
        confirmed(`Arquivar a tarefa "${task.name}"? Ela sai da lista dos filhos. As conclusões já feitas continuam no extrato.`) &&
        action.mutate(() => callGuardian('archive_task', { p_id: task.id }))
      }
      className={`${ICON_BUTTON} text-[#b3261e]`}
    >
      <Archive aria-hidden className="size-5" />
    </button>
  )
}

/** One routine: its tasks in order, with reorder, edit and archive. */
export function RoutineDetail({ id }: { id: string }) {
  const { callGuardian } = useGuardian()
  const { data: routines, isPending } = useRoutines()
  const { data: tasks = [] } = useRoutineTasks(id)
  const { names } = useChildNames()
  const action = useAction()
  const routine = routines?.find((r) => r.id === id)

  const [announcement, announce] = useState('')
  if (isPending) return null
  if (!routine) return <Header title="Rotina não encontrada" back />

  const move = (from: number, to: number) =>
    action.mutate(() => callGuardian('set_task_order', { p_routine_id: id, p_task_ids: moved(tasks, from, to).map((t) => t.id) }), { onSuccess: () => announce(`${tasks[from].name}, posição ${to + 1}.`) })

  return (
    <>
      <Header title={routine.name} back>
        <button onClick={() => navigate(`responsavel/rotinas/${id}/editar`)} aria-label="Editar rotina" className={ICON_BUTTON}>
          <Pencil aria-hidden className="size-5" />
        </button>
      </Header>
      <p className="-mt-3 font-bold text-muted">
        {weekdaysText(routine.weekdays)} · {names(routine.child_ids)}
      </p>
      <p className="text-sm font-semibold text-muted">
        Use as setas para escolher o que vem primeiro. Na tela Hoje, seu filho vê as tarefas nesta ordem.
      </p>
      <button onClick={() => navigate(`responsavel/rotinas/${id}/tarefa/nova`)} className={`${PRIMARY} w-full`}>
        <Plus aria-hidden className="size-5" /> Nova tarefa
      </button>
      <ErrorText>{action.errorText}</ErrorText>
      <p role="status" className="sr-only">{announcement}</p>
      {tasks.length === 0 && <p className={`${CARD} p-4 font-semibold text-muted`}>Nenhuma tarefa nesta rotina.</p>}
      <ul className="flex flex-col gap-2">
        {tasks.map((task, i) => (
          <li key={task.id} className={`${CARD} flex items-center gap-1.5 p-2`}>
            <button onClick={() => navigate(`responsavel/rotinas/${id}/tarefa/${task.id}`)} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left">
              <Emoji emoji={task.icon} className="size-9 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-black">{task.name}</span>
                <span className="block text-sm font-bold text-muted">
                  {task.points} pts{task.requires_approval ? ' · aprovação' : ''}
                </span>
              </span>
            </button>
            <MoveButtons busy={action.isPending} name={task.name} index={i} count={tasks.length} onMove={(to) => move(i, to)} />
            <ArchiveTaskButton task={task} action={action} />
          </li>
        ))}
      </ul>
      <button
        disabled={action.isPending}
        onClick={() =>
          confirmed(`Arquivar a rotina "${routine.name}"? As tarefas dela saem da lista dos filhos.`) &&
          action.mutate(async () => {
            await callGuardian('archive_routine', { p_id: id })
            window.history.back()
          })
        }
        className={`${DANGER} mt-4 w-full`}
      >
        <Archive aria-hidden className="size-5" /> Arquivar rotina
      </button>
    </>
  )
}

export function RoutineEditor({ id }: { id?: string }) {
  const { data: routines, isPending } = useRoutines()
  const { isPending: profilesPending } = useProfiles()
  // The form's initial state reads both lists, so it waits for them.
  if ((id && isPending) || profilesPending) return null
  const routine = id ? routines?.find((r) => r.id === id) : undefined
  if (id && !routine) return <Header title="Rotina não encontrada" back />
  return <RoutineForm routine={routine} />
}

function RoutineForm({ routine }: { routine?: Routine }) {
  const { callGuardian } = useGuardian()
  const { children } = useChildNames()
  const action = useAction()
  const [name, setName] = useState(routine?.name ?? '')
  const [weekdays, setWeekdays] = useState<number[]>(routine?.weekdays ?? ALL_DAYS)
  const [childIds, setChildIds] = useState<string[]>(routine?.child_ids ?? children.map((c) => c.id))

  function submit(event: FormEvent) {
    event.preventDefault()
    action.mutate(
      () =>
        callGuardian('save_routine', {
          p_id: routine?.id,
          p_name: name,
          p_weekdays: ALL_DAYS.filter((d) => weekdays.includes(d)),
          p_child_ids: childIds,
        }),
      { onSuccess: () => window.history.back() },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Header title={routine ? 'Editar rotina' : 'Nova rotina'} back />
      <Field label="Nome">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} className={INPUT} />
      </Field>
      <Chips label="Dias da semana" options={ALL_DAYS.map((d) => ({ value: d, label: WEEKDAYS[d] }))} selected={weekdays} onChange={setWeekdays} />
      <Chips label="Filhos" options={children.map((c) => ({ value: c.id, label: c.name }))} selected={childIds} onChange={setChildIds} />
      <ErrorText>{action.errorText}</ErrorText>
      <button type="submit" disabled={action.isPending} className={PRIMARY}>
        Salvar rotina
      </button>
    </form>
  )
}
