# Honest, per-keystroke stats engine

v1 recorded keystrokes but computed speed loosely: its chart was labelled "Raw WPM"
while actually plotting a _cumulative running average_, and per-second values were
faked as a flat `+12` per keystroke regardless of timing or correctness.

For v2 we rebuild the stats engine around a per-keystroke record
(`{ char, expected, correct, t }`) and derive everything from it: **raw WPM** per
one-second window (chars ÷ 5 × 60), **net WPM** (error-penalized), and **accuracy**.
The chart shows raw + net with error markers, each correctly labelled per the terms
in [CONTEXT.md](../../CONTEXT.md).

We chose this over a faithful port because the v1 numbers were misleading, and a
future reader comparing the two versions would otherwise wonder whether the changed
math was a bug. It is recorded here so the divergence reads as deliberate.
