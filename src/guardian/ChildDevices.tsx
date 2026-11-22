import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { errorMessage } from '../lib/errors.ts'
import { useGuardian } from '../lib/session.tsx'
import { SECONDARY, Section } from './ui.tsx'

export function ChildDevices({ childId }: { childId: string }) {
  const { callGuardian, token } = useGuardian()
  const [issued, setIssued] = useState<{ code: string; expires_at: string; previous: string[] } | null>(null)
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const remaining = issued ? Math.max(0, Math.ceil((Date.parse(issued.expires_at) - now) / 1000)) : 0
  const devices = useQuery({
    queryKey: ['child-devices', childId, token],
    queryFn: () => callGuardian('list_child_devices', { p_child_id: childId }),
    refetchInterval: remaining ? 3000 : false,
  })
  const linked = issued && devices.data?.some(d => !issued.previous.includes(d.id))
  useEffect(() => {
    if (!issued || linked) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [issued, linked])
  async function update(deviceId?: string) {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      if (deviceId) {
        await callGuardian('revoke_child_device', { p_device_id: deviceId })
        await devices.refetch()
      } else {
        const previous = await devices.refetch({ throwOnError: true })
        const [result] = await callGuardian('issue_device_code', { p_child_id: childId })
        setNow(Date.now())
        setIssued({ ...result, previous: previous.data!.map(d => d.id) })
      }
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  const url = new URL(location.href)
  url.hash = '/vincular/' + (issued?.code ?? '')
  return <Section title="Aparelhos do filho">
    <button type="button" disabled={busy} onClick={() => void update()} className={SECONDARY}>Vincular aparelho</button>
    {issued && (linked ? <p role="status">Vinculado!</p> : remaining ? <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-4">
      <QRCodeSVG value={url.href} size={168} marginSize={4} title="QR para vincular aparelho" />
      <strong className="text-2xl tracking-widest">{issued.code}</strong>
      <span>Vence em {Math.floor(remaining / 60)} min {remaining % 60} s</span>
    </div> : <p>Código vencido. Gere outro para continuar.</p>)}
    {devices.data?.map(device => <div key={device.id} className="flex items-center justify-between gap-2">
      <span>{device.guardian_name} · {new Date(device.linked_at).toLocaleString('pt-BR')}</span>
      <button type="button" disabled={busy} className={SECONDARY} onClick={() => {
        if (window.confirm('Desvincular este aparelho?')) void update(device.id)
      }}>Desvincular</button>
    </div>)}
    {(error || devices.error) && <p role="alert">{error || errorMessage(devices.error)}</p>}
  </Section>
}
