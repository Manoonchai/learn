# Learn Manoonchai

A browser typing trainer for the **Manoonchai** Thai keyboard layout. The app
translates physical key positions into Manoonchai characters itself, so a learner
can practice the layout without reconfiguring their operating system.

## Language

**Manoonchai layout**:
The Thai keyboard layout this app teaches. A mapping from physical key positions
(`KeyboardEvent.code`) to a base character and a shifted character.
_Avoid_: keymap (that is the on-screen widget, not the data).

**Lesson**:
A named unit of the curriculum, holding a pool of Thai words that introduce a
specific character or group of characters (e.g. "5. -่ (ไม้เอก)"). Lessons are
chosen freely; there is no locking or forced progression.
_Avoid_: level, chapter, exercise.

**Drill**:
One timed run the learner performs: a sequence of words sampled from the active
lesson's pool. The learner picks the length (e.g. 10 / 25 / 50 words). A drill
has a clear start (first keystroke) and end (last word committed).
_Avoid_: sentence, test, round, session.

**Word**:
A single Thai token within a drill, committed by pressing space. The learner's
input is compared against the target word to decide correctness.

**Keystroke**:
One Manoonchai character produced by the learner, recorded with its timestamp and
whether it matched the expected next character. The raw material for all stats.

**Raw WPM**:
Typing speed counting every character typed, correct or not, measured per one-second
window (chars ÷ 5 × 60). Spiky; reflects actual cadence.
_Avoid_: gross WPM.

**Net WPM**:
Speed after penalizing errors — the headline number shown at the end of a drill and
the smoothed line on the chart.
_Avoid_: adjusted WPM, real WPM.

**Accuracy**:
Share of keystrokes that matched the expected character, as a percentage over the
whole drill.

**Keymap**:
The on-screen rendering of the Manoonchai layout. Highlights and glows the next key
the learner should press.
_Avoid_: keyboard (ambiguous with the physical device).

**Next key**:
The character the learner is expected to type next, derived from the target word and
their input so far. Drives the keymap glow and the inline hint.
_Avoid_: nextchar.
