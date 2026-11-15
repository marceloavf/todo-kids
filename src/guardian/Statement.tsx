import { Undo2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Emoji } from '../lib/Emoji.tsx'
import { useFamily, useProfiles } from '../lib/queries.ts'
import { navigate } from '../lib/route.ts'
import { useGuardian } from '../lib/session.tsx'
import type { Profile, Tables } from '../lib/supabase.ts'
import { RECENT_APPROVED_DAYS, useAction, useFamilyToday, useProfileNames, useRecentApproved, useStatement } from './data.ts'
import { dayLabel } from './dates.ts'
import { Avatar, CARD, Chips, confirmed, ErrorText, Field, Header, INPUT, PRIMARY, Section, SECONDARY } from './ui.tsx'

const KIND_LABEL: Record<Tables['statement_entries']['Row']['kind'], string> = {
  completion: 'Conclusão',
  adjustment: 'Ajuste',
  reversal: 'Estorno',
  redemption: 'Resgate',
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

/** Extrato of one child: saldo, Ajuste, Estorno of recent approved completions, and the entries newest first. */
export function Statement({ childId }: { childId?: string }) {
  const { data: profiles = [], isPending } = useProfiles()
  const children = profiles.filter((p) => p.kind === 'child')
  const child = children.find((c) => c.id === childId) ?? children[0]

  if (isPending) return null
  return (
    <>
      <Header title="Extrato" />
      {children.length === 0 && <p className={`${CARD} p-4 font-semibold text-muted`}>Cadastre um filho em Família.</p>}
      {children.length > 1 && (
        <Chips
          label="Filho"
          options={children.map((c) => ({ value: c.id, label: c.name }))}
          selected={child ? [child.id] : []}
          onChange={(ids) => ids.length && navigate(`responsavel/extrato/${ids.at(-1)}`, { replace: true })}
        />
      )}
      {child && <ChildStatement key={child.id} child={child} />}
    </>
  )
}

function ChildStatement({ child }: { child: Profile }) {
  const { data: family } = useFamily()
  const { data: entries = [] } = useStatement(child.id)
  const { data: names } = useProfileNames()
  const when = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: family?.timezone })

  return (
    <>
      <div className={`${CARD} flex items-center gap-3 p-4`}>
        <Avatar color={child.color} avatar={child.avatar} size="size-12" />
        <p className="min-w-0 flex-1 truncate text-xl font-black">{child.name}</p>
        <p className="text-right" role="status" aria-label={`Saldo: ${child.balance} pontos`}>
          <span className="block text-sm font-bold text-muted">Saldo</span>
          <span className="text-3xl font-black tabular-nums">{child.balance}</span>
        </p>
      </div>
      <AdjustmentForm child={child} />
      <Reversals child={child} />
      <Section title="Lançamentos">
        {entries.length === 0 && <p className="font-semibold text-muted">Nenhum lançamento ainda.</p>}
        <ul className={`${CARD} divide-y-2 divide-line`}>
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 p-3" data-entry={entry.kind}>
              <div className="min-w-0 flex-1">
                <p className="font-black">
                  {KIND_LABEL[entry.kind]}: <span className="font-bold">{entry.description}</span>
                </p>
                <p className="text-sm font-semibold text-muted">
                  {when.format(new Date(entry.created_at))}
                  {entry.guardian_id && ` · por ${names?.get(entry.guardian_id) ?? '…'}`}
                </p>
                {entry.requested_amount !== entry.amount && (
                  <p className="text-sm font-bold text-wait">
                    pedido {signed(entry.requested_amount)}, saiu {signed(entry.amount)}
                  </p>
                )}
              </div>
              <p className={`shrink-0 text-lg font-black tabular-nums ${entry.amount > 0 ? 'text-ok' : entry.amount < 0 ? 'text-[#b3261e]' : 'text-muted'}`}>
                {signed(entry.amount)}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function AdjustmentForm({ child }: { child: Profile }) {
  const { callGuardian } = useGuardian()
  const action = useAction()
  const [direction, setDirection] = useState<'bonus' | 'discount'>('bonus')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const value = Number(amount)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (direction === 'discount' && !confirmed(`Descontar ${value} pontos de ${child.name}? Se o saldo for menor, o desconto para em zero.`)) return
    action.mutate(
      () => callGuardian('adjust_points', { p_child_id: child.id, p_amount: direction === 'bonus' ? value : -value, p_reason: reason }),
      {
        onSuccess: () => {
          setAmount('')
          setReason('')
        },
      },
    )
  }

  return (
    <details className={`${CARD} group`}>
      <summary className="flex min-h-12 cursor-pointer items-center px-4 font-black">Ajuste</summary>
      <form onSubmit={submit} className="flex flex-col gap-3 px-4 pb-4">
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Tipo de ajuste</legend>
          {(
            [
              ['bonus', 'Bônus'],
              ['discount', 'Desconto'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 font-extrabold ${direction === key ? 'border-ink bg-ink text-white' : 'border-line'}`}>
              <input type="radio" name="direction" checked={direction === key} onChange={() => setDirection(key)} className="sr-only" />
              {label}
            </label>
          ))}
        </fieldset>
        <Field label="Pontos">
          <input
            inputMode="numeric"
            pattern="[1-9][0-9]*"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            className={INPUT}
          />
        </Field>
        <Field label="Motivo">
          <input value={reason} onChange={(e) => setReason(e.target.value)} required maxLength={80} className={INPUT} />
        </Field>
        {direction === 'discount' && (
          <p className="text-sm font-semibold text-muted">Funciona melhor quando foi combinado antes. Conte pessoalmente.</p>
        )}
        <ErrorText>{action.errorText}</ErrorText>
        <button type="submit" disabled={action.isPending} className={PRIMARY}>
          {direction === 'bonus' ? 'Dar bônus' : 'Descontar'}
        </button>
      </form>
    </details>
  )
}

function Reversals({ child }: { child: Profile }) {
  const { callGuardian } = useGuardian()
  const today = useFamilyToday()
  const { data: completions = [] } = useRecentApproved(child.id, today)
  const action = useAction()

  return (
    <details className={CARD}>
      <summary className="flex min-h-12 cursor-pointer items-center px-4 font-black">Estornar conclusão</summary>
      <div className="flex flex-col gap-2 px-4 pb-4">
        <p className="text-sm font-semibold text-muted">Conclusões aprovadas nos últimos {RECENT_APPROVED_DAYS} dias.</p>
        <ErrorText>{action.errorText}</ErrorText>
        {completions.length === 0 && <p className="font-semibold text-muted">Nenhuma.</p>}
        <ul className="flex flex-col gap-2">
          {completions.map((completion) => (
            <li key={completion.id} className="flex items-center gap-3">
              <Emoji emoji={completion.task.icon} className="size-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{completion.task.name}</p>
                <p className="text-sm font-bold text-muted">
                  {today ? dayLabel(completion.day, today) : completion.day} · {completion.points} pontos
                </p>
              </div>
              <button
                disabled={action.isPending}
                onClick={() =>
                  confirmed(
                    `Estornar "${completion.task.name}" (${completion.points} pontos)? Se o saldo de ${child.name} for menor, o débito para em zero.`,
                  ) && action.mutate(() => callGuardian('reverse_completion', { p_completion_id: completion.id }))
                }
                className={SECONDARY}
              >
                <Undo2 aria-hidden className="size-5" /> Estornar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
