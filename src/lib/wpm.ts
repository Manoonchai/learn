const CHARS_PER_WORD = 5

export function calculateWpm(chars: string | string[], seconds: number): number {
  if (!seconds || !chars) {
    return 0
  }

  if (Array.isArray(chars)) {
    chars = chars.join('')
  }

  return ((chars.length / CHARS_PER_WORD) * 60) / seconds
}
