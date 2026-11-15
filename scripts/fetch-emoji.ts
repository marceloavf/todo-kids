import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { EMOJI_FILES } from '../src/lib/emoji-set.ts'

const TAG = 'v2026-09-24-unicode18_0'
const BASE = `https://raw.githubusercontent.com/googlefonts/noto-emoji/${TAG}/2D/svg`
const DIR = 'public/emoji'

// Kept as raw bytes because some SVGs declare a non-UTF-8 encoding.
async function download(name: string, expect: RegExp) {
  const response = await fetch(`${BASE}/${name}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!response.ok || !expect.test(bytes.toString('latin1'))) throw new Error(`${name}: HTTP ${response.status}`)
  writeFileSync(`${DIR}/${name}`, bytes)
}

mkdirSync(DIR, { recursive: true })
await download('LICENSE', /Apache License/)
let fetched = 0
for (const file of EMOJI_FILES) {
  if (existsSync(`${DIR}/${file}`)) continue
  await download(file, /<svg[\s>]/)
  fetched++
}
console.log(`${EMOJI_FILES.size} emoji in the set, ${fetched} downloaded from Noto Emoji ${TAG}.`)
