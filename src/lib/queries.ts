import { useQuery } from '@tanstack/react-query'
import { parseTodayRows } from './parse.ts'
import { supabase } from './supabase.ts'

export const queryKeys = {
  family: ['family'],
  profiles: ['profiles'],
  today: ['today'],
  rewards: ['rewards'],
  redemptions: ['redemptions'],
  approvals: ['approvals'],
  routines: ['routines'],
  tasks: ['tasks'],
  completions: ['completions'],
  statement: ['statement'],
} as const

/** Which queries a change to each table makes stale. Realtime uses it, and so can any mutation. */
export const TABLE_QUERIES: Record<string, readonly (readonly string[])[]> = {
  families: [queryKeys.family, queryKeys.today],
  profiles: [queryKeys.profiles, queryKeys.today],
  routines: [queryKeys.today, queryKeys.routines],
  tasks: [queryKeys.today, queryKeys.tasks],
  completions: [queryKeys.today, queryKeys.completions],
  statement_entries: [queryKeys.approvals, queryKeys.statement],
  rewards: [queryKeys.rewards],
  redemptions: [queryKeys.redemptions],
}

export async function ok<T>(query: PromiseLike<{ data: T; error: unknown }>): Promise<NonNullable<T>> {
  const { data, error } = await query
  if (error) throw error
  return data as NonNullable<T>
}

export const useFamily = () =>
  useQuery({ queryKey: queryKeys.family, queryFn: () => ok(supabase.from('families').select('*').single()) })

/** Every live profile of the family, guardians first and then children, oldest first within each. */
export const useProfiles = () =>
  useQuery({
    queryKey: queryKeys.profiles,
    queryFn: () => ok(supabase.from('profiles').select('*').is('archived_at', null).order('kind').order('id')),
  })

/** Today's tasks for every child, already in display order: routine order, task order, one-offs last. */
export const useTodayTasks = () =>
  useQuery({ queryKey: queryKeys.today, queryFn: async () => parseTodayRows(await ok(supabase.rpc('today_tasks'))) })

export const useRewards = () =>
  useQuery({
    queryKey: queryKeys.rewards,
    queryFn: () => ok(supabase.from('rewards').select('*').is('archived_at', null).order('cost').order('id')),
  })

export const usePendingRedemptions = () =>
  useQuery({
    queryKey: queryKeys.redemptions,
    queryFn: () => ok(supabase.from('redemptions').select('*').eq('status', 'pending')),
  })

/**
 * Guardian-approved completion credits for a child, newest first. `after()` is read when the query runs:
 * every credit after that time, or only the newest one when it returns null (nothing seen yet on this device).
 */
export const useApprovals = (childId: string, after: () => string | null) =>
  useQuery({
    queryKey: [...queryKeys.approvals, childId],
    queryFn: () => {
      const since = after()
      const query = supabase
        .from('statement_entries')
        .select('id, created_at, amount, description, completion_id, guardian_id')
        .eq('child_id', childId)
        .eq('kind', 'completion')
        .not('guardian_id', 'is', null)
        .order('created_at', { ascending: false })
      return ok(since === null ? query.limit(1) : query.gt('created_at', since))
    },
  })

/** A child's confirmed and refused redemptions with their reward, newest first, with the same `after()` rule. */
export const useDecidedRedemptions = (childId: string, after: () => string | null) =>
  useQuery({
    queryKey: [...queryKeys.redemptions, 'decided', childId],
    queryFn: () => {
      const since = after()
      const query = supabase
        .from('redemptions')
        .select('id, status, cost, decided_at, decided_by, reward:rewards(name, icon)')
        .eq('child_id', childId)
        .neq('status', 'pending')
        .not('decided_at', 'is', null)
        .order('decided_at', { ascending: false })
      return ok(since === null ? query.limit(1) : query.gt('decided_at', since))
    },
  })
