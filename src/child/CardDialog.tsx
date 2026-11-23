import { X } from 'lucide-react'
import { motion, useIsPresent } from 'motion/react'
import { useEffect, useEffectEvent, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

/** The one large confirm button of a card ("Fiz!", "Quero!"). */
export const BIG_BUTTON =
  'min-h-20 w-full rounded-[28px] bg-kid text-4xl font-black text-[var(--on-kid,white)] shadow-[0_6px_0_var(--kid-ink)] transition-[opacity,transform,box-shadow] duration-200 active:translate-y-1 active:shadow-[0_2px_0_var(--kid-ink)] disabled:bg-line disabled:text-muted disabled:shadow-none'

const dialogs: HTMLElement[] = []

/**
 * A modal dialog's keyboard and focus behavior, shared by the card and the day celebration: the app behind is inert,
 * focus moves into `dialog` (give it tabIndex -1) and returns to the opener on close, Tab stays inside, Escape closes.
 */
export function useModal(dialog: RefObject<HTMLElement | null>, onEscape: () => void) {
  const escape = useEffectEvent(onEscape)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const element = dialog.current
    if (!element) return
    const root = document.getElementById('root')!
    const previous = dialogs.at(-1)
    if (previous) previous.inert = true
    dialogs.push(element)
    root.inert = true
    element.focus()

    const onKey = (event: KeyboardEvent) => {
      if (dialogs.at(-1) !== element || event.defaultPrevented) return
      if (event.key === 'Escape') {
        event.preventDefault()
        escape()
      }
      if (event.key !== 'Tab' || !dialog.current) return
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input')]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return event.preventDefault()
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const wasTop = dialogs.at(-1) === element
      dialogs.splice(dialogs.indexOf(element), 1)
      const top = dialogs.at(-1)
      if (top) top.inert = false
      root.inert = dialogs.length > 0
      if (wasTop) (opener?.isConnected ? opener : top)?.focus({ preventScroll: true })
    }
  }, [dialog])
}

// Long enough that the second tap of a double tap on the tile lands before the card accepts anything.
const ARM_DELAY_MS = 450

/**
 * The card that grows out of a tile (shared `layoutId`) and shrinks back into it on close. A modal dialog (`useModal`).
 * Nothing in it, including the backdrop, reacts until `armed`, so a double tap on a tile can't act on the card.
 * Every tap before then restarts the wait, so hammering the screen never arms it.
 */
export function CardDialog({
  layoutId,
  onClose,
  children,
}: {
  layoutId: string
  onClose: () => void
  children: (props: { armed: boolean; titleId: string }) => ReactNode
}) {
  const titleId = useId()
  // While it shrinks back into the tile, a stray tap must not close it a second time.
  const present = useIsPresent()
  const dialog = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const armedRef = useRef(false)
  const armTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function arm() {
    armedRef.current = true
    setArmed(true)
  }

  function rearmIfEarly() {
    if (armedRef.current) return
    clearTimeout(armTimer.current)
    armTimer.current = setTimeout(arm, ARM_DELAY_MS)
  }

  useModal(dialog, onClose)
  useEffect(() => {
    armTimer.current = setTimeout(arm, ARM_DELAY_MS)
    return () => clearTimeout(armTimer.current)
  }, [])

  return createPortal(
    <div
      onPointerDownCapture={rearmIfEarly}
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 ${present ? '' : 'pointer-events-none'}`}
    >
      <motion.div
        className="absolute inset-0 bg-ink/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => armedRef.current && onClose()}
      />
      <motion.div
        ref={dialog}
        layoutId={layoutId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        style={{ borderRadius: 32 }}
        className="relative flex max-h-full w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl outline-none"
      >
        <button
          onClick={() => armedRef.current && onClose()}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 grid size-12 place-items-center rounded-full bg-paper text-muted"
        >
          <X aria-hidden className="size-6" strokeWidth={3} />
        </button>
        {children({ armed, titleId })}
      </motion.div>
    </div>,
    document.body,
  )
}
