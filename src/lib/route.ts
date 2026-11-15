import { useSyncExternalStore } from 'react'

// Hash routes keep Android's back button working and need no server rewrites on static hosting.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const read = () => window.location.hash.replace(/^#\/?/, '')

/** The current route as path segments: `#/hoje/abc` is `['hoje', 'abc']`, the picker is `[]`. */
export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, read)
  return hash === '' ? [] : hash.split('/')
}

export function navigate(path: string, { replace = false } = {}) {
  const url = `#/${path}`
  if (replace) {
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = url
  }
}
