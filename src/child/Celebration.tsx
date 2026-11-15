import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useEffectEvent, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Emoji } from '../lib/Emoji.tsx'
import { useModal } from './CardDialog.tsx'
import { clearParticles, type Fx } from './fx.ts'

// Praise for what was done, never for the person.
const DAY_PHRASES = [
  'Você fez todas as tarefas de hoje.',
  'Você foi fazendo uma por uma e terminou tudo.',
  'Tudo feito! Você cuidou de cada tarefa de hoje.',
]
export const pickDayPhrase = () => DAY_PHRASES[Math.floor(Math.random() * DAY_PHRASES.length)]

/** Day complete: the one full-screen celebration. It closes only on a tap or Escape. With reduced motion it is a still message. */
export function DayCelebration({ phrase, fx, onDismiss }: { phrase: string; fx: Fx; onDismiss: () => void }) {
  const dialog = useRef<HTMLDivElement>(null)
  const opened = useRef(0)
  useModal(dialog, onDismiss)

  const celebrate = useEffectEvent(() => {
    opened.current = Date.now()
    fx.play('day')
    fx.buzz([20, 40, 20])
    fx.party()
    fx.say(`Dia completo! ${phrase}`)
  })
  useEffect(() => {
    celebrate()
    return clearParticles
  }, [])

  // Ignores the tail of the tap that caused it, so the child sees it before it can go away.
  const dismiss = () => Date.now() - opened.current > 700 && onDismiss()

  return createPortal(
    <motion.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-phrase"
      tabIndex={-1}
      onClick={dismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="pt-safe pb-safe fixed inset-0 z-50 overflow-y-auto bg-kid px-6 text-white outline-none"
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-4 py-4 text-center">
        <motion.div
          initial={{ scale: 0.9, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="grid size-44 shrink-0 place-items-center rounded-full bg-white/20 [@media(max-height:600px)]:size-28"
        >
          <Emoji emoji="🏆" className="size-32 [@media(max-height:600px)]:size-20" />
        </motion.div>
        <h2 id="celebration-title" className="text-5xl leading-tight font-black">
          Dia completo!
        </h2>
        <p id="celebration-phrase" className="text-2xl font-extrabold">
          {phrase}
        </p>
        <button className="mt-4 min-h-14 rounded-full bg-white px-8 text-xl font-black text-kid-ink">Toque para continuar</button>
      </div>
    </motion.div>,
    document.body,
  )
}

/** A short message that leaves the screen usable: guardian approvals and decided redemptions. */
export type Notice = {
  id: string
  kind: 'approval' | 'confirmed' | 'refused'
  icon: string
  title: string
  line: string
  speech: string
}

/** Shows one notice above the tab bar until it is tapped. It never takes focus; the status region announces it. */
export function NoticeToast({ notice, fx, onDismiss }: { notice: Notice | undefined; fx: Fx; onDismiss: () => void }) {
  return (
    <div role="status" className="pointer-events-none fixed inset-x-3 bottom-[calc(max(env(safe-area-inset-bottom),0.5rem)+4.5rem)] z-30">
      <AnimatePresence>{notice && <NoticeCard key={notice.id} notice={notice} fx={fx} onDismiss={onDismiss} />}</AnimatePresence>
    </div>
  )
}

function NoticeCard({ notice, fx, onDismiss }: { notice: Notice; fx: Fx; onDismiss: () => void }) {
  const announce = useEffectEvent(() => {
    if (notice.kind === 'approval') fx.play('points', 0.8)
    if (notice.kind === 'confirmed') {
      fx.play('reward')
      fx.burst()
    }
    fx.say(notice.speech)
  })
  useEffect(() => announce(), [])

  return (
    <motion.button
      onClick={onDismiss}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="pointer-events-auto mx-auto flex w-full max-w-sm items-center gap-3 rounded-3xl border-[3px] border-kid bg-white p-3 text-left shadow-xl"
    >
      <Emoji emoji={notice.icon} className="size-12 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-xl leading-tight font-black">{notice.title}</span>
        <span className="block text-lg leading-snug font-bold text-muted">{notice.line}</span>
      </span>
      <X aria-hidden className="size-6 shrink-0 text-muted" strokeWidth={3} />
    </motion.button>
  )
}
