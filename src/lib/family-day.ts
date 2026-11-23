import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { todayIn } from '../guardian/dates.ts'
import { queryKeys } from './queries.ts'

function subscribe(check: () => void) {
  let timer: number
  function tick() {
    check()
    timer = window.setTimeout(tick, 60000 - Date.now() % 60000)
  }
  tick()
  document.addEventListener('visibilitychange', check)
  window.addEventListener('focus', check)
  window.addEventListener('online', check)
  return () => {
    window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', check)
    window.removeEventListener('focus', check)
    window.removeEventListener('online', check)
  }
}

export function useCalendarDay(timezone?: string) {
  const day = useSyncExternalStore(subscribe, () => timezone ? todayIn(timezone) : null)
  const previous = useRef(day)
  const cache = useQueryClient()
  useEffect(() => {
    if (previous.current && day !== previous.current) void cache.invalidateQueries({ queryKey: queryKeys.today })
    previous.current = day
  }, [day, cache])
  return day
}
