import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { TABLE_QUERIES } from './queries.ts'
import { supabase } from './supabase.ts'

/**
 * One channel on the family's tables. Row-level security limits the events to this family.
 * Writes made between SUBSCRIBED and Realtime's "Subscribed to PostgreSQL" system message are not delivered,
 * so both moments refetch everything, and TanStack Query also refetches on focus and visibility.
 */
export function useFamilyRealtime(enabled: boolean) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!enabled) return
    const refetchAll = () => void queryClient.invalidateQueries()
    const channel = supabase
      .channel('family')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        for (const queryKey of TABLE_QUERIES[payload.table] ?? []) void queryClient.invalidateQueries({ queryKey })
      })
      .on('system', {}, refetchAll)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') refetchAll()
      })
    return () => void supabase.removeChannel(channel)
  }, [enabled, queryClient])
}
