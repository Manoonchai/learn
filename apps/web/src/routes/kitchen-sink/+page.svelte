<script lang="ts">
  import { toneClass } from "$lib/engine/thai-marks";

  // A blank canvas for finding Thai mark-rendering exceptions. Type or paste Thai, and
  // compare the browser's natural shaping against our per-code-point `.letter` boxes
  // (the renderer TypingFlow uses). Sliders tune the tone raise/shift amounts live so a
  // good value can be found by eye before baking it into app.css.

  let input = $state(
    "ทื่อ ท่อ ปุ่น ฝุ่น ต่ำ น้ำ ฟ้า ป่า พ่อ ผ่าน ปี่ สิ้น เรื่อง วุฒิ ปู่ กั่น มื้อ จำนำ"
  );
  let size = $state(64); // px
  let raise = $state(0.3); // em lifted up (matches app default)
  let shift = $state(0.1); // em nudged left (matches app default)
  let markNudges = $state(false);

  // Split into lines, then words; render each word's code points as `.letter` boxes.
  // Keep the inner #each compact so no whitespace text node creeps between letters.
  const lines = $derived(input.split("\n").map((line) => line.split(" ")));

  function reset() {
    size = 64;
    raise = 0.3;
    shift = 0.1;
  }
</script>

<svelte:head><title>Kitchen Sink — Thai letter rendering</title></svelte:head>

<div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
  <header class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
    <h1 class="text-xl font-semibold">Kitchen Sink</h1>
    <p class="text-muted text-sm">
      Type or paste Thai. Compare natural shaping vs. the per-letter boxes used by the
      typing view, and tune the tone nudges.
    </p>
  </header>

  <textarea
    bind:value={input}
    rows="2"
    spellcheck="false"
    class="font-thai border-border bg-bg focus-visible:outline-primary w-full resize-y rounded-lg border p-3 text-lg"
    placeholder="พิมพ์หรือวางข้อความภาษาไทย…"
  ></textarea>

  <!-- Controls -->
  <div class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
    <label class="flex items-center gap-2">
      <span class="text-muted w-28">Font size</span>
      <input type="range" min="24" max="140" step="1" bind:value={size} />
      <span class="tabular-nums w-14">{size}px</span>
    </label>
    <label class="flex items-center gap-2">
      <span class="text-muted w-28">Tone raise</span>
      <input type="range" min="0" max="0.6" step="0.01" bind:value={raise} />
      <span class="tabular-nums w-14">{raise.toFixed(2)}em</span>
    </label>
    <label class="flex items-center gap-2">
      <span class="text-muted w-28">Tone shift ←</span>
      <input type="range" min="0" max="0.4" step="0.01" bind:value={shift} />
      <span class="tabular-nums w-14">{shift.toFixed(2)}em</span>
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={markNudges} />
      <span>Mark nudged tones</span>
    </label>
    <button class="border-border rounded border px-2 py-1" onclick={reset}>Reset</button>
  </div>

  <!-- Natural (browser shaping) reference -->
  <section class="flex flex-col gap-2">
    <h2 class="text-muted text-xs uppercase tracking-wide">Natural (browser shaping)</h2>
    <div class="font-thai border-border rounded-lg border p-4 leading-loose" style="font-size:{size}px">
      {#each lines as line, li (li)}
        <div>{line.join(" ")}</div>
      {/each}
    </div>
  </section>

  <!-- Letter boxes (app renderer) -->
  <section class="flex flex-col gap-2">
    <h2 class="text-muted text-xs uppercase tracking-wide">
      Letter boxes (typing renderer) — teal = raised, amber = shifted
    </h2>
    <div
      class="font-thai border-border rounded-lg border p-4 leading-loose"
      class:ks-debug={markNudges}
      style="font-size:{size}px; --tone-raise-y:{-raise}em; --tone-shift-x:{-shift}em"
    >
      {#each lines as line, li (li)}
        <div>
          {#each line as word, wi (wi)}{@const segs = [...word]}<span class="ks-word"
              >{#each segs as seg, i (i)}<span class="letter {toneClass(segs, i)}">{seg}</span
                >{/each}</span
            >{/each}
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .ks-word {
    display: inline-block;
    white-space: nowrap;
    margin-inline: 0.14em;
  }
  /* Debug tint so it's obvious which tones got nudged (and which rule fired). */
  .ks-debug :global(.letter.tone-raise) {
    color: var(--primary);
  }
  .ks-debug :global(.letter.tone-shift) {
    color: var(--accent);
  }
</style>
