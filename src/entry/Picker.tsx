import { motion, useReducedMotion } from 'motion/react'
import { ReadStatus } from '../lib/ReadStatus.tsx'
import { Emoji } from '../lib/Emoji.tsx'
import { useProfiles } from '../lib/queries.ts'
import { navigate, useRoute } from '../lib/route.ts'
import { useSession } from '../lib/session.tsx'
import { playSound } from '../lib/sound.ts'
import type { Profile } from '../lib/supabase.ts'
import { PinPad } from './PinPad.tsx'

/** Perfis. Children enter with one tap on their avatar; a guardian goes through the PIN pad at #/pin/<id>. */
export function Picker() {
  const route = useRoute()
  const { setSession } = useSession()
  const profilesQuery = useProfiles()
  const profiles = profilesQuery.data ?? []
  const reduced = useReducedMotion()
  const children = profiles.filter((p) => p.kind === 'child')
  const guardians = profiles.filter((p) => p.kind === 'guardian')
  const pinGuardian = route[0] === 'pin' ? guardians.find((g) => g.id === route[1]) : undefined

  if (pinGuardian) return <PinPad guardian={pinGuardian} />

  function enterChild(child: Profile) {
    if (child.sounds) playSound('tap')
    setSession({ kind: 'child', profileId: child.id })
    navigate('hoje')
  }

  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-4xl font-black">Quem é você?</h1>
      <ReadStatus query={profilesQuery} subject="os perfis" />
      {profilesQuery.isSuccess && children.length === 0 && guardians.length === 0 && (
        <p className="font-semibold text-muted">Nenhum perfil encontrado.</p>
      )}
      <ul className="grid w-full max-w-80 grid-cols-2 gap-x-4 gap-y-6">
        {children.map((child, i) => (
          <motion.li
            key={child.id}
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6, delay: i * 0.07 }}
          >
            <motion.button
              onClick={() => enterChild(child)}
              whileTap={reduced ? undefined : { scale: 0.9 }}
              className="flex w-full flex-col items-center gap-2"
            >
              <motion.span
                layoutId={`avatar-${child.id}`}
                className="grid size-32 place-items-center rounded-full"
                style={{ backgroundColor: child.color }}
              >
                <Emoji emoji={child.avatar} className="size-20" />
              </motion.span>
              <span className="text-2xl font-black">{child.name}</span>
            </motion.button>
          </motion.li>
        ))}
      </ul>
      {guardians.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-6 border-t-2 border-line pt-6">
          {guardians.map((guardian, i) => (
            <motion.li
              key={guardian.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + (children.length + i) * 0.05 }}
            >
              <button
                onClick={() => navigate(`pin/${guardian.id}`)}
                className="flex min-w-24 flex-col items-center gap-1"
                aria-label={`${guardian.name}, pede PIN`}
              >
                <span className="grid size-16 place-items-center rounded-full bg-line">
                  <Emoji emoji="🔒" className="size-9" />
                </span>
                <span className="text-lg font-extrabold">{guardian.name}</span>
                <span className="text-sm font-bold text-muted">com PIN</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </main>
  )
}
