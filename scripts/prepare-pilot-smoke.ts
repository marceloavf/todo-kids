// Provision a fictional family before enabling the closed signup hook in disposable CI.
import { randomUUID } from 'node:crypto'
import { appendFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const url = new URL(process.env.VITE_SUPABASE_URL!)
if (!process.env.GITHUB_ENV || !['localhost', '127.0.0.1'].includes(url.hostname)) {
  throw new Error('The pilot rehearsal requires a local CI stack.')
}
const email = `pilot-${randomUUID()}@todokids.local`
const password = randomUUID()
const admin = createClient(url.href, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
if (error) throw error
appendFileSync(process.env.GITHUB_ENV, `PILOT_TEST_EMAIL=${email}\nPILOT_TEST_PASSWORD=${password}\n`)
