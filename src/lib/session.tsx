import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { navigate } from './route.ts'
import { callRpc, supabase, type Functions } from './supabase.ts'

export type Session =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'needsFamily' }
  | { kind: 'picker' }
  | { kind: 'child'; profileId: string }
  | { kind: 'guardian'; profileId: string; token: string }

type SessionApi = {
  session: Session
  setSession: (session: Session) => void
  /** Back to the picker. Ends the guardian session on the server, since the token only lives here. */
  leaveProfile: () => void
}

const SessionContext = createContext<SessionApi | null>(null)

async function resolveSignedIn(): Promise<Session> {
  const { data, error } = await supabase.from('families').select('id').maybeSingle()
  if (error) throw error
  return data ? { kind: 'picker' } : { kind: 'needsFamily' }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ kind: 'loading' })
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, auth) => {
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !auth)) {
        setSession({ kind: 'signedOut' })
        return
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // supabase-js deadlocks if another client call is awaited inside this callback.
        setTimeout(() => {
          // Only a fresh start moves on: SIGNED_IN also fires when a tab regains focus, and the Entrada form may have created the family meanwhile.
          const fromStart = (next: Session) => setSession((now) => (now.kind === 'loading' || now.kind === 'signedOut' ? next : now))
          resolveSignedIn().then(fromStart, () => fromStart({ kind: 'loading' }))
        })
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const leaveProfile = () => {
    if (session.kind === 'guardian') callRpc('end_guardian_session', { p_token: session.token }).catch(() => {})
    setSession({ kind: 'picker' })
    navigate('', { replace: true })
  }

  return <SessionContext value={{ session, setSession, leaveProfile }}>{children}</SessionContext>
}

export function useSession(): SessionApi {
  const api = useContext(SessionContext)
  if (!api) throw new Error('useSession outside SessionProvider')
  return api
}

type GuardianFunction = {
  [F in keyof Functions]: Functions[F]['Args'] extends { p_token: string } ? F : never
}[keyof Functions]

/**
 * The guardian area's handle on its session. `callGuardian` adds `p_token` to a guardian function and,
 * when the server answers `not_authorized` (expired or ended), drops back to the picker before rethrowing.
 */
export function useGuardian() {
  const { session, leaveProfile } = useSession()
  if (session.kind !== 'guardian') throw new Error('useGuardian outside the guardian area')
  const { profileId, token } = session

  async function callGuardian<F extends GuardianFunction>(
    fn: F,
    args: Omit<Functions[F]['Args'], 'p_token'>,
  ): Promise<Functions[F]['Returns']> {
    try {
      return await callRpc(fn, { ...args, p_token: token } as Functions[F]['Args'])
    } catch (error) {
      if (error instanceof Object && 'message' in error && error.message === 'not_authorized') leaveProfile()
      throw error
    }
  }

  return { profileId, token, callGuardian, leave: leaveProfile }
}
