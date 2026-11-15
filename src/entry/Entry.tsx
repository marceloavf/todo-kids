import { useState, type FormEvent, type ReactNode } from 'react'
import { errorMessage } from '../lib/errors.ts'
import { useOnline } from '../lib/online.ts'
import { useSession } from '../lib/session.tsx'
import { supabase } from '../lib/supabase.ts'

type Mode = 'signIn' | 'create'

/**
 * Entrada. Rendered for both signedOut and needsFamily at the same spot, so the "Criar família" form keeps
 * what was typed when sign-up succeeds and only create_family is left to do.
 */
export function Entry({ signedIn }: { signedIn: boolean }) {
  const { setSession } = useSession()
  const online = useOnline()
  const [mode, setMode] = useState<Mode>('signIn')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const creating = signedIn || mode === 'create'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '').trim()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (!signedIn) {
        const credentials = { email: field('email'), password: String(form.get('password') ?? '') }
        if (!creating) {
          const { error } = await supabase.auth.signInWithPassword(credentials)
          if (error) throw error
          return
        }
        const { data, error } = await supabase.auth.signUp(credentials)
        if (error) throw error
        if (!data.session) {
          setMode('signIn')
          setNotice('Enviamos um link para o seu e-mail. Confirme a conta e depois entre aqui.')
          return
        }
      }
      const { error } = await supabase.rpc('create_family', {
        p_name: field('family'),
        p_guardian_name: field('guardian'),
        p_pin: field('pin'),
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      if (error) throw error
      setSession({ kind: 'picker' })
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const title = signedIn ? 'Falta pouco' : creating ? 'Criar família' : 'Todo Kids'
  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-center text-4xl font-black">{title}</h1>
      <p className="mt-2 mb-6 text-center font-semibold text-muted">
        {signedIn
          ? 'Crie a família para começar.'
          : creating
            ? 'Uma conta para a família toda.'
            : 'Entre com o e-mail e a senha da família.'}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!signedIn && (
          <>
            <Field label="E-mail">
              <input name="email" type="email" required autoComplete="email" className={inputClass} />
            </Field>
            <Field label="Senha">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={creating ? 'new-password' : 'current-password'}
                className={inputClass}
              />
            </Field>
          </>
        )}
        {creating && (
          <>
            <Field label="Nome da família">
              <input name="family" required placeholder="Família Silva" className={inputClass} />
            </Field>
            <Field label="Seu nome">
              <input name="guardian" required placeholder="Mamãe" autoComplete="given-name" className={inputClass} />
            </Field>
            <Field label="PIN do responsável (4 números)">
              <input
                name="pin"
                required
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                autoComplete="off"
                className={`${inputClass} tracking-[0.5em]`}
              />
            </Field>
          </>
        )}
        <div aria-live="polite" className="min-h-6 text-center font-bold">
          {error && <p className="text-[#b3261e]">{error}</p>}
          {notice && <p className="text-ok">{notice}</p>}
        </div>
        <button
          type="submit"
          disabled={busy || !online}
          className="min-h-14 rounded-2xl bg-ink text-lg font-black text-white disabled:opacity-50"
        >
          {busy ? 'Aguarde…' : creating ? 'Criar família' : 'Entrar'}
        </button>
      </form>
      {signedIn ? (
        <button onClick={() => void supabase.auth.signOut()} className="mt-6 min-h-12 font-bold text-muted underline">
          Sair desta conta
        </button>
      ) : (
        <button
          onClick={() => {
            setMode(creating ? 'signIn' : 'create')
            setError(null)
          }}
          className="mt-6 min-h-12 font-bold text-muted underline"
        >
          {creating ? 'Já tenho conta' : 'Criar família'}
        </button>
      )}
    </main>
  )
}

const inputClass =
  'min-h-13 w-full rounded-2xl border-2 border-line bg-white px-4 text-lg font-semibold outline-none focus:border-ink'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 font-bold">
      {label}
      {children}
    </label>
  )
}
