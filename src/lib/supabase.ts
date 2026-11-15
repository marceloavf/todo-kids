import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types.ts'

export type Functions = Database['public']['Functions']
export type Tables = Database['public']['Tables']
export type Profile = Tables['profiles']['Row']
export type Reward = Tables['rewards']['Row']
export type Redemption = Tables['redemptions']['Row']

// The auth session is persisted by supabase-js so a device signs in once. Nothing else of ours goes there.
export const supabase = createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

type UntypedRpc = (fn: string, args: object) => PromiseLike<{ data: unknown; error: { message: string } | null }>

/**
 * Calls a database function and throws its error, whose `message` is an ErrorKey.
 * supabase.rpc() cannot be typed over a generic function name, so this signature carries the types instead.
 */
export async function callRpc<F extends keyof Functions>(fn: F, args: Functions[F]['Args']): Promise<Functions[F]['Returns']> {
  const { data, error } = await (supabase.rpc.bind(supabase) as unknown as UntypedRpc)(fn, args)
  if (error) throw error
  return data as Functions[F]['Returns']
}
