import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Emoji } from '../lib/Emoji.tsx'
import { useProfiles, useTodayTasks } from '../lib/queries.ts'
import { useGuardian } from '../lib/session.tsx'
import type { Profile } from '../lib/supabase.ts'
import { useAction, useFamilyToday, usePendingCompletions, usePendingRedemptionsWithReward } from './data.ts'
import { dayLabel } from './dates.ts'
import { Avatar, CARD, confirmed, ErrorText, Field, INPUT, PRIMARY, Section, SECONDARY } from './ui.tsx'

/** Início: Pendências first, then each child's day and saldo. */
export function Home() {
  const { callGuardian } = useGuardian()
  const today = useFamilyToday()
  const { data: profiles = [] } = useProfiles()
  const { data: completions = [], isPending: loadingCompletions } = usePendingCompletions()
  const { data: redemptions = [], isPending: loadingRedemptions } = usePendingRedemptionsWithReward()
  const { data: tasks = [] } = useTodayTasks()
  const action = useAction()
  // The pending completion whose "do it again" form is open, and its optional hint.
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [hint, setHint] = useState('')
  const children = profiles.filter((p) => p.kind === 'child')
  const child = (id: string) => children.find((c) => c.id === id)
  const nothingPending = !loadingCompletions && !loadingRedemptions && completions.length === 0 && redemptions.length === 0

  const decide = (ids: string[], approve: boolean) =>
    action.mutate(() => callGuardian('decide_completions', { p_completion_ids: ids, p_approve: approve }))
  const reject = (id: string) =>
    action.mutate(() => callGuardian('decide_completions', { p_completion_ids: [id], p_approve: false, p_hint: hint }), {
      onSuccess: () => setRejecting(null),
    })
  const decideRedemption = (id: string, confirm: boolean) =>
    action.mutate(() => callGuardian('decide_redemption', { p_redemption_id: id, p_confirm: confirm }))

  return (
    <>
      <Section title="Pendências">
        <ErrorText>{action.errorText}</ErrorText>
        {nothingPending && <p className={`${CARD} p-4 font-semibold text-muted`}>Nada esperando você.</p>}
        {completions.length > 1 && (
          <>
            <p className="text-sm font-semibold text-muted">Conte para cada filho o que você viu.</p>
            <button
              disabled={action.isPending}
              onClick={() => decide(completions.map((c) => c.id), true)}
              className={`${PRIMARY} w-full`}
            >
              <Check aria-hidden /> Aprovar tudo ({completions.length})
            </button>
          </>
        )}
        <ul className="flex flex-col gap-2">
          {completions.map((completion) => {
            const who = child(completion.child_id)
            const label = today ? dayLabel(completion.day, today) : null
            return (
              <li key={completion.id} className={`${CARD} flex flex-col gap-3 p-3`}>
                <div className="flex items-center gap-3">
                  <Emoji emoji={completion.task.icon} className="size-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black">{completion.task.name}</p>
                    <p className="text-sm font-bold text-muted">
                      {who?.name ?? 'Filho arquivado'} · {completion.points} pontos
                    </p>
                  </div>
                  {label && label !== 'hoje' && (
                    <span className="shrink-0 rounded-full bg-wait-soft px-2 py-0.5 text-sm font-black text-wait">{label}</span>
                  )}
                </div>
                {rejecting === completion.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      reject(completion.id)
                    }}
                    className="flex flex-col gap-2"
                  >
                    <Field label={`Dica para ${who?.name ?? 'o filho'} (opcional)`} hint={`${hint.length}/120`}>
                      <input
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        maxLength={120}
                        placeholder="Falta pôr o travesseiro no lugar."
                        autoFocus
                        className={INPUT}
                      />
                    </Field>
                    <p className="text-sm font-semibold text-muted">A tarefa volta para fazer de novo. Nenhum ponto sai do saldo.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setRejecting(null)} className={SECONDARY}>
                        Cancelar
                      </button>
                      <button type="submit" disabled={action.isPending} className={PRIMARY}>
                        <X aria-hidden className="size-5" /> Reprovar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={action.isPending}
                      onClick={() => {
                        setHint('')
                        setRejecting(completion.id)
                      }}
                      className={SECONDARY}
                    >
                      <X aria-hidden className="size-5" /> Reprovar
                    </button>
                    <button disabled={action.isPending} onClick={() => decide([completion.id], true)} className={PRIMARY}>
                      <Check aria-hidden className="size-5" /> Aprovar
                    </button>
                  </div>
                )}
              </li>
            )
          })}
          {redemptions.map((redemption) => {
            const who = child(redemption.child_id)
            const covered = (who?.balance ?? 0) >= redemption.cost
            return (
              <li key={redemption.id} className={`${CARD} flex flex-col gap-3 p-3`}>
                <div className="flex items-center gap-3">
                  <Emoji emoji={redemption.reward.icon} className="size-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black">Resgate: {redemption.reward.name}</p>
                    <p className="text-sm font-bold text-muted">
                      {who?.name ?? 'Filho arquivado'} · custa {redemption.cost} pontos
                    </p>
                  </div>
                </div>
                {!covered && (
                  <p className="rounded-xl bg-wait-soft px-3 py-2 text-sm font-bold text-wait">
                    O saldo de {who?.name ?? 'filho'} ({who?.balance ?? 0}) não cobre mais o custo. Só dá para recusar.
                  </p>
                )}
                <div className={`grid gap-2 ${covered ? 'grid-cols-2' : ''}`}>
                  <button
                    disabled={action.isPending}
                    onClick={() =>
                      confirmed(`Recusar o resgate "${redemption.reward.name}" de ${who?.name ?? 'filho'}?`) &&
                      decideRedemption(redemption.id, false)
                    }
                    className={SECONDARY}
                  >
                    <X aria-hidden className="size-5" /> Recusar
                  </button>
                  {covered && (
                    <button disabled={action.isPending} onClick={() => decideRedemption(redemption.id, true)} className={PRIMARY}>
                      <Check aria-hidden className="size-5" /> Confirmar
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Hoje">
        {children.length === 0 && <p className={`${CARD} p-4 font-semibold text-muted`}>Cadastre um filho em Família.</p>}
        <ul className="flex flex-col gap-2">
          {children.map((c) => (
            <ChildDay key={c.id} child={c} tasks={tasks.filter((t) => t.child_id === c.id)} />
          ))}
        </ul>
      </Section>
    </>
  )
}

function ChildDay({ child, tasks }: { child: Profile; tasks: { status: 'todo' | 'pending' | 'done' }[] }) {
  const done = tasks.filter((t) => t.status === 'done').length
  const waiting = tasks.filter((t) => t.status === 'pending').length
  return (
    <li className={`${CARD} flex flex-col gap-2 p-3`}>
      <div className="flex items-center gap-3">
        <Avatar color={child.color} avatar={child.avatar} />
        <p className="min-w-0 flex-1 truncate text-lg font-black">{child.name}</p>
        <p className="shrink-0 font-black tabular-nums" aria-label={`Saldo de ${child.name}: ${child.balance} pontos`}>
          <span className="text-sm font-bold text-muted">Saldo </span>
          {child.balance}
        </p>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={`Tarefas feitas hoje por ${child.name}`}
        aria-valuemin={0}
        aria-valuemax={tasks.length}
        aria-valuenow={done}
      >
        <div className="h-full rounded-full" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`, backgroundColor: child.color }} />
      </div>
      <p className="text-sm font-bold text-muted">
        {done} de {tasks.length} feitas{waiting > 0 && ` · ${waiting} esperando aprovação`}
      </p>
    </li>
  )
}
