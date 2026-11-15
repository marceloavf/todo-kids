import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react'
import { useRef, useState } from 'react'
import { errorMessage } from '../lib/errors.ts'
import { Emoji } from '../lib/Emoji.tsx'
import type { Redemption, Reward } from '../lib/supabase.ts'
import { BIG_BUTTON, CardDialog } from './CardDialog.tsx'
import type { Fx } from './fx.ts'

/** Recompensas: cost and how much is missing, with the request confirmed in a card like the task card. */
export function Rewards({
  rewards,
  pending,
  balance,
  openRewardId,
  fx,
  online,
  onOpen,
  onClose,
  onRequest,
}: {
  rewards: Reward[]
  pending: Redemption | undefined
  balance: number
  openRewardId: string | undefined
  fx: Fx
  online: boolean
  onOpen: (reward: Reward) => void
  onClose: () => void
  onRequest: (reward: Reward) => Promise<void>
}) {
  const open = rewards.find((r) => r.id === openRewardId)
  const reduced = useReducedMotionConfig()

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Emoji emoji="🎁" className="size-20" />
        <p className="text-2xl font-black">Ainda não há recompensas.</p>
      </div>
    )
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 px-3 pt-1 pb-4">
        {rewards.map((reward) => {
          const requested = pending?.reward_id === reward.id
          const missing = Math.max(reward.cost - balance, 0)
          return (
            <li key={reward.id}>
              <motion.button
                layoutId={`reward-${reward.id}`}
                data-reward={reward.id}
                onClick={() => {
                  fx.play('open', 0.8)
                  onOpen(reward)
                }}
                whileTap={reduced ? undefined : { scale: 0.96 }}
                style={{ borderRadius: 22 }}
                aria-label={`${reward.name}. Custa ${reward.cost} pontos. ${requested ? 'Pedido esperando o responsável' : missing ? `Faltam ${missing}` : 'Dá para pedir'}`}
                className={`relative flex w-full flex-col items-center gap-1.5 border-[3px] px-2 pt-3 pb-2.5 text-center ${requested ? 'border-wait bg-wait-soft' : 'border-line bg-white'}`}
              >
                <Emoji emoji={reward.icon} className="size-14" />
                <span className="line-clamp-2 min-h-10 text-base leading-tight font-extrabold">{reward.name}</span>
                <span className="h-2.5 w-full overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full bg-kid transition-[width] duration-700"
                    style={{ width: `${Math.min(100, (balance / reward.cost) * 100)}%` }}
                  />
                </span>
                <span className="flex items-center gap-1 text-sm font-extrabold text-muted">
                  <Emoji emoji="⭐" className="size-4" /> {reward.cost}
                  {missing > 0 && !requested && ` · faltam ${missing}`}
                </span>
                {requested ? (
                  <span className="flex min-h-11 items-center gap-1 font-black text-wait">
                    <Emoji emoji="⏳" className="size-5" /> Pedido enviado
                  </span>
                ) : (
                  // 20 px black is WCAG large text: white on every palette color clears its 3:1 (18 px did not reach 4.5:1).
                  <span
                    className={`grid min-h-11 w-full place-items-center rounded-2xl text-xl font-black ${missing || pending ? 'bg-line text-muted' : 'bg-kid text-white'}`}
                  >
                    Quero!
                  </span>
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>
      <AnimatePresence>
        {open && (
          <RewardCard
            key={open.id}
            reward={open}
            pending={pending}
            balance={balance}
            fx={fx}
            online={online}
            onClose={onClose}
            onRequest={onRequest}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function RewardCard({
  reward,
  pending,
  balance,
  fx,
  online,
  onClose,
  onRequest,
}: {
  reward: Reward
  pending: Redemption | undefined
  balance: number
  fx: Fx
  online: boolean
  onClose: () => void
  onRequest: (reward: Reward) => Promise<void>
}) {
  const inFlight = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const missing = Math.max(reward.cost - balance, 0)

  async function request(armed: boolean) {
    if (!armed || !online || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError(null)
    try {
      await onRequest(reward)
    } catch (caught) {
      inFlight.current = false
      setBusy(false)
      setError(errorMessage(caught))
      fx.play('error')
    }
  }

  const blocked =
    pending?.reward_id === reward.id
      ? 'Pedido enviado. Esperando o responsável.'
      : pending
        ? 'Você já tem um pedido esperando. Quando o responsável responder, dá para pedir outro.'
        : missing > 0
          ? `Faltam ${missing} pontos. Continue fazendo as tarefas!`
          : null

  return (
    <CardDialog layoutId={`reward-${reward.id}`} onClose={onClose}>
      {({ armed, titleId }) => (
        <>
          <div className="flex flex-col items-center gap-3 overflow-y-auto px-6 pt-8 pb-4 text-center">
            <Emoji emoji={reward.icon} className="size-28 [@media(max-height:700px)]:size-20" />
            <h2 id={titleId} className="text-3xl leading-tight font-black">
              {reward.name}
            </h2>
            <p className="flex items-center gap-1.5 rounded-full bg-kid-soft px-3 py-1 text-lg font-black text-kid-ink">
              <Emoji emoji="⭐" className="size-5" /> {reward.cost} pontos
            </p>
            {!blocked && (
              <p className="text-lg font-semibold text-muted">Um responsável confirma o pedido e desconta os pontos.</p>
            )}
          </div>
          <div className="border-t-2 border-line p-4">
            {blocked ? (
              <p className="flex min-h-20 items-center justify-center text-center text-xl font-black text-wait">{blocked}</p>
            ) : (
              <>
                <p aria-live="polite" className="mb-2 text-center font-bold text-[#b3261e] empty:hidden">
                  {!online ? 'Sem internet. Tente quando a conexão voltar.' : error}
                </p>
                <button
                  onClick={() => request(armed)}
                  disabled={busy || !online}
                  aria-disabled={!armed}
                  className={`${BIG_BUTTON} ${armed ? '' : 'opacity-70'}`}
                >
                  {busy ? '…' : 'Quero!'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </CardDialog>
  )
}
