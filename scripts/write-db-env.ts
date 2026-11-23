import { readFileSync, writeFileSync } from 'node:fs'

const keys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const lines = readFileSync(0, 'utf8').split(/\r?\n/)
const values = keys.map((key) => {
  const line = lines.find((entry) => entry.startsWith(`${key}=`))
  if (!line || !line.slice(key.length + 1).replace(/["']/g, '').trim()) {
    throw new Error(`Missing ${key}. Start Docker and run npm run db:start first.`)
  }
  return line
})

writeFileSync('.env.local', `${values.join('\n')}\n`, { mode: 0o600 })
console.log('Wrote local Supabase configuration to .env.local')
