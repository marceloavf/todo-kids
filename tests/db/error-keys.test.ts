import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { ERROR_KEYS } from '../../src/error-keys.ts'

test('ERROR_KEYS lists exactly the keys the migrations raise', () => {
  const dir = 'supabase/migrations'
  const sql = readdirSync(dir).map((file) => readFileSync(`${dir}/${file}`, 'utf8')).join('\n')
  const raised = [...sql.matchAll(/raise exception '([^']+)'/g)].map((match) => match[1])

  expect([...new Set(raised)].sort()).toEqual([...ERROR_KEYS])
})
