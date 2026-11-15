import confetti from 'canvas-confetti'
import { useEffect, useSyncExternalStore } from 'react'
import { playSound, type SoundName } from '../lib/sound.ts'
import type { Profile } from '../lib/supabase.ts'
import { speak, speechAvailable } from './speech.ts'

function mixWithWhite(hex: string, amount: number) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  if (Number.isNaN(n) || hex.length < 7) return '#ffffff'
  const channel = (shift: number) => Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * amount)
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, '0')).join('')}`
}

const origin = (rect: DOMRect) => ({
  x: (rect.left + rect.width / 2) / window.innerWidth,
  y: (rect.top + rect.height / 2) / window.innerHeight,
})

// Motion's useReducedMotion reads the device setting once; this follows changes while the screen is open.
const deviceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const subscribeDevice = (onChange: () => void) => {
  deviceQuery.addEventListener('change', onChange)
  return () => deviceQuery.removeEventListener('change', onChange)
}

/** Clears every particle on screen. */
export function clearParticles() {
  confetti.reset()
}

export type Fx = ReturnType<typeof useChildFx>

/**
 * Every sensory effect on the child screen goes through here, so the profile's options apply in one place.
 * `sounds` off silences sound and vibration; `read_aloud` off silences speech. Reduced motion (the profile's or
 * the device's) drops particles, marks the page for the CSS rule in index.css, and is handed to MotionConfig in ChildApp.
 */
export function useChildFx(profile: Profile) {
  const deviceReduced = useSyncExternalStore(subscribeDevice, () => deviceQuery.matches)
  const reduced = profile.reduced_motion || deviceReduced
  const colors = [profile.color, mixWithWhite(profile.color, 0.45), '#ffc83d', '#ffe48a']

  useEffect(() => {
    if (!reduced) return
    clearParticles()
    document.documentElement.dataset.reducedMotion = ''
    return () => void delete document.documentElement.dataset.reducedMotion
  }, [reduced])

  return {
    reduced,
    play: (name: SoundName, volume?: number) => profile.sounds && playSound(name, volume),
    // navigator.vibrate is missing on iPhone, so the optional call is the whole feature check.
    buzz: (pattern: number | number[]) => profile.sounds && navigator.vibrate?.(pattern),
    /** Reads `text` aloud when the profile asks for it, and says whether it did. */
    say: (text: string) => {
      if (!profile.read_aloud || !speechAvailable) return false
      speak(text)
      return true
    },
    /** The 8 stars of a task, short enough to end inside the task's 750 ms. */
    stars: (rect: DOMRect) => {
      if (reduced) return
      void confetti({
        particleCount: 8,
        spread: 45,
        startVelocity: 10,
        gravity: 0.9,
        decay: 0.9,
        ticks: 28,
        scalar: 0.65,
        shapes: ['star'],
        colors,
        origin: origin(rect),
      })
    },
    /** Day complete: two side bursts of 16. */
    party: () => {
      if (reduced) return
      for (const [x, angle] of [
        [0.1, 60],
        [0.9, 120],
      ]) {
        void confetti({
          particleCount: 16,
          angle,
          spread: 45,
          startVelocity: 18,
          gravity: 1,
          decay: 0.9,
          ticks: 55,
          scalar: 0.75,
          origin: { x, y: 0.7 },
          colors,
          shapes: ['star', 'circle'],
        })
      }
    },
    /** Confirmed redemption: one local burst of 40. */
    burst: () => {
      if (reduced) return
      void confetti({
        particleCount: 40,
        spread: 60,
        startVelocity: 16,
        gravity: 0.9,
        decay: 0.9,
        ticks: 55,
        scalar: 0.7,
        origin: { x: 0.5, y: 0.8 },
        colors,
        shapes: ['star', 'circle'],
      })
    },
  }
}
