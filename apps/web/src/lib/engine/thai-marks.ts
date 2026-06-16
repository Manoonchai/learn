// Thai mark positioning for the per-code-point `.letter` renderer (see app.css and
// TypingFlow.svelte). Each code point is its own inline-block box, so a combining mark
// shaped alone sits at a nominal position that can collide with whatever else occupies
// the consonant's above slot. These helpers decide the small CSS nudges that fix that.

/** Tone marks + thanthakhat: ่ ้ ๊ ๋ ์ (U+0E48–U+0E4C). */
export const TONE_RE = /[่-์]/;

/** Above-vowels that sit in the slot a tone would stack onto: ั ิ ี ึ ื ็. */
const ABOVE_VOWEL_RE = /[ัิ-ื็]/;

/** สระอำ / นิคหิต — their circle sits above the consonant: ำ ํ (follow the tone). */
const SARA_AM_RE = /[ำํ]/;

/** Any Thai consonant ก–ฮ (U+0E01–U+0E2E). */
const CONSONANT_RE = /[ก-ฮ]/;

/**
 * Consonants with a tall right-side ascender: ป ผ ฝ พ ฟ ฬ. A tone sitting over the
 * consonant's right edge collides with the ascender, so it nudges left to clear it.
 */
const TALL_CONSONANT_RE = /[ปผฝพฟฬ]/;

/**
 * Position-adjustment class(es) for the code point at `segs[i]`, where `segs` is the
 * word split into one string per code point. Only *above marks* (above-vowels + tone
 * marks) are ever nudged; everything else returns "". Otherwise returns some combination
 * of `tone` + `tone-raise` + `tone-shift` (the CSS hooks in app.css).
 *
 * - `tone-raise` (tones only): the tone stacks on an above-vowel (ทื่อ, สิ้น) or precedes
 *   สระอำ (ต่ำ, น้ำ) — lift it so it clears that mark's circle.
 * - `tone-shift` (any above mark): the base consonant has a tall right ascender
 *   (ป ผ ฝ พ ฟ ฬ) — the mark sits over the ascender, so nudge it left to clear it.
 *   The above-vowel AND the tone above a tall consonant both shift by the same amount,
 *   so they stay aligned (ปี่, ปิ้น, ฟ้า, ปุ่น).
 * So a tone after a below-vowel on a plain consonant (ปู่... wait ป is tall) — e.g. a
 * non-tall case like ดู่ — is neither raised nor shifted.
 */
export function toneClass(segs: string[], i: number): string {
  const seg = segs[i];
  const isTone = TONE_RE.test(seg);
  if (!isTone && !ABOVE_VOWEL_RE.test(seg)) return ""; // only above marks get nudged

  // raise: a tone stacking on an above-vowel, or one preceding สระอำ. Vowels never raise.
  const raise =
    isTone && (ABOVE_VOWEL_RE.test(segs[i - 1] ?? "") || SARA_AM_RE.test(segs[i + 1] ?? ""));

  // shift: base consonant has a tall ascender. The base is the nearest preceding
  // consonant — vowels/marks between are zero-width and ride over it (e.g. ปุ่น: skip
  // the below-vowel ุ back to ป).
  let j = i - 1;
  while (j >= 0 && !CONSONANT_RE.test(segs[j])) j--;
  const shift = j >= 0 && TALL_CONSONANT_RE.test(segs[j]);

  if (!raise && !shift) return "";
  return `tone${raise ? " tone-raise" : ""}${shift ? " tone-shift" : ""}`;
}
