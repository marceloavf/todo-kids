// Kenney CC0 packs, converted to 22 kHz mono WAV because iPhone Safari may not decode the original OGG.
const SOUNDS = {
  tap: 'tap.wav', // Interface Sounds, select_002
  open: 'open.wav', // Interface Sounds, maximize_008
  done: 'done.wav', // Interface Sounds, confirmation_002
  points: 'points.wav', // Interface Sounds, glass_002
  pending: 'pending.wav', // Interface Sounds, drop_002
  reward: 'reward.wav', // Interface Sounds, confirmation_004
  error: 'error.wav', // Interface Sounds, error_008
  day: 'day.wav', // Music Jingles, jingles_PIZZI03
} as const

export type SoundName = keyof typeof SOUNDS

let context: AudioContext | null = null
const buffers = new Map<SoundName, AudioBuffer>()
const playing = new Set<AudioBufferSourceNode>()

function load(ctx: AudioContext) {
  for (const [name, file] of Object.entries(SOUNDS) as [SoundName, string][]) {
    fetch(`${import.meta.env.BASE_URL}sounds/${file}`)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => buffers.set(name, buffer))
      .catch(() => {})
  }
}

/**
 * Browsers only start audio from a user gesture, so a tap creates and resumes the context. The listeners stay:
 * iPhone suspends or interrupts the context after a call, a lock or another app's audio, and the next tap resumes it.
 */
export function keepAudioUnlocked() {
  const resume = () => {
    if (!context || context.state === 'closed') {
      context = new AudioContext()
      load(context)
    }
    // `state` can also be iPhone's 'interrupted', which the DOM types don't list.
    if (context.state !== 'running') context.resume().catch(() => {})
  }
  for (const event of ['pointerdown', 'touchend', 'click', 'keydown']) window.addEventListener(event, resume, true)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && context) resume()
  })
}

export function playSound(name: SoundName, volume = 1) {
  const buffer = buffers.get(name)
  if (!context || context.state !== 'running' || !buffer) return
  const source = context.createBufferSource()
  const gain = context.createGain()
  gain.gain.value = volume
  source.buffer = buffer
  source.connect(gain).connect(context.destination)
  source.onended = () => playing.delete(source)
  playing.add(source)
  source.start()
}

/** Cuts every sound still playing, such as the day jingle when the child leaves the screen. */
export function stopSounds() {
  for (const source of playing) source.stop()
  playing.clear()
}
