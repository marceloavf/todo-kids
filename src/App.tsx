import { WifiOff } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { ChildApp } from './child/ChildApp.tsx'
import { Entry } from './entry/Entry.tsx'
import { Picker } from './entry/Picker.tsx'
import { useOnline } from './lib/online.ts'
import { useFamilyRealtime } from './lib/realtime.ts'
import { navigate, useRoute } from './lib/route.ts'
import { useSession } from './lib/session.tsx'

// Its own chunk, so the child screens never download the guardian area.
const GuardianApp = lazy(() => import('./guardian/GuardianApp.tsx').then((m) => ({ default: m.GuardianApp })))

const PROFILE_ROUTES: Record<string, 'child' | 'guardian'> = { hoje: 'child', recompensas: 'child', responsavel: 'guardian' }

export function App() {
  const { session, leaveProfile } = useSession()
  const route = useRoute()
  const online = useOnline()
  const area = PROFILE_ROUTES[route[0] ?? '']
  const inProfile = session.kind === 'child' || session.kind === 'guardian'
  useFamilyRealtime(inProfile || session.kind === 'picker')

  // Reopening the app always starts at the picker; the guardian token never outlives the page.
  useEffect(() => navigate('', { replace: true }), [])

  // The hash follows the session: back out of a profile (Android back) leaves it, and a stale forward entry is dropped.
  useEffect(() => {
    if (inProfile && area !== session.kind) leaveProfile()
    else if (!inProfile && area) navigate('', { replace: true })
  }, [area, inProfile, session.kind, leaveProfile])

  return (
    <>
      {!online && (
        <div
          role="status"
          className="pt-safe fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-ink px-4 pb-2 text-center font-extrabold text-white"
        >
          <WifiOff aria-hidden className="size-5" /> Sem internet. Confira a conexão.
        </div>
      )}
      {session.kind === 'loading' && <Loading />}
      {(session.kind === 'signedOut' || session.kind === 'needsFamily') && <Entry signedIn={session.kind === 'needsFamily'} />}
      {session.kind === 'picker' && <Picker />}
      {session.kind === 'child' && <ChildApp key={session.profileId} profileId={session.profileId} />}
      {session.kind === 'guardian' && (
        <Suspense fallback={<Loading />}>
          <GuardianApp />
        </Suspense>
      )}
    </>
  )
}

function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6">
      <p className="text-3xl font-black">Todo Kids</p>
      <button onClick={() => window.location.reload()} className="min-h-12 px-6 font-bold text-muted underline">
        Demorando? Tentar de novo
      </button>
    </main>
  )
}
