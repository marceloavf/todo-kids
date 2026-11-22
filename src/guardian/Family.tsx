import { ChildDevices } from './ChildDevices.tsx'
import { Archive, ChevronRight, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { EMOJI } from '../lib/Emoji.tsx'
import { useFamily, useProfiles } from '../lib/queries.ts'
import { navigate } from '../lib/route.ts'
import { useGuardian } from '../lib/session.tsx'
import { supabase, type Profile, type Tables } from '../lib/supabase.ts'
import { useAction } from './data.ts'
import { Avatar, CARD, confirmed, DANGER, EmojiPicker, ErrorText, Field, Header, INPUT, PRIMARY, Section, SECONDARY, Toggle } from './ui.tsx'

// Each keeps white text readable at the child screen's large sizes (contrast of at least 3:1).
const COLORS = ['#f2603f', '#2f7de1', '#16a34a', '#9333ea', '#db2777', '#0d9488', '#4f46e5', '#b45309']

export function Family() {
  const { data: family } = useFamily()
  const { data: profiles = [] } = useProfiles()
  const { leave } = useGuardian()
  const children = profiles.filter((p) => p.kind === 'child')
  const guardians = profiles.filter((p) => p.kind === 'guardian')

  return (
    <>
      <Header title="Família" />
      {family && <FamilyForm key={`${family.name}|${family.timezone}`} family={family} />}
      <ProfileList title="Filhos" profiles={children} newPath="novo-filho" newLabel="Novo filho" />
      <ProfileList title="Responsáveis" profiles={guardians} newPath="novo-responsavel" newLabel="Novo responsável" />
      <button
        onClick={() => {
          leave()
          void supabase.auth.signOut()
        }}
        className="mt-4 min-h-12 font-bold text-muted underline"
      >
        Sair da conta da família neste aparelho
      </button>
    </>
  )
}

function FamilyForm({ family }: { family: Tables['families']['Row'] }) {
  const { callGuardian } = useGuardian()
  const action = useAction()
  const [name, setName] = useState(family.name)
  const [timezone, setTimezone] = useState(family.timezone)
  const zones = Intl.supportedValuesOf('timeZone')
  if (!zones.includes(family.timezone)) zones.unshift(family.timezone)

  function submit(event: FormEvent) {
    event.preventDefault()
    action.mutate(() => callGuardian('update_family', { p_name: name, p_timezone: timezone }))
  }

  return (
    <form onSubmit={submit} className={`${CARD} flex flex-col gap-3 p-4`}>
      <Field label="Nome da família">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} className={INPUT} />
      </Field>
      <Field label="Fuso horário" hint="define quando o dia vira">
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={INPUT}>
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </Field>
      <ErrorText>{action.errorText}</ErrorText>
      <button type="submit" disabled={action.isPending || (name === family.name && timezone === family.timezone)} className={PRIMARY}>
        Salvar família
      </button>
    </form>
  )
}

function ProfileList({ title, profiles, newPath, newLabel }: { title: string; profiles: Profile[]; newPath: string; newLabel: string }) {
  return (
    <Section title={title}>
      <ul className="flex flex-col gap-2">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <button onClick={() => navigate(`responsavel/familia/${profile.id}`)} className={`${CARD} flex min-h-14 w-full items-center gap-3 p-2 text-left`}>
              {profile.kind === 'child' ? (
                <Avatar color={profile.color} avatar={profile.avatar} />
              ) : (
                <Avatar color="var(--color-line)" avatar="🔒" />
              )}
              <span className="min-w-0 flex-1 truncate text-lg font-black">{profile.name}</span>
              <ChevronRight aria-hidden className="shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(`responsavel/familia/${newPath}`)} className={`${SECONDARY} w-full`}>
        <Plus aria-hidden className="size-5" /> {newLabel}
      </button>
    </Section>
  )
}

export function ProfileEditor({ id, kind }: { id?: string; kind?: Profile['kind'] }) {
  const { data: profiles, isPending } = useProfiles()
  if (id && isPending) return null
  const profile = id ? profiles?.find((p) => p.id === id) : undefined
  if (id && !profile) return <Header title="Perfil não encontrado" back />
  return <ProfileForm profile={profile} kind={profile?.kind ?? kind ?? 'child'} />
}

