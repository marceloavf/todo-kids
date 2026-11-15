// `supabase db reset` can return while Auth is restarting and PostgREST is still reconnecting.
// PostgREST answers its root from cache even without a database, so the check reads a table.
const url = process.env.VITE_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const headers = { apikey: key, authorization: `Bearer ${key}` }

async function ready() {
  try {
    const [rest, auth] = await Promise.all([
      fetch(`${url}/rest/v1/families?select=id&limit=1`, { headers }),
      fetch(`${url}/auth/v1/health`, { headers }),
    ])
    return rest.ok && auth.ok
  } catch {
    return false
  }
}

const deadline = Date.now() + 60_000
while (!(await ready())) {
  if (Date.now() > deadline) throw new Error('The local Supabase API did not come back within 60 seconds')
  await new Promise((resolve) => setTimeout(resolve, 500))
}
