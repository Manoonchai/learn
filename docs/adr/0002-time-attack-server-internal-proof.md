# Time Attack is a hint-less, server-internal speed test

Time Attack is a 60-second speed run over the full word set (the Manoonchai
project's own `thai.json`, ~1000 frequency-ordered words), added as a sibling of
the Drill so members can post a result as proof of speed and earn a WPM role in
the project's Discord.

The next-key **glow is forced off** in Time Attack, unlike lesson Drills where it
guides the learner. A speed run is a test, not practice: the glow is a hint that
would inflate WPM and make a posted score meaningless. The keymap itself may stay
on screen as a static reference (it honours PRODUCT.md's "the instrument is the
layout"), but it never highlights the next key. This keeps a Time Attack WPM an
honest reflection of unaided speed.

The shared result is a client-rendered PNG. It is **social-trust proof, not
cryptographic** — any client image is forgeable, and a moderator grants the role
the same way they already trust posted Monkeytype screenshots. Server-signed
results or replay verification were considered and rejected as far too much
machinery for a community honour role.

## Consequences

- Changing the hint behaviour, the duration, or the wordset later silently
  invalidates the comparability of every role already granted. Treat these three
  as a stable contract, not free parameters — revisit via a new ADR, not a tweak.
