import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase.ts'
import { errorMessage } from '../lib/errors.ts'

export const initialLinkCode = /^#\/vincular\/([A-Z2-9]{6})$/i.exec(location.hash)?.[1]?.toUpperCase()
const iosBrowser = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  && !matchMedia('(display-mode: standalone)').matches

export function DeviceEntry({ onCancel }: { onCancel: () => void }) {
  const [code, setCode] = useState(initialLinkCode ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)

  async function redeem(value: string) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const { data, error: readError } = await supabase.auth.getSession()
      if (readError) throw readError
      if (!data.session) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) throw error
      }
      const { data: status, error } = await supabase.rpc('redeem_device_code', { p_code: value })
      if (error) throw error
      if (status === 'linked') {
        location.reload()
        return
      }
      if (status === 'discard') await supabase.auth.signOut({ scope: 'local' })
      setError(status === 'discard' ? 'Muitas tentativas. Peça um novo código.' : 'Código inválido ou vencido. Confira com o responsável.')
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  useEffect(() => {
    const code = initialLinkCode
    if (!code || iosBrowser) return
    const timer = setTimeout(() => void redeem(code), 0)
    return () => clearTimeout(timer)
  }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    void redeem(code)
  }
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-black">Vincular aparelho</h1>
      {initialLinkCode && iosBrowser ? <p>No Safari, toque em Compartilhar e em Adicionar à Tela de Início. Abra o aplicativo pela tela inicial, toque em Tenho um código e digite <strong>{initialLinkCode}</strong>.</p> :
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="font-bold">Código de vínculo
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} minLength={6} required autoCapitalize="characters" autoComplete="off" className="block w-full rounded-xl border-2 p-3 tracking-widest" />
          </label>
          <button disabled={busy} className="min-h-12 rounded-xl bg-ink font-bold text-white">Vincular</button>
        </form>}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} onClick={async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user.is_anonymous) await supabase.auth.signOut({ scope: 'local' })
        onCancel()
      }} className="min-h-12 font-bold underline">Voltar à entrada</button>
    </main>
  )
}