function ProfileForm({ profile, kind }: { profile?: Profile; kind: Profile['kind'] }) {
  const { profileId, callGuardian, leave } = useGuardian()
  const action = useAction()
  const archive = useAction()
  const [name, setName] = useState(profile?.name ?? '')
  const [color, setColor] = useState(profile?.color ?? COLORS[0])
  const [avatar, setAvatar] = useState(profile?.avatar ?? EMOJI.avatars[0])
  const [readAloud, setReadAloud] = useState(profile?.read_aloud ?? false)
  const [sounds, setSounds] = useState(profile?.sounds ?? true)
  const [reducedMotion, setReducedMotion] = useState(profile?.reduced_motion ?? false)
  const [pin, setPin] = useState('')
  const [pinAgain, setPinAgain] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const isChild = kind === 'child'
  const colors = COLORS.includes(color) ? COLORS : [color, ...COLORS]

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!isChild && (pin || !profile) && pin !== pinAgain) return setPinError('Os dois PINs são diferentes.')
    setPinError(null)
    action.mutate(
      () =>
        callGuardian('save_profile', {
          p_id: profile?.id,
          p_kind: kind,
          p_name: name,
          p_color: color,
          p_avatar: avatar,
          p_read_aloud: readAloud,
          p_sounds: sounds,
          p_reduced_motion: reducedMotion,
          // Omitted unless it changes: a child never has one and an empty string is not a PIN.
          ...(!isChild && pin ? { p_pin: pin } : {}),
        }),
      { onSuccess: () => window.history.back() },
    )
  }

  function archiveProfile() {
    if (!profile) return
    const self = profile.id === profileId
    const message = self
      ? 'Arquivar o seu próprio perfil? Você sai da área do responsável.'
      : `Arquivar o perfil de ${profile.name}? Ele some da tela de perfis. O extrato continua guardado.`
    if (!confirmed(message)) return
    archive.mutate(() => callGuardian('archive_profile', { p_id: profile.id }), {
      onSuccess: () => (self ? leave() : window.history.back()),
    })
  }

  const pinField = (label: string, value: string, set: (v: string) => void) => (
    <Field label={label}>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        autoComplete="off"
        required={!profile}
        value={value}
        onChange={(e) => set(e.target.value.replace(/\D/g, ''))}
        className={`${INPUT} tracking-[0.5em]`}
      />
    </Field>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Header title={profile ? `Editar ${profile.name}` : isChild ? 'Novo filho' : 'Novo responsável'} back />
      <Field label="Nome">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} className={INPUT} />
      </Field>
      {isChild ? (
        <>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 font-bold">Cor</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <label key={c} className="relative grid size-11 cursor-pointer place-items-center rounded-full" style={{ backgroundColor: c }}>
                  <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} aria-label={c} className="peer sr-only" />
                  <span className="hidden size-4 rounded-full bg-white peer-checked:block" />
                  <span className="absolute -inset-1 rounded-full peer-checked:ring-3 peer-checked:ring-ink peer-focus-visible:outline-3 peer-focus-visible:outline-ink" />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1">
            <span className="font-bold">Avatar</span>
            <div className="flex items-center gap-3">
              <Avatar color={color} avatar={avatar} size="size-14" />
              <EmojiPicker label="Avatar" options={EMOJI.avatars} value={avatar} onChange={(e) => e && setAvatar(e)} />
            </div>
          </div>
          {profile && <ChildDevices childId={profile.id} />}
          <Section title="Opções na tela do filho">
            <div className={`${CARD} flex flex-col px-4 py-1`}>
              <Toggle label="Ler em voz alta ao abrir o cartão" checked={readAloud} onChange={setReadAloud} />
              <Toggle label="Sons" checked={sounds} onChange={setSounds} />
              <Toggle label="Animação reduzida" checked={reducedMotion} onChange={setReducedMotion} />
            </div>
          </Section>
        </>
      ) : (
        <Section title={profile ? 'Trocar PIN' : 'PIN'}>
          {profile && <p className="-mt-1 text-sm font-semibold text-muted">Deixe em branco para manter o PIN atual.</p>}
          {pinField('PIN (4 números)', pin, setPin)}
          {pinField('Repita o PIN', pinAgain, setPinAgain)}
          <ErrorText>{pinError}</ErrorText>
        </Section>
      )}
      <ErrorText>{action.errorText}</ErrorText>
      <button type="submit" disabled={action.isPending} className={PRIMARY}>
        Salvar
      </button>
      {profile && (
        <>
          <button type="button" disabled={archive.isPending} onClick={archiveProfile} className={`${DANGER} mt-4`}>
            <Archive aria-hidden className="size-5" /> Arquivar perfil
          </button>
          <ErrorText>{archive.errorText}</ErrorText>
        </>
      )}
    </form>
  )
}
