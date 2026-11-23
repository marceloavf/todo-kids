import { ChevronDown, ChevronLeft, ChevronUp, Minus, Plus } from 'lucide-react'
import { cloneElement, isValidElement, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Emoji } from '../lib/Emoji.tsx'

export const INPUT =
  'min-h-12 w-full rounded-xl border-2 border-line bg-white px-3 text-base font-semibold outline-none focus:border-ink disabled:opacity-60'
export const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-extrabold disabled:opacity-50'
export const PRIMARY = `${BUTTON} bg-ink text-white`
export const SECONDARY = `${BUTTON} border-2 border-line bg-white`
export const DANGER = `${BUTTON} border-2 border-[#f3c5c1] bg-white text-[#b3261e]`
export const ICON_BUTTON = 'grid size-12 shrink-0 place-items-center rounded-xl border-2 border-line bg-white disabled:opacity-40'
export const CARD = 'rounded-2xl border-2 border-line bg-white'

/** Native confirm: blocks until answered, works the same on Android and iPhone, and needs no state. */
export const confirmed = (message: string) => window.confirm(message)

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  const hintId = useId()
  return (
    <label className="flex flex-col gap-1 font-bold">
      <span className="flex items-baseline justify-between gap-2">
        {label}
        {hint && (
          <span id={hintId} aria-hidden className="text-sm font-semibold text-muted">
            {hint}
          </span>
        )}
      </span>
      {hint && isValidElement<{ 'aria-describedby'?: string }>(children) ? cloneElement(children, { 'aria-describedby': hintId }) : children}
    </label>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p aria-live="polite" className="font-bold text-[#b3261e] empty:hidden">
      {children}
    </p>
  )
}

export function Header({ title, back = false, children }: { title: string; back?: boolean; children?: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-2">
      {back && (
        <button onClick={() => window.history.back()} aria-label="Voltar" className={ICON_BUTTON}>
          <ChevronLeft aria-hidden />
        </button>
      )}
      <h2 className="min-w-0 flex-1 truncate text-2xl font-black">{title}</h2>
      {children}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-lg font-black">{title}</h3>
      {children}
    </section>
  )
}

/** A set of toggle chips over a fixed option list, for weekdays and children. */
export function Chips<T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: readonly { value: T; label: ReactNode }[]
  selected: readonly T[]
  onChange: (next: T[]) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((v) => v !== option.value) : [...selected, option.value])}
              className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-2 px-3 font-extrabold ${on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted'}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 font-bold">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-6 shrink-0 accent-ink" />
    </label>
  )
}

/** Integer field with − and + buttons. */
export function Stepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={ICON_BUTTON}>
          <Minus aria-hidden />
        </button>
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')))}
          className={`${INPUT} w-24 text-center text-lg tabular-nums`}
        />
        <button type="button" aria-label="Mais" onClick={() => onChange(value + 1)} className={ICON_BUTTON}>
          <Plus aria-hidden />
        </button>
      </div>
    </div>
  )
}

/**
 * The current emoji as a button that opens a grid of the curated set. `freeText` adds a field for any other emoji,
 * which the app then draws with the device font.
 */
export function EmojiPicker({
  label,
  options,
  value,
  onChange,
  freeText = false,
  allowNone = false,
}: {
  label: string
  options: readonly string[]
  value: string | null
  onChange: (emoji: string | null) => void
  freeText?: boolean
  allowNone?: boolean
}) {
  const [open, setOpen] = useState(false)
  const pick = (emoji: string | null) => {
    onChange(emoji)
    setOpen(false)
  }
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${label}: ${value ?? 'nenhum'}. Trocar`}
        onClick={() => setOpen(!open)}
        className={`${SECONDARY} w-fit px-2`}
      >
        {value ? <Emoji emoji={value} className="size-8" /> : <span className="px-1 text-muted">+ emoji</span>}
        {open ? <ChevronUp aria-hidden className="size-5" /> : <ChevronDown aria-hidden className="size-5" />}
      </button>
      {open && (
        <div className={`${CARD} flex flex-col gap-2 p-2`}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1">
            {allowNone && (
              <button type="button" onClick={() => pick(null)} className="grid size-11 place-items-center rounded-lg text-sm font-bold text-muted">
                nenhum
              </button>
            )}
            {options.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={emoji}
                aria-pressed={emoji === value}
                onClick={() => pick(emoji)}
                className={`grid size-11 place-items-center rounded-lg ${emoji === value ? 'bg-ink/10 ring-2 ring-ink' : ''}`}
              >
                <Emoji emoji={emoji} className="size-8" />
              </button>
            ))}
          </div>
          {freeText && (
            <Field label="Outro emoji">
              <input
                maxLength={8}
                placeholder="Cole um emoji"
                onChange={(e) => e.target.value.trim() && onChange(e.target.value.trim())}
                className={INPUT}
              />
            </Field>
          )}
        </div>
      )}
    </div>
  )
}

/** Up and down buttons for one item of an ordered list. */
export function MoveButtons({ name, index, count, onMove, busy = false }: { busy?: boolean; name: string; index: number; count: number; onMove: (to: number) => void }) {
  const pressed = useRef<HTMLButtonElement | null>(null)
  useLayoutEffect(() => {
    if (document.activeElement === document.body) pressed.current?.focus({ preventScroll: true })
    pressed.current = null
  }, [index])
  function move(button: HTMLButtonElement, to: number) {
    if (busy || to < 0 || to >= count) return
    pressed.current = button
    onMove(to)
  }
  return (
    <>
      <button type="button" aria-label={`Subir ${name}`} aria-disabled={busy || index === 0} onClick={event => move(event.currentTarget, index - 1)} className={`${ICON_BUTTON} aria-disabled:opacity-40`}>
        <ChevronUp aria-hidden />
      </button>
      <button type="button" aria-label={`Descer ${name}`} aria-disabled={busy || index === count - 1} onClick={event => move(event.currentTarget, index + 1)} className={`${ICON_BUTTON} aria-disabled:opacity-40`}>
        <ChevronDown aria-hidden />
      </button>
    </>
  )
}

export function moved<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}

export function Avatar({ color, avatar, size = 'size-10' }: { color: string; avatar: string; size?: string }) {
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full`} style={{ backgroundColor: color }}>
      <Emoji emoji={avatar} className="size-[65%]" />
    </span>
  )
}
