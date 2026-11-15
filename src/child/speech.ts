export const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

let pending: (() => void) | null = null

// pt-BR before other Portuguese, and an on-device voice before a network one, which can lag or fail offline.
function ptVoice() {
  const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase()
  const voices = speechSynthesis.getVoices().filter((v) => lang(v).startsWith('pt'))
  const brazilian = voices.filter((v) => lang(v) === 'pt-br')
  return brazilian.find((v) => v.localService) ?? brazilian[0] ?? voices.find((v) => v.localService) ?? voices[0]
}

/** Reads text in pt-BR. Voices load asynchronously, so a first call waits briefly for them. */
export function speak(text: string) {
  if (!speechAvailable) return
  stopSpeaking()
  let done = false
  const go = () => {
    if (done) return
    done = true
    pending = null
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.95
    const voice = ptVoice()
    if (voice) utterance.voice = voice
    speechSynthesis.speak(utterance)
  }
  if (speechSynthesis.getVoices().length > 0) return go()
  const timer = setTimeout(go, 700)
  speechSynthesis.addEventListener('voiceschanged', go, { once: true })
  pending = () => {
    done = true
    clearTimeout(timer)
    speechSynthesis.removeEventListener('voiceschanged', go)
  }
}

export function stopSpeaking() {
  if (!speechAvailable) return
  pending?.()
  pending = null
  speechSynthesis.cancel()
}
