import { useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { AnimatePresence, MotionConfig, animate, motion, useAnimate, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCalendarDay } from '../lib/family-day.ts'
import { ReadStatus } from '../lib/ReadStatus.tsx'
import { Emoji } from '../lib/Emoji.tsx'
import { useOnline } from '../lib/online.ts'
import type { TodayTask } from '../lib/parse.ts'
import {
  queryKeys,
  useApprovals,
  useDecidedRedemptions,
  useFamily,
  usePendingRedemptions,
  useProfiles,
  useRewards,
  useTodayTasks,
} from '../lib/queries.ts'
import { navigate, useRoute } from '../lib/route.ts'
import { useSession } from '../lib/session.tsx'
import { stopSounds } from '../lib/sound.ts'
import { callRpc, type Profile, type Redemption, type Reward } from '../lib/supabase.ts'
import { BIG_BUTTON, CardDialog } from './CardDialog.tsx'
import { DayCelebration, NoticeToast, pickDayPhrase, type Notice } from './Celebration.tsx'
import { clearParticles, useChildFx } from './fx.ts'
import { Rewards } from './Rewards.tsx'
import { stopSpeaking } from './speech.ts'
import { Today } from './Today.tsx'

export function ChildApp({ profileId }: { profileId: string }) {
  const { leaveProfile } = useSession()
  const profilesQuery = useProfiles()
  const { data: profiles, isSuccess } = profilesQuery
  const profile = profiles?.find((p) => p.id === profileId && p.kind === 'child')

  // Archived or gone (another device changed the family): back to the picker.
  useEffect(() => {
    if (isSuccess && !profile) leaveProfile()
  }, [isSuccess, profile, leaveProfile])

  useEffect(() => {
    if (!profile) return
    document.documentElement.style.setProperty('--kid', profile.color)
    const channels = profile.color.slice(1).match(/../g)?.map(hex => {
      const value = parseInt(hex, 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    const light = channels && channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179
    document.documentElement.style.setProperty('--on-kid', light ? '#000' : '#fff')
    return () => {
      document.documentElement.style.removeProperty('--on-kid')
      document.documentElement.style.removeProperty('--kid')
    }
  }, [profile])

  return profile ? <ChildArea profile={profile} /> : <ReadStatus query={profilesQuery} subject="o perfil" />
}

type Flight = { from: DOMRect; to: DOMRect; points: number }

// Cards are history entries (#/hoje/<id>) so Android back closes them. Reading the live hash keeps a second close from leaving the area.
function closeCard() {
  if (window.location.hash.split('/').length > 2) window.history.back()
}

const EPOCH = '1970-01-01T00:00:00+00:00'
type MarkerKind = 'approval' | 'redemption'
const markerKey = (kind: MarkerKind, childId: string) => `todo-kids:last-${kind}:${childId}`
const memoryMarkers = new Map<string, string>()

// The one use of localStorage: which guardian approval and redemption decision this device last showed each child.
function readMarker(kind: MarkerKind, childId: string): string | null {
  const key = markerKey(kind, childId)
  try {
    return localStorage.getItem(key) ?? memoryMarkers.get(key) ?? null
  } catch {
    return memoryMarkers.get(key) ?? null
  }
}

function writeMarker(kind: MarkerKind, childId: string, value: string) {
  const key = markerKey(kind, childId)
  memoryMarkers.set(key, value)
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private mode or blocked storage: the in-memory marker still prevents repeats while the page is open.
  }
}

/**
 * Moves the marker past `rows` (newest first) and returns the ones not shown yet on this device.
 * On a device's first visit nothing is new: the marker starts at the newest row, so old history is never celebrated.
 */
function takeUnseen<T>(kind: MarkerKind, childId: string, rows: T[], at: (row: T) => string): T[] {
  const seen = readMarker(kind, childId)
  const fresh = rows.filter((row) => seen === null || at(row) > seen)
  const newest = fresh[0] ? at(fresh[0]) : seen === null ? EPOCH : null
  if (newest) writeMarker(kind, childId, newest)
  return seen === null ? [] : fresh
}

function ChildArea({ profile }: { profile: Profile }) {
  const route = useRoute()
  const online = useOnline()
  const queryClient = useQueryClient()
  const { session, leaveProfile } = useSession()
  const fx = useChildFx(profile)
  const { data: family } = useFamily()
  const calendarDay = useCalendarDay(family?.timezone)
  const [dayNotice, setDayNotice] = useState('')
  const openDay = useRef<string | null>(null)
  const dayChanged = useCallback(() => {
    openDay.current = null
    navigate('hoje', { replace: true })
    setDayNotice('O dia mudou. Escolha uma tarefa de hoje.')
    void queryClient.invalidateQueries({ queryKey: queryKeys.today })
  }, [queryClient])
  const { data: profiles } = useProfiles()
  const todayQuery = useTodayTasks()
  const allTasks = todayQuery.data
  const rewardsQuery = useRewards()
  const pendingQuery = usePendingRedemptions()
  const redemptions = pendingQuery.data ?? []
  const tasks = (allTasks ?? []).filter((t) => t.child_id === profile.id)
  useEffect(() => {
    if (!route[1] || route[0] !== 'hoje') openDay.current = null
    if (openDay.current && calendarDay && openDay.current !== calendarDay) dayChanged()
  }, [calendarDay, route, dayChanged])
  const pending = redemptions.find((r) => r.child_id === profile.id)
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const waitingCount = tasks.filter((t) => t.status === 'pending').length
  const guardians = (profiles ?? []).filter((p) => p.kind === 'guardian')
  const onlyGuardian = guardians.length === 1 ? guardians[0].name : null

  const [flight, setFlight] = useState<Flight | null>(null)
  const [heldBalance, setHeldBalance] = useState<number | null>(null)
  const [dayPhrase, setDayPhrase] = useState<string | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [confirmLeave, setConfirmLeave] = useState(false)
  // Tile taps right after a mark are the tail of the same tapping, not a new choice.
  const [cooling, setCooling] = useState(false)

  // Every delayed effect goes through `later`, so leaving the child area cancels it.
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  const later = useCallback((run: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id)
      run()
    }, ms)
    timers.current.add(id)
  }, [])
  // Leaving the child area also cuts sounds still playing. Not on a tab switch, which plays its own tap.
  useEffect(() => {
    const pendingTimers = timers.current
    return () => {
      pendingTimers.forEach(clearTimeout)
      stopSounds()
    }
  }, [])

  const tab = route[0] === 'recompensas' ? 'recompensas' : 'hoje'
  // Switching tabs or leaving the child area stops particles and speech.
  useEffect(
    () => () => {
      clearParticles()
      stopSpeaking()
    },
    [tab],
  )

  // Day complete: only a transition seen on this screen counts, never a day that was already complete on open.
  const allDone = tasks.length > 0 && doneCount === tasks.length
  const day = tasks[0]?.day ?? null
  const lastDay = useRef<{ day: string | null; allDone: boolean } | null>(null)
  // A ref, so the approvals effect in the same commit already knows the day screen is coming.
  const celebratedDay = useRef<string | null>(null)
  useEffect(() => {
    if (!allTasks) return
    const was = lastDay.current
    lastDay.current = { day, allDone }
    if (!was || was.day !== day || was.allDone || !allDone) return
    celebratedDay.current = day
    const phrase = pickDayPhrase()
    // After the last task's own stars and flight, which end within 750 ms.
    later(() => lastDay.current?.day === day && lastDay.current.allDone && setDayPhrase(phrase), fx.reduced ? 0 : 750)
  }, [allTasks, day, allDone, fx.reduced, later])

  const guardianName = useCallback((id: string | null) => profiles?.find((p) => p.id === id)?.name ?? null, [profiles])

  // Guardian approvals: shown live through Realtime, or on the next open, through the per-device marker.
  const { data: approvals } = useApprovals(profile.id, () => readMarker('approval', profile.id))
  useEffect(() => {
    // Waits for today's tasks, which decide whether the day screen takes the approvals' place.
    if (!approvals || !allTasks) return
    const fresh = takeUnseen('approval', profile.id, approvals, (entry) => entry.created_at)
    const mine = allTasks.filter((t) => t.child_id === profile.id)
    const ofToday = fresh.filter((entry) => mine.some((t) => t.completion_id === entry.completion_id))
    // Approvals that complete the day show only the day screen, whichever of the two queries arrives first.
    const closesDay =
      ofToday.length > 0 &&
      (celebratedDay.current === mine[0]?.day ||
        (lastDay.current?.allDone === false &&
          mine.every((t) => t.status === 'done' || ofToday.some((entry) => entry.completion_id === t.completion_id))))
    const shown = closesDay ? fresh.filter((entry) => !ofToday.includes(entry)) : fresh
    if (shown.length === 0) return
    const by = new Set(shown.map((entry) => entry.guardian_id)).size === 1 ? guardianName(shown[0].guardian_id) : null
    const points = shown.reduce((sum, entry) => sum + entry.amount, 0)
    const count = `${shown.length} ${shown.length === 1 ? 'tarefa' : 'tarefas'}`
    setNotices((list) => [
      ...list,
      {
        id: shown[0].id,
        kind: 'approval',
        icon: mine.find((t) => t.completion_id === shown[0].completion_id)?.icon ?? '✅',
        title: by ? `${by} viu!` : 'Conferido!',
        line: points > 0 ? `${count} · +${points}` : count,
        speech: `${by ? `${by} viu` : 'Conferido'}: ${shown.map((entry) => entry.description).join(', ')}.`,
      },
    ])
  }, [approvals, allTasks, profile.id, guardianName])

  // Confirmed and refused redemptions, through their own marker. A pending one vanishing can't say which it was.
  const { data: decided } = useDecidedRedemptions(profile.id, () => readMarker('redemption', profile.id))
  useEffect(() => {
    if (!decided) return
    const fresh = takeUnseen('redemption', profile.id, decided, (r) => r.decided_at ?? EPOCH)
    if (fresh.length === 0) return
    const notices = [...fresh].reverse().map((r): Notice => {
      const by = guardianName(r.decided_by) ?? 'O responsável'
      const line =
        r.status === 'confirmed'
          ? `${by} confirmou o pedido.`
          : `${by} não confirmou agora. Seus pontos continuam com você.`
      const title = r.status === 'confirmed' ? `${r.reward.name}!` : r.reward.name
      return { id: r.id, kind: r.status === 'confirmed' ? 'confirmed' : 'refused', icon: r.reward.icon, title, line, speech: `${title} ${line}` }
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotices((list) => [...list, ...notices])
  }, [decided, profile.id, guardianName])

  async function markTask(task: TodayTask) {
    const flies = task.points > 0 && !task.requires_approval && !fx.reduced
    // Holds the shown balance until the points chip takes off, so the count runs with the flight.
    if (flies) setHeldBalance(profile.balance)
    let completion
    try {
      completion = await callRpc('complete_task', { p_task_id: task.task_id, p_child_id: profile.id, p_expected_day: openDay.current ?? task.day })
    } catch (error) {
      setHeldBalance(null)
      if (error && typeof error === 'object' && 'message' in error && error.message === 'family_day_changed') dayChanged()
      throw error
    }
    const status = completion.status === 'approved' ? 'done' : 'pending'
    // Marking again clears a "do it again" note.
    queryClient.setQueryData<TodayTask[]>(queryKeys.today, (rows) =>
      rows?.map((row) =>
        row.task_id === task.task_id && row.child_id === profile.id && row.day === completion.day
          ? { ...row, status, completion_id: completion.id, rejected_by_name: null, hint: null }
          : row,
      ),
    )
    void queryClient.invalidateQueries({ queryKey: queryKeys.today })
    void queryClient.invalidateQueries({ queryKey: queryKeys.profiles })
    closeCard()
    setCooling(true)
    later(() => setCooling(false), 900)

    if (status === 'pending') {
      setHeldBalance(null)
      fx.play('pending')
      fx.buzz(20)
      return
    }
    fx.play('done')
    fx.buzz([30, 50, 30])
    if (fx.reduced) return setHeldBalance(null)
    // Waits for the card to shrink back into the tile, so the stars come out of the tile itself.
    later(() => {
      setHeldBalance(null)
      const from = document.querySelector(`[data-tile="${task.task_id}"]`)?.getBoundingClientRect()
      const to = document.querySelector('[data-saldo]')?.getBoundingClientRect()
      if (!from) return
      fx.stars(from)
      if (flies && to && completion.points > 0) setFlight({ from, to, points: completion.points })
    }, 250)
  }

  async function requestReward(reward: Reward) {
    const redemption = await callRpc('request_redemption', { p_reward_id: reward.id, p_child_id: profile.id })
    queryClient.setQueryData<Redemption[]>(queryKeys.redemptions, (rows) => [...(rows ?? []), redemption])
    void queryClient.invalidateQueries({ queryKey: queryKeys.redemptions })
    closeCard()
    // A request is not a reward yet: a neutral sound, no party.
    fx.play('pending')
    fx.buzz(20)
  }

  const weekday = family
    ? new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: family.timezone }).format(new Date()).replace('-feira', '')
    : ''

  const progress = `${doneCount} ${doneCount === 1 ? 'feita' : 'feitas'}${waitingCount > 0 ? ` · ${waitingCount} esperando` : ''}`
  const width = (count: number) => `${tasks.length ? (count / tasks.length) * 100 : 0}%`
  // MotionConfig's reduced motion keeps width animations, so the bar opts out itself.
  const barTransition = fx.reduced ? { duration: 0 } : { type: 'tween' as const, duration: 0.25, ease: [0.2, 0, 0, 1] as const }
  // Notices wait until no card or day screen is open, so they never talk over a card being read.
  const notice = route[1] || confirmLeave || dayPhrase ? undefined : notices[0]

  return (
    <MotionConfig reducedMotion={fx.reduced ? 'always' : 'never'}>
      <div className="flex h-dvh flex-col">
        <header className="pt-safe shrink-0 px-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.span
              layoutId={`avatar-${profile.id}`}
              className="grid size-14 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: profile.color }}
            >
              <Emoji emoji={profile.avatar} className="size-9" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl leading-tight font-black">{profile.name}</h1>
              <p className="text-sm font-bold text-muted">{weekday ? `Hoje, ${weekday}` : 'Hoje'}</p>
            </div>
            <SaldoPill value={heldBalance ?? profile.balance} reduced={fx.reduced} />
          </div>
          {tasks.length > 0 && (
            <>
              <div
                className="mt-3 flex h-3.5 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={tasks.length}
                aria-valuenow={doneCount}
                aria-valuetext={progress}
                aria-label="Tarefas feitas hoje"
              >
                <motion.div className="h-full bg-kid" initial={false} animate={{ width: width(doneCount) }} transition={barTransition} />
                {/* Waiting tasks are striped in the waiting color: counted as marked, never as credited. */}
                <motion.div
                  className="h-full bg-[repeating-linear-gradient(135deg,var(--color-wait)_0_3px,transparent_3px_7px)]"
                  initial={false}
                  animate={{ width: width(waitingCount) }}
                  transition={barTransition}
                />
              </div>
              <p className="mt-1 text-sm font-extrabold text-muted">{progress}</p>
            </>
          )}
        </header>

        <motion.main layoutScroll className="flex-1 overflow-x-hidden overflow-y-auto">
          {tab === 'hoje' ? (
            <>
              {dayNotice && <p role="status" className="px-4 py-2 font-bold">{dayNotice}</p>}
              {todayQuery.isError && (
                <div role="status" className="mx-3 mb-3 rounded-2xl bg-wait-soft p-4 font-bold">
                  <p>{allTasks ? 'Não conseguimos atualizar suas tarefas.' : 'Não conseguimos carregar suas tarefas.'}</p>
                  <button className="mt-1 min-h-12 underline" onClick={() => void todayQuery.refetch()}>Tentar de novo</button>
                </div>
              )}
              {!allTasks && todayQuery.isPending && <p role="status" className="p-4 font-bold">Carregando suas tarefas…</p>}
              {allTasks && <Today
                tasks={tasks}
                openTaskId={route[1]}
                guardianName={onlyGuardian}
                fx={fx}
                online={online}
                tapsLocked={cooling || dayPhrase !== null}
                onOpen={(task) => {
                  openDay.current = task.day
                  setDayNotice('')
                  navigate(`hoje/${task.task_id}`)
                }}
                onClose={closeCard}
                onMark={markTask}
              />}
            </>
          ) : (
            <>
              <ReadStatus query={rewardsQuery} subject="as recompensas" />
              <ReadStatus query={pendingQuery} subject="os pedidos" />
              {rewardsQuery.data && pendingQuery.data && <Rewards
              rewards={rewardsQuery.data}
              pending={pending}
              balance={profile.balance}
              openRewardId={route[1]}
              fx={fx}
              online={online}
              onOpen={(reward) => navigate(`recompensas/${reward.id}`)}
              onClose={closeCard}
              onRequest={requestReward}
              />}
            </>
          )}
          {/* Small, muted, and confirmed in a card with an armed button elsewhere on screen, so a stray tap never leaves. */}
          {session.kind !== 'device' && <motion.button
            layoutId="leave-profile"
            onClick={() => setConfirmLeave(true)}
            className="mx-auto mt-4 mb-6 flex min-h-11 items-center gap-1.5 px-4 text-sm font-bold text-muted"
          >
            <Users aria-hidden className="size-4" /> Trocar de perfil
          </motion.button>}
        </motion.main>

        <nav className="pb-safe flex shrink-0 border-t-2 border-line bg-white" aria-label="Seções">
          {(
            [
              ['hoje', '☀️', 'Hoje'],
              ['recompensas', '🎁', 'Recompensas'],
            ] as const
          ).map(([to, icon, label]) => (
            <button
              key={to}
              onClick={() => {
                fx.play('tap', 0.7)
                navigate(to, { replace: true })
              }}
              aria-current={tab === to ? 'page' : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 text-sm font-black ${tab === to ? 'text-kid-ink shadow-[inset_0_4px_0_var(--kid)]' : 'text-muted'}`}
            >
              <Emoji emoji={icon} className="size-8" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {flight && (
        <FlyingPoints
          flight={flight}
          onLand={() => {
            setFlight(null)
            fx.play('points', 0.8)
          }}
        />
      )}
      <AnimatePresence>
        {confirmLeave && (
          <CardDialog layoutId="leave-profile" onClose={() => setConfirmLeave(false)}>
            {({ armed, titleId }) => (
              <div className="flex flex-col items-center gap-4 px-6 pt-16 pb-6 text-center">
                <h2 id={titleId} className="text-2xl font-black">
                  Trocar de perfil?
                </h2>
                <p className="font-semibold text-muted">Volta para a tela "Quem é você?".</p>
                <button
                  onClick={() => armed && leaveProfile()}
                  aria-disabled={!armed}
                  className={`${BIG_BUTTON} ${armed ? '' : 'opacity-70'}`}
                >
                  Trocar
                </button>
              </div>
            )}
          </CardDialog>
        )}
      </AnimatePresence>
      <NoticeToast notice={notice} fx={fx} onDismiss={() => setNotices((list) => list.slice(1))} />
      <AnimatePresence>{dayPhrase && <DayCelebration phrase={dayPhrase} fx={fx} onDismiss={() => setDayPhrase(null)} />}</AnimatePresence>
    </MotionConfig>
  )
}

/** The balance. Counts to a new value in the 360 ms of a points flight and pulses as the chip lands. */
function SaldoPill({ value, reduced }: { value: number; reduced: boolean }) {
  const shown = useMotionValue(value)
  const text = useTransform(shown, (v) => String(Math.round(v)))
  const [scope, animateScope] = useAnimate<HTMLDivElement>()
  const last = useRef(value)

  useEffect(() => {
    const from = last.current
    last.current = value
    if (from === value) return
    if (reduced) return void shown.set(value)
    const count = animate(shown, value, { duration: 0.36, ease: 'easeOut' })
    if (value > from) void animateScope(scope.current, { scale: [1, 1.06, 1] }, { duration: 0.16, delay: 0.2 })
    return () => count.stop()
  }, [value, reduced, shown, animateScope, scope])

  return (
    <div
      ref={scope}
      data-saldo
      role="status"
      aria-label={`Saldo: ${value} pontos`}
      className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-line bg-white py-1.5 pr-4 pl-2.5 text-2xl font-black"
    >
      <Emoji emoji="⭐" className="size-7" />
      <motion.span aria-hidden className="tabular-nums">
        {text}
      </motion.span>
    </div>
  )
}

const center = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/** The "+N" chip that arcs from the tile to the balance pill in 360 ms, both measured when the flight starts. */
function FlyingPoints({ flight, onLand }: { flight: Flight; onLand: () => void }) {
  const from = center(flight.from)
  const to = center(flight.to)

  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[80] -translate-x-1/2 -translate-y-1/2 rounded-full bg-kid px-3 py-1 text-2xl font-black whitespace-nowrap text-[var(--on-kid,white)] shadow-lg"
      initial={{ x: from.x, y: from.y, scale: 0.9, opacity: 0 }}
      animate={{
        x: [from.x, (from.x + to.x) / 2, to.x],
        y: [from.y, Math.max(Math.min(from.y, to.y) - 20, 8), to.y],
        scale: [0.9, 1, 0.8],
        opacity: [0, 1, 1],
      }}
      transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
      onAnimationComplete={onLand}
    >
      +{flight.points}
    </motion.div>,
    document.body,
  )
}
