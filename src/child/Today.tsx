import { Check, Repeat } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { errorMessage } from '../lib/errors.ts'
import { Emoji } from '../lib/Emoji.tsx'
import type { TodayTask } from '../lib/parse.ts'
import { BIG_BUTTON, CardDialog } from './CardDialog.tsx'
import type { Fx } from './fx.ts'
import { speak, speechAvailable, stopSpeaking } from './speech.ts'

type Status = TodayTask['status']

const TILE_STYLE: Record<Status, string> = {
  todo: 'border-dashed border-dash bg-white',
  pending: 'border-wait bg-wait-soft',
  done: 'border-kid bg-kid-soft',
}

const rejectedText = (task: TodayTask) => task.rejected_by_name && `${task.rejected_by_name} pediu para fazer de novo`

/** "Esperando {nome} ver" when the family has a single guardian, so the name is certain. */
const waitingText = (guardianName: string | null) => (guardianName ? `Esperando ${guardianName} ver` : 'Esperando o responsável')

function statusLabel(task: TodayTask, guardianName: string | null) {
  if (task.status === 'pending') return waitingText(guardianName)
  if (task.status === 'done') return 'Feito'
  return rejectedText(task) || 'A fazer'
}

const speechText = (task: TodayTask) =>
  [
    task.name,
    rejectedText(task),
    task.rejected_by_name && task.hint && `Dica: ${task.hint}`,
    task.description,
    ...task.steps.map((step, i) => `${i + 1}: ${step.text}`),
  ]
    .map((part) => (part || '').trim().replace(/[.!?]$/, ''))
    .filter(Boolean)
    .join('. ')

