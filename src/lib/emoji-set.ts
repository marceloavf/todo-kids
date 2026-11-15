// The Noto Emoji SVGs copied into public/emoji. `npm run emoji:fetch` downloads any that are missing.
export const EMOJI = {
  tasks: [
    '🛏️', '🪥', '🦷', '🚿', '🛁', '🧼', '🚽', '💤', '👕', '👖', '🧦', '👟', '🧥', '🧺', '🧹', '🧽',
    '🪣', '🗑️', '♻️', '🍽️', '🥣', '🥛', '🍎', '🥕', '🥦', '🍳', '🪑', '🚰', '💧', '🥫', '🍱', '🎒',
    '📚', '📖', '📒', '✏️', '🎨', '🎹', '⚽', '🚲', '🧸', '🧩', '📦', '🪴', '🛒', '💊', '🚛', '👀',
    '🙏', '🤝', '🐶', '🐱', '🐟',
  ],
  rewards: [
    '🍦', '🍫', '🍭', '🍪', '🍕', '🍿', '🧁', '🎮', '📺', '🎬', '🛝', '🎡', '🏖️', '🎁', '🎈', '🎟️',
    '🏊', '🛹', '🪁', '🌙', '📱', '🎳',
  ],
  avatars: [
    '🦊', '🦖', '🐶', '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐲',
    '🐙', '🦉', '🐧', '🐢', '🦋', '🐝', '🦕', '🐳', '🦒', '🐘', '🙂',
  ],
  interface: ['⭐', '⏳', '✅', '☀️', '🔒', '🎉', '🏆', '🔊', '✨', '👋', '🥳'],
} as const

// Noto names each file after the code points, dropping the U+FE0F variation selector.
export function emojiFileName(emoji: string): string {
  const codes = [...emoji].map((char) => char.codePointAt(0)!.toString(16)).filter((code) => code !== 'fe0f')
  return `emoji_u${codes.join('_')}.svg`
}

export const EMOJI_FILES: ReadonlySet<string> = new Set(Object.values(EMOJI).flat().map(emojiFileName))
