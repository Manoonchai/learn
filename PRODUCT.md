# Product

## Register

product

## Users

Thai typists deliberately learning the **Manoonchai** keyboard layout (the
"Dvorak of Thai", an ergonomically re-engineered alternative to the standard
Kedmanee layout). They already type Thai fluently on another layout and are
retraining muscle memory. Context: sitting at a physical keyboard, full focus,
repeating short drills to build speed and accuracy. The job: practice a specific
character group until the new key positions feel automatic, and watch speed climb.

## Product Purpose

A browser typing trainer that teaches Manoonchai without the user having to
reconfigure their OS, by translating physical key positions into Manoonchai
characters in-app. Lessons introduce characters in a deliberate order; each drill
is a timed run of sampled words with live feedback (next-key keymap glow, prefix
spellcheck) and honest post-drill stats (raw WPM, net WPM, accuracy). Success: a
learner returns daily, climbs the lesson order, and sees their WPM curve rise.

## Brand Personality

A focused instrument. Calm, precise, keyboard-centric. Three words: **precise,
quiet, tactile**. The interface recedes so the typing line and the keymap are the
heroes; the single moment of energy is the next-key glow. Serious tool for adults,
not a game.

## Anti-references

- **Generic SaaS / AI-slop**: no cream-bg + single-accent template, no identical
  card grids, no tiny-uppercase tracked eyebrows, nothing that reads "AI generated".
- **Childish edu-app**: no mascots, confetti, primary-color gamification, or badge
  soup.
- **v1's unthemed look**: no Tailwind-default gray buttons, default green, or the
  neon multi-layer box-shadow glow. Fresh identity.
- **A literal Monkeytype clone**: borrow the genre's restraint, not its exact
  mono-amber-on-charcoal appearance.

## Design Principles

1. **The instrument is the layout.** The keymap and the typing line are the product;
   chrome stays out of their way.
2. **One moment of energy.** Restraint everywhere so the next-key cue and a finished
   drill land with impact. Glow is earned, not ambient.
3. **Honest readouts.** Stats say exactly what they measure (raw vs net WPM, accuracy);
   no flattering or mislabeled numbers.
4. **Feedback never depends on color alone.** Correct / error / next states also carry
   shape, weight, or motion, since the entire loop is red/green.
5. **Thai-first typography.** Thai script is the primary content, set to read
   beautifully at size, not as an afterthought to a Latin UI.

## Accessibility & Inclusion

WCAG 2.1 AA contrast across light and dark themes. Full keyboard operability (it is a
typing app: every action reachable without a mouse). `prefers-reduced-motion` honored
on every animation (glow, chart draw, drill transitions degrade to instant/crossfade).
State color is always paired with a non-color cue.