/** Hoje: the picture board. Tiles keep their size; with more tasks than fit, the page scrolls. */
export function Today({
  tasks,
  openTaskId,
  guardianName,
  fx,
  online,
  tapsLocked,
  onOpen,
  onClose,
  onMark,
}: {
  tasks: TodayTask[]
  openTaskId: string | undefined
  guardianName: string | null
  fx: Fx
  online: boolean
  tapsLocked: boolean
  onOpen: (task: TodayTask) => void
  onClose: () => void
  onMark: (task: TodayTask) => Promise<void>
}) {
  const open = tasks.find((t) => t.task_id === openTaskId)

  // Every way of closing the card (button, backdrop, Escape, Android back, marking) clears the route.
  useEffect(() => {
    if (!openTaskId) stopSpeaking()
  }, [openTaskId])

  function openTile(task: TodayTask) {
    if (tapsLocked) return
    // Spoken from the tap itself, because iPhone only allows speech that starts inside a user gesture.
    // The voice replaces the open sound, so the two never play over each other.
    if (!fx.say(speechText(task))) fx.play('open', 0.8)
    onOpen(task)
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Emoji emoji="☀️" className="size-20" />
        <p className="text-2xl font-black">Nada para hoje!</p>
      </div>
    )
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-2.5 px-3 pt-1 pb-4">
        {tasks.map((task) => (
          <li key={task.task_id}>
            <Tile task={task} guardianName={guardianName} onTap={() => openTile(task)} />
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <TaskCard
            key={open.task_id}
            task={open}
            guardianName={guardianName}
            fx={fx}
            online={online}
            onClose={onClose}
            onMark={onMark}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function Tile({ task, guardianName = null, onTap }: { task: TodayTask; guardianName?: string | null; onTap: () => void }) {
  const reduced = useReducedMotionConfig()
  const badge = task.status !== 'todo' ? task.status : task.rejected_by_name ? 'again' : null
  return (
    <motion.button
      layoutId={`task-${task.task_id}`}
      data-tile={task.task_id}
      onClick={onTap}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      style={{ borderRadius: 22 }}
      aria-label={`${task.name}. ${task.points > 0 ? `${task.points} pontos. ` : ''}${statusLabel(task, guardianName)}`}
      className={`relative flex aspect-square w-full flex-col items-center justify-center gap-1 border-[3px] p-1.5 text-center ${TILE_STYLE[task.status]}`}
    >
      {task.points > 0 && (
        <span className="absolute top-1 left-2 flex items-center gap-0.5 text-[13px] font-black text-kid-ink">
          <Emoji emoji="⭐" className="size-3.5" />
          {task.points}
        </span>
      )}
      <motion.span layoutId={`task-icon-${task.task_id}`} className="mt-2.5 block">
        <Emoji emoji={task.icon} className="size-12" />
      </motion.span>
      <span className="line-clamp-2 text-[13px] leading-tight font-extrabold">{task.name}</span>
      <AnimatePresence initial={false}>
        {badge && <Badge key={badge} kind={badge} />}
      </AnimatePresence>
    </motion.button>
  )
}

/** The tile's state mark: a stamped check when done, a still hourglass while waiting, 🔁 after a "do it again". */
function Badge({ kind }: { kind: Exclude<Status, 'todo'> | 'again' }) {
  if (kind === 'done') {
    return (
      <motion.span
        aria-hidden
        initial={{ scale: 1.25, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 650, damping: 32 }}
        className="absolute -top-2 -right-2 grid size-9 place-items-center rounded-full bg-ok text-white ring-4 ring-paper"
      >
        <Check strokeWidth={4} className="size-5" />
      </motion.span>
    )
  }
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className={`absolute -top-2 -right-2 grid size-9 place-items-center rounded-full ring-4 ring-paper ${kind === 'pending' ? 'bg-wait-soft' : 'bg-kid-ink text-white'}`}
    >
      {kind === 'pending' ? <Emoji emoji="⏳" className="size-6" /> : <Repeat strokeWidth={3} className="size-5" />}
    </motion.span>
  )
}

function TaskCard({
  task,
  guardianName,
  fx,
  online,
  onClose,
  onMark,
}: {
  task: TodayTask
  guardianName: string | null
  fx: Fx
  online: boolean
  onClose: () => void
  onMark: (task: TodayTask) => Promise<void>
}) {
  return (
    <CardDialog layoutId={`task-${task.task_id}`} onClose={onClose}>
      {({ armed, titleId }) => (
        <>
          {speechAvailable && (
            <button
              onClick={() => speak(speechText(task))}
              className="absolute top-3 left-3 z-10 flex h-12 items-center gap-1.5 rounded-full bg-paper pr-4 pl-3 text-lg font-extrabold"
            >
              <Emoji emoji="🔊" className="size-6" /> Ouvir
            </button>
          )}
          <TaskCardBody task={task} titleId={titleId} />
          <div className="border-t-2 border-line p-4">
            {task.status === 'todo' ? (
              <MarkButton task={task} armed={armed} online={online} fx={fx} onMark={onMark} />
            ) : (
              <StatusNote status={task.status} points={task.points} guardianName={guardianName} />
            )}
          </div>
        </>
      )}
    </CardDialog>
  )
}

/** The card's picture, name, points, description and steps. The editor preview renders it too. */
export function TaskCardBody({ task, titleId }: { task: TodayTask; titleId?: string }) {
  return (
    <div className="overflow-y-auto px-6 pt-6 pb-4">
      <motion.div layoutId={`task-icon-${task.task_id}`} className="mx-auto w-fit">
        <Emoji emoji={task.icon} className="size-28 [@media(max-height:700px)]:size-20" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ delay: 0.12 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h2 id={titleId} className="mt-2 text-3xl leading-tight font-black">
          {task.name}
        </h2>
        {task.points > 0 && (
          <p className="flex items-center gap-1.5 rounded-full bg-kid-soft px-3 py-1 text-lg font-black text-kid-ink">
            <Emoji emoji="⭐" className="size-5" /> {task.points} pontos
          </p>
        )}
        {task.rejected_by_name && (
          <div className="w-full rounded-2xl bg-kid-soft px-4 py-3 text-left">
            <p className="flex items-center gap-2 text-lg leading-snug font-black text-kid-ink">
              <Repeat aria-hidden strokeWidth={3} className="size-5 shrink-0" /> {rejectedText(task)}.
            </p>
            {task.hint && <p className="mt-1 text-lg leading-snug font-bold">Dica: {task.hint}</p>}
          </div>
        )}
        {task.description && <p className="text-lg font-semibold text-muted">{task.description}</p>}
        {task.steps.length > 0 && (
          <ol className="flex w-full flex-col gap-2 text-left">
            {task.steps.map((step, i) => (
              <li key={i} className="flex min-h-12 items-center gap-3 rounded-2xl bg-paper px-3 py-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-base font-black">
                  {i + 1}
                </span>
                <span className="flex-1 text-lg leading-snug font-bold">{step.text}</span>
                {step.emoji && <Emoji emoji={step.emoji} className="size-8 shrink-0" />}
              </li>
            ))}
          </ol>
        )}
      </motion.div>
    </div>
  )
}

function MarkButton({
  task,
  armed,
  online,
  fx,
  onMark,
}: {
  task: TodayTask
  armed: boolean
  online: boolean
  fx: Fx
  onMark: (task: TodayTask) => Promise<void>
}) {
  const inFlight = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Click, not pointerdown: a scroll that starts on the button never becomes a click.
  async function confirm() {
    if (!armed || !online || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError(null)
    try {
      await onMark(task)
    } catch (caught) {
      inFlight.current = false
      setBusy(false)
      setError(errorMessage(caught))
      fx.play('error')
    }
  }

  return (
    <>
      <p aria-live="polite" className="mb-2 text-center font-bold text-[#b3261e] empty:hidden">
        {!online ? 'Sem internet. Tente quando a conexão voltar.' : error}
      </p>
      <button
        onClick={confirm}
        disabled={busy || !online}
        aria-disabled={!armed}
        className={`${BIG_BUTTON} ${armed ? '' : 'opacity-70'}`}
      >
        {busy ? '…' : 'Fiz!'}
      </button>
      {task.requires_approval && (
        <p className="mt-2 text-center font-bold text-muted">Um responsável vai conferir.</p>
      )}
    </>
  )
}

function StatusNote({ status, points, guardianName }: { status: Exclude<Status, 'todo'>; points: number; guardianName: string | null }) {
  return status === 'done' ? (
    <p className="flex min-h-20 items-center justify-center gap-3 text-2xl font-black text-ok">
      <span className="grid size-11 -rotate-10 place-items-center rounded-full bg-ok text-white">
        <Check strokeWidth={4} className="size-6" />
      </span>
      {points > 0 ? `Feito! +${points}` : 'Feito!'}
    </p>
  ) : (
    <div className="flex min-h-20 flex-col items-center justify-center text-center">
      <p className="flex items-center gap-2 text-2xl font-black text-wait">
        <Emoji emoji="⏳" className="size-8" /> {waitingText(guardianName)}
      </p>
      {points > 0 && <p className="font-bold text-muted">Os pontos chegam depois da aprovação.</p>}
    </div>
  )
}
