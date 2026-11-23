import { ReadStatus } from '../lib/ReadStatus.tsx'
import { Archive, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { EMOJI, Emoji } from '../lib/Emoji.tsx'
import { useRewards } from '../lib/queries.ts'
import { navigate } from '../lib/route.ts'
import { useGuardian } from '../lib/session.tsx'
import type { Reward } from '../lib/supabase.ts'
import { useAction } from './data.ts'
import { CARD, confirmed, EmojiPicker, ErrorText, Field, Header, ICON_BUTTON, INPUT, PRIMARY, Stepper } from './ui.tsx'

export function Rewards() {
  const { callGuardian } = useGuardian()
  const query = useRewards()
  const rewards = query.data ?? []
  const action = useAction()

  return (
    <>
      <Header title="Recompensas">
        <button onClick={() => navigate('responsavel/recompensas/nova')} className={PRIMARY}>
          <Plus aria-hidden className="size-5" /> Nova
        </button>
      </Header>
      <ErrorText>{action.errorText}</ErrorText>
      <ReadStatus query={query} subject="as recompensas" />
      {query.isSuccess && rewards.length === 0 && <p className={`${CARD} p-4 font-semibold text-muted`}>Nenhuma recompensa ainda.</p>}
      <ul className="flex flex-col gap-2">
        {rewards.map((reward) => (
          <li key={reward.id} className={`${CARD} flex items-center gap-2 p-2`}>
            <button onClick={() => navigate(`responsavel/recompensas/${reward.id}`)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 p-1 text-left">
              <Emoji emoji={reward.icon} className="size-10 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-black">{reward.name}</span>
                <span className="block text-sm font-bold text-muted">{reward.cost} pontos</span>
              </span>
            </button>
            <button
              aria-label={`Arquivar ${reward.name}`}
              disabled={action.isPending}
              onClick={() =>
                confirmed(`Arquivar a recompensa "${reward.name}"? Ela some da tela dos filhos.`) &&
                action.mutate(() => callGuardian('archive_reward', { p_id: reward.id }))
              }
              className={`${ICON_BUTTON} text-[#b3261e]`}
            >
              <Archive aria-hidden className="size-5" />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export function RewardEditor({ id }: { id?: string }) {
  const query = useRewards()
  const rewards = query.data
  if (id && !rewards) return <ReadStatus query={query} subject="a recompensa" />
  const reward = id ? rewards?.find((r) => r.id === id) : undefined
  if (id && !reward) return <Header title="Recompensa não encontrada" back />
  return <RewardForm reward={reward} />
}

function RewardForm({ reward }: { reward?: Reward }) {
  const { callGuardian } = useGuardian()
  const action = useAction()
  const [name, setName] = useState(reward?.name ?? '')
  const [icon, setIcon] = useState(reward?.icon ?? EMOJI.rewards[0])
  const [cost, setCost] = useState(reward?.cost ?? 20)

  function submit(event: FormEvent) {
    event.preventDefault()
    action.mutate(() => callGuardian('save_reward', { p_id: reward?.id, p_name: name, p_icon: icon, p_cost: cost }), {
      onSuccess: () => window.history.back(),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Header title={reward ? 'Editar recompensa' : 'Nova recompensa'} back />
      <Field label="Nome">
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} className={INPUT} />
      </Field>
      <p className="-mt-2 text-sm font-semibold text-muted">Ideias: tempo junto, escolher o jantar, um passeio. Doce e tela, com moderação.</p>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Ícone</span>
        <EmojiPicker label="Ícone" options={EMOJI.rewards} value={icon} onChange={(e) => e && setIcon(e)} freeText />
      </div>
      <Stepper label="Custo em pontos" value={cost} min={1} onChange={setCost} />
      <ErrorText>{action.errorText}</ErrorText>
      <button type="submit" disabled={action.isPending} className={PRIMARY}>
        Salvar recompensa
      </button>
    </form>
  )
}
