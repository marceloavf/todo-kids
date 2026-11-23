import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '../lib/errors.ts'
import { ok, queryKeys, useFamily } from '../lib/queries.ts'
import { supabase, type Tables } from '../lib/supabase.ts'
import { useCalendarDay } from '../lib/family-day.ts'
import { addDays } from './dates.ts'

export type Routine = Tables['routines']['Row']
export type Task = Tables['tasks']['Row']

/** Today in the family's timezone, or null until the family loads. */
export function useFamilyToday(): string | null {
  const { data: family } = useFamily()
  return useCalendarDay(family?.timezone)
}

export const useRoutines = () =>
  useQuery({
    queryKey: queryKeys.routines,
    queryFn: () => ok(supabase.from('routines').select('*').is('archived_at', null).order('position').order('id')),
  })

export const useRoutineTasks = (routineId: string) =>
  useQuery({
    queryKey: [...queryKeys.tasks, routineId],
    queryFn: () =>
      ok(supabase.from('tasks').select('*').eq('routine_id', routineId).is('archived_at', null).order('position').order('id')),
  })

export const useUpcomingOneOffs = (today: string | null) =>
  useQuery({
    queryKey: [...queryKeys.tasks, 'one-off', today],
    enabled: today !== null,
    queryFn: () =>
      ok(
        supabase
          .from('tasks')
          .select('*')
          .is('routine_id', null)
          .is('archived_at', null)
          .gte('one_off_date', today!)
          .order('one_off_date')
          .order('id'),
      ),
  })

export const useTask = (id: string | undefined) =>
  useQuery({ queryKey: [...queryKeys.tasks, 'one', id], enabled: id !== undefined, queryFn: () => ok(supabase.from('tasks').select('*').eq('id', id!).single()) })

export const usePendingCompletions = () =>
  useQuery({
    queryKey: [...queryKeys.completions, 'pending'],
    queryFn: () =>
      ok(
        supabase
          .from('completions')
          .select('*, task:tasks(name, icon)')
          .eq('status', 'pending')
          .order('day')
          .order('created_at'),
      ),
  })

// A redemption keeps pointing at its reward after the reward is archived, so it embeds the reward instead of reading the live list.
export const usePendingRedemptionsWithReward = () =>
  useQuery({
    queryKey: [...queryKeys.redemptions, 'guardian'],
    queryFn: () =>
      ok(supabase.from('redemptions').select('*, reward:rewards(name, icon)').eq('status', 'pending').order('created_at')),
  })

export const RECENT_APPROVED_DAYS = 14

export const useRecentApproved = (childId: string, today: string | null) =>
  useQuery({
    queryKey: [...queryKeys.completions, 'approved', childId, today],
    enabled: today !== null,
    queryFn: () =>
      ok(
        supabase
          .from('completions')
          .select('*, task:tasks(name, icon)')
          .eq('child_id', childId)
          .eq('status', 'approved')
          .gte('day', addDays(today!, -RECENT_APPROVED_DAYS))
          .order('day', { ascending: false })
          .order('created_at', { ascending: false }),
      ),
  })

export const useStatement = (childId: string) =>
  useInfiniteQuery({
    queryKey: [...queryKeys.statement, childId],
    initialPageParam: null as { created_at: string; id: string } | null,
    queryFn: ({ pageParam }) => {
      let query = supabase.from('statement_entries').select('*').eq('child_id', childId)
      if (pageParam) {
        const { created_at, id } = pageParam
        query = query.or(`created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`)
      }
      return ok(query.order('created_at', { ascending: false }).order('id', { ascending: false }).limit(100))
    },
    getNextPageParam: (rows) => rows.length === 100 ? rows.at(-1) : undefined,
  })

/** Every profile's name, archived ones included, so the Extrato can still say who decided. */
export const useProfileNames = () =>
  useQuery({
    queryKey: [...queryKeys.profiles, 'names'],
    queryFn: async () => new Map((await ok(supabase.from('profiles').select('id, name'))).map((p) => [p.id, p.name])),
  })

/**
 * Runs one guardian write. While it runs `isPending` disables the form; afterwards every query refetches,
 * success or not, since a failed write may mean the screen is stale. `errorText` is ready for display.
 */
export function useAction() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (write: () => Promise<unknown>) => write(),
    onSettled: () => queryClient.invalidateQueries(),
  })
  return { ...mutation, errorText: mutation.error ? errorMessage(mutation.error) : null }
}
