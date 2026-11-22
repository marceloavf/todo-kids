import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { navigate } from './route.ts'
import { callRpc, supabase, type Functions } from './supabase.ts'

export type Session =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'unpaired' }
  | { kind: 'device'; profileId: string }
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
  const cache = useQueryClient()
  useEffect(() => {
    let generation = 0
    let previousUser: string | undefined
    const { data } = supabase.auth.onAuthStateChange((event, auth) => {
      const changed = previousUser !== auth?.user.id
      if (changed) {
        generation++
        previousUser = auth?.user.id
        cache.clear()
        if (!auth?.user.is_anonymous) setSession({ kind: 'loading' })
      }
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !auth)) {
        setSession({ kind: 'signedOut' })
        return
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        const current = ++generation
        if (auth?.user.is_anonymous) {
          setTimeout(async () => {
            const { data: id, error } = await supabase.rpc('device_child_id')
            if (current !== generation || error) return
            if (!id) cache.clear()
            setSession(id ? { kind: 'device', profileId: id } : { kind: 'unpaired' })
          })
          return
        }
        // supabase-js deadlocks if another client call is awaited inside this callback.
        setTimeout(() => {
          // Only a fresh start moves on: SIGNED_IN also fires when a tab regains focus, and the Entrada form may have created the family meanwhile.
          const fromStart = (next: Session) => current === generation && setSession((now) => (now.kind === 'loading' || now.kind === 'signedOut' ? next : now))
          resolveSignedIn().then(fromStart, () => fromStart({ kind: 'loading' }))
        })
      }
    })
    return () => {
      generation++
      data.subscription.unsubscribe()
    }
  }, [cache])

  useEffect(() => {
    if (session.kind !== 'device') return
    let active = true
    async function check() {
      const { data, error } = await supabase.rpc('device_child_id')
      if (active && !error && !data) {
        cache.clear()
        setSession({ kind: 'unpaired' })
        await supabase.auth.signOut({ scope: 'local' })
      }
    }
    const timer = window.setInterval(check, 5000)
    window.addEventListener('focus', check)
    window.addEventListener('online', check)
    return () => {
      active = false
      clearInterval(timer)
      window.removeEventListener('focus', check)
      window.removeEventListener('online', check)
    }
  }, [session.kind, cache])

  const leaveProfile = () => {
    if (session.kind === 'device') return
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
