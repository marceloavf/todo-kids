import { EMOJI_FILES, emojiFileName } from './emoji-set.ts'

export { EMOJI } from './emoji-set.ts'

/**
 * Renders a database emoji as its Noto Emoji SVG, so every device shows the same picture.
 * An emoji outside the copied set falls back to the system glyph. Size it with width and height classes.
 * Decorative unless given a label.
 */
export function Emoji({ emoji, label, className = '' }: { emoji: string; label?: string; className?: string }) {
  const file = emojiFileName(emoji)
  if (!EMOJI_FILES.has(file)) {
    return (
      <span role="img" aria-label={label} aria-hidden={label ? undefined : true} className={`emoji-glyph ${className}`}>
        <span>{emoji}</span>
      </span>
    )
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}emoji/${file}`}
      alt={label ?? ''}
      draggable={false}
      className={`select-none ${className}`}
    />
  )
}
