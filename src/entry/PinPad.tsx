import { Delete } from 'lucide-react'
import { useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import { errorMessage } from '../lib/errors.ts'
import { Emoji } from '../lib/Emoji.tsx'
import { useOnline } from '../lib/online.ts'
import { parsePinResult } from '../lib/parse.ts'
import { navigate } from '../lib/route.ts'
import { useSession } from '../lib/session.tsx'
import type { Profile } from '../lib/supabase.ts'
import { supabase } from '../lib/supabase.ts'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const
const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function PinPad({ guardian }: { guardian: Profile }) {
  const { setSession } = useSession()
  const online = useOnline()
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null)
  const locked = lockedUntil !== null

  useEffect(() => {
    if (!lockedUntil) return
    const timer = setTimeout(() => {
      setLockedUntil(null)
      setMessage(null)
    }, lockedUntil.getTime() - Date.now())
    return () => clearTimeout(timer)
  }, [lockedUntil])

  async function submit(full: string) {
    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('start_guardian_session', { p_profile_id: guardian.id, p_pin: full })
      if (error) throw error
      const result = parsePinResult(data)
      if (result.ok) {
        setSession({ kind: 'guardian', profileId: guardian.id, token: result.token })
        navigate('responsavel', { replace: true })
        return
      }
      setPin('')
      void animate(scope.current, { x: [0, -14, 14, -10, 10, -4, 0] }, { duration: 0.45 })
      if (result.lockedUntil) {
        setLockedUntil(result.lockedUntil)
        setMessage(`Muitas tentativas erradas. Tente de novo às ${timeFormat.format(result.lockedUntil)}.`)
      } else {
        setMessage(
          result.attemptsLeft === 1 ? 'PIN errado. Resta 1 tentativa.' : `PIN errado. Restam ${result.attemptsLeft} tentativas.`,
        )
      }
    } catch (caught) {
      setPin('')
      setMessage(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  function press(key: (typeof KEYS)[number]) {
    if (busy || locked) return
    if (key === 'del') return setPin((p) => p.slice(0, -1))
    const next = (pin + key).slice(0, 4)
    setPin(next)
    if (next.length === 4) void submit(next)
  }

  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 px-4 [@media(max-height:700px)]:gap-2">
      <span className="grid size-16 place-items-center rounded-full bg-line [@media(max-height:700px)]:size-12">
        <Emoji emoji="🔒" className="size-9 [@media(max-height:700px)]:size-7" />
      </span>
      <h1 className="text-center text-3xl font-black">{guardian.name}</h1>
      <p className="-mt-3 font-bold text-muted">Digite o PIN</p>
      <div ref={scope} className="flex gap-4" role="img" aria-label={`${pin.length} de 4 números digitados`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-5 rounded-full border-[3px] border-ink transition-colors ${i < pin.length ? 'bg-ink' : ''}`}
          />
        ))}
      </div>
      <p aria-live="polite" className="min-h-12 max-w-72 text-center font-bold text-[#b3261e] [@media(max-height:700px)]:min-h-10">
        {!online ? 'Sem internet.' : message}
      </p>
      <div className="grid grid-cols-3 gap-4 [@media(max-height:700px)]:gap-3">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(key)}
              disabled={busy || locked || !online}
              aria-label={key === 'del' ? 'Apagar' : key}
              className="grid size-20 place-items-center rounded-full [@media(max-height:700px)]:size-17 border-2 border-line bg-white text-3xl font-extrabold active:bg-line disabled:opacity-40"
            >
              {key === 'del' ? <Delete aria-hidden /> : key}
            </button>
          ),
        )}
      </div>
      <button onClick={() => window.history.back()} className="min-h-12 px-6 font-bold text-muted underline">
        Voltar
      </button>
    </main>
  )
}
