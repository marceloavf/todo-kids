import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { TaskCardBody, Tile } from '../child/Today.tsx'
import { EMOJI } from '../lib/Emoji.tsx'
import { parseSteps, type Step, type TodayTask } from '../lib/parse.ts'
import { useProfiles } from '../lib/queries.ts'
import { useGuardian } from '../lib/session.tsx'
import { useAction, useFamilyToday, useTask, type Task } from './data.ts'
import {
  CARD,
  Chips,
  EmojiPicker,
  ErrorText,
  Field,
  Header,
  ICON_BUTTON,
  INPUT,
  moved,
  MoveButtons,
  PRIMARY,
  SECONDARY,
  Section,
  Stepper,
  Toggle,
} from './ui.tsx'

const MAX_STEPS = 5
const STEP_MAX_CHARS = 60

type EditableStep = Step & { key: string }

/** Edits a routine task (`routineId`) or a Tarefa avulsa (no `routineId`). Without `taskId` it creates one. */
export function TaskEditor({ routineId, taskId }: { routineId?: string; taskId?: string }) {
  const today = useFamilyToday()
  const { isPending: profilesPending } = useProfiles()
  const { data: task, isPending, isError } = useTask(taskId)
  if (!today || profilesPending || (taskId && isPending)) return null
  if (taskId && isError) return <Header title="Tarefa não encontrada" back />
  return <TaskForm routineId={routineId} task={taskId ? task : undefined} today={today} />
}

function TaskForm({ routineId, task, today }: { routineId?: string; task?: Task; today: string }) {
  const { callGuardian } = useGuardian()
  const { data: profiles = [] } = useProfiles()
  const children = profiles.filter((p) => p.kind === 'child')
  const action = useAction()
  const oneOff = !routineId
  const [name, setName] = useState(task?.name ?? '')
  const [icon, setIcon] = useState(task?.icon ?? EMOJI.tasks[0])
  const [points, setPoints] = useState(task?.points ?? 5)
  const [requiresApproval, setRequiresApproval] = useState(task?.requires_approval ?? false)
  const [description, setDescription] = useState(task?.description ?? '')
  const [steps, setSteps] = useState<EditableStep[]>(() =>
    (task ? parseSteps(task.steps) : []).map((step) => ({ ...step, key: crypto.randomUUID() })),
  )
  const [date, setDate] = useState(task?.one_off_date ?? today)
  const [childIds, setChildIds] = useState<string[]>(task?.child_ids ?? children.map((c) => c.id))

  const setStep = (key: string, change: Partial<Step>) => setSteps(steps.map((s) => (s.key === key ? { ...s, ...change } : s)))
  const savedSteps = steps.map(({ text, emoji }) => ({ text: text.trim(), emoji })).filter((s) => s.text !== '')

  function submit(event: FormEvent) {
    event.preventDefault()
    action.mutate(
      () =>
        callGuardian('save_task', {
          p_id: task?.id,
          p_name: name,
          p_icon: icon,
          p_description: description.trim(),
          // `emoji: null` stays in the JSON: the server rejects a step without the key.
          p_steps: savedSteps,
          p_points: points,
          p_requires_approval: requiresApproval,
          ...(oneOff ? { p_one_off_date: date, p_child_ids: childIds } : { p_routine_id: routineId }),
        }),
      { onSuccess: () => window.history.back() },
    )
  }

  const preview: TodayTask = {
    child_id: '',
    day: today,
    task_id: 'preview',
    name: name.trim() || 'Nome da tarefa',
    icon,
    description: description.trim(),
    steps: savedSteps,
    points,
    requires_approval: requiresApproval,
    position: 0,
    routine_id: null,
    routine_name: null,
    routine_position: null,
    status: 'todo',
    completion_id: null,
    rejected_by_name: null,
    hint: null,
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Header title={task ? 'Editar tarefa' : oneOff ? 'Nova tarefa avulsa' : 'Nova tarefa'} back />
      <Field label="Nome" hint="2 ou 3 palavras">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} className={INPUT} />
      </Field>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Ícone</span>
        <EmojiPicker label="Ícone" options={EMOJI.tasks} value={icon} onChange={(e) => e && setIcon(e)} freeText />
      </div>
      <div>
        <Stepper label="Pontos" value={points} min={0} onChange={setPoints} />
        <p className="text-sm font-semibold text-muted">Quando a tarefa virar hábito, ela pode valer 0 pontos e continua comemorada.</p>
      </div>
      <div>
        <Toggle label="Exige aprovação" checked={requiresApproval} onChange={setRequiresApproval} />
        <p className="text-sm font-semibold text-muted">Para filhos pequenos, use aprovação em poucas tarefas e decida no mesmo dia.</p>
      </div>
      <Field label="Descrição curta" hint={`${description.length}/80`}>
        <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={80} className={INPUT} />
      </Field>
      {oneOff && (
        <>
          <Field label="Data">
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required className={INPUT} />
          </Field>
          <Chips label="Filhos" options={children.map((c) => ({ value: c.id, label: c.name }))} selected={childIds} onChange={setChildIds} />
        </>
      )}

      <Section title={`Passos (${steps.length}/${MAX_STEPS})`}>
        <ol className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <li key={step.key} className={`${CARD} flex flex-col gap-2 p-2`}>
              <Field label={`Passo ${i + 1}`} hint={`${step.text.length}/${STEP_MAX_CHARS}`}>
                <input
                  value={step.text}
                  onChange={(e) => setStep(step.key, { text: e.target.value })}
                  maxLength={STEP_MAX_CHARS}
                  className={INPUT}
                />
              </Field>
              <div className="flex flex-wrap items-start gap-1.5">
                <div className="mr-auto">
                  <EmojiPicker label={`Emoji do passo ${i + 1}`} options={EMOJI.tasks} value={step.emoji} onChange={(emoji) => setStep(step.key, { emoji })} allowNone />
                </div>
                <MoveButtons name={`passo ${i + 1}`} index={i} count={steps.length} onMove={(to) => setSteps(moved(steps, i, to))} />
                <button type="button" aria-label={`Remover passo ${i + 1}`} onClick={() => setSteps(steps.filter((s) => s.key !== step.key))} className={`${ICON_BUTTON} text-[#b3261e]`}>
                  <Trash2 aria-hidden className="size-5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
        {steps.length < MAX_STEPS && (
          <button type="button" onClick={() => setSteps([...steps, { key: crypto.randomUUID(), text: '', emoji: null }])} className={SECONDARY}>
            <Plus aria-hidden className="size-5" /> Adicionar passo
          </button>
        )}
      </Section>

      <Section title="Como o filho vê">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-paper p-3" aria-hidden inert>
          <div className="w-28">
            <Tile task={{ ...preview, task_id: 'preview-tile' }} onTap={() => {}} />
          </div>
          <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-md">
            <TaskCardBody task={{ ...preview, task_id: 'preview-card' }} />
          </div>
        </div>
      </Section>

      <ErrorText>{action.errorText}</ErrorText>
      <button type="submit" disabled={action.isPending} className={PRIMARY}>
        Salvar tarefa
      </button>
    </form>
  )
}
