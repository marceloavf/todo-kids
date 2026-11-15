import { Gift, House, ListChecks, LogOut, ReceiptText, Users, type LucideIcon } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useProfiles } from '../lib/queries.ts'
import { navigate, useRoute } from '../lib/route.ts'
import { useGuardian } from '../lib/session.tsx'
import { Family, ProfileEditor } from './Family.tsx'
import { Home } from './Home.tsx'
import { RewardEditor, Rewards } from './Rewards.tsx'
import { RoutineDetail, RoutineEditor, Routines } from './Routines.tsx'
import { Statement } from './Statement.tsx'
import { TaskEditor } from './TaskEditor.tsx'

const TABS: readonly { path: string; label: string; icon: LucideIcon }[] = [
  { path: '', label: 'Início', icon: House },
  { path: 'rotinas', label: 'Rotinas', icon: ListChecks },
  { path: 'recompensas', label: 'Recompensas', icon: Gift },
  { path: 'extrato', label: 'Extrato', icon: ReceiptText },
  { path: 'familia', label: 'Família', icon: Users },
]

/**
 * `#/responsavel/<tab>/...`. Tabs replace the history entry, like the child area's; screens under a tab push one,
 * so Android back returns to the tab and, from a tab, leaves the guardian area.
 */
function screenFor([tab, a, b, c]: (string | undefined)[]): ReactNode {
  switch (tab) {
    case 'rotinas':
      if (a === undefined) return <Routines />
      if (a === 'nova') return <RoutineEditor />
      if (a === 'avulsa') return <TaskEditor key={b} taskId={b === 'nova' ? undefined : b} />
      if (b === 'editar') return <RoutineEditor id={a} />
      if (b === 'tarefa') return <TaskEditor key={c} routineId={a} taskId={c === 'nova' ? undefined : c} />
      return <RoutineDetail id={a} />
    case 'recompensas':
      return a === undefined ? <Rewards /> : <RewardEditor key={a} id={a === 'nova' ? undefined : a} />
    case 'extrato':
      return <Statement childId={a} />
    case 'familia':
      if (a === undefined) return <Family />
      if (a === 'novo-filho') return <ProfileEditor kind="child" />
      if (a === 'novo-responsavel') return <ProfileEditor kind="guardian" />
      return <ProfileEditor key={a} id={a} />
    default:
      return <Home />
  }
}

export function GuardianApp() {
  const { profileId, leave } = useGuardian()
  const route = useRoute()
  const { data: profiles, isSuccess } = useProfiles()
  const me = profiles?.find((p) => p.id === profileId)
  const path = route.slice(1)
  const tab = TABS.find((t) => t.path === (path[0] ?? '')) ?? TABS[0]
  const routeKey = route.join('/')

  // Archived from another device (or by this guardian): the server already refuses the token.
  useEffect(() => {
    if (isSuccess && !me) leave()
  }, [isSuccess, me, leave])

  useEffect(() => {
    document.getElementById('guardian-main')?.scrollTo(0, 0)
  }, [routeKey])

  return (
    <div className="flex h-dvh flex-col bg-[#f6f5f2]">
      <header className="pt-safe flex shrink-0 items-center gap-3 border-b-2 border-line bg-white px-4 pb-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold tracking-wide text-muted uppercase">Responsável</p>
          <h1 className="truncate text-lg leading-tight font-black">{me?.name ?? '…'}</h1>
        </div>
        <button onClick={leave} className="flex min-h-11 items-center gap-2 rounded-xl border-2 border-line px-3 font-extrabold">
          <LogOut aria-hidden className="size-5" /> Sair
        </button>
      </header>
      <main id="guardian-main" className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto flex max-w-xl flex-col gap-5 px-4 pt-4 pb-8">{screenFor(path)}</div>
      </main>
      <nav className="pb-safe flex shrink-0 border-t-2 border-line bg-white" aria-label="Seções do responsável">
        {TABS.map(({ path: to, label, icon: Icon }) => (
          <button
            key={to}
            onClick={() => navigate(to ? `responsavel/${to}` : 'responsavel', { replace: true })}
            aria-current={tab.path === to ? 'page' : undefined}
            className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold ${tab.path === to ? 'text-ink shadow-[inset_0_3px_0_var(--color-ink)]' : 'text-muted'}`}
          >
            <Icon aria-hidden className="size-6" strokeWidth={tab.path === to ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
