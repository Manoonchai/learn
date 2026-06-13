<script lang="ts">
  import { Chart, Svg, Spline, Axis, Grid } from "layerchart";
  import type { WpmSample } from "$lib/engine";

  let {
    samples = [],
    animate = true,
  }: { samples?: WpmSample[]; animate?: boolean } = $props();

  const errorPoints = $derived(samples.filter((s) => s.errors > 0));
  const draw = $derived(animate ? { duration: 700 } : false);
</script>

<figure class="m-0 w-full">
  <figcaption class="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
    <span class="flex items-center gap-1.5">
      <span class="h-0.5 w-4 rounded-full bg-primary/55"></span> Raw WPM
    </span>
    <span class="flex items-center gap-1.5">
      <span class="h-0.5 w-4 rounded-full bg-accent"></span> Net WPM
    </span>
    <span class="flex items-center gap-1.5">
      <span class="size-2 rounded-full border-2 border-bg bg-danger"></span> Errors
    </span>
  </figcaption>

  <div class="chart h-52 w-full sm:h-60">
    {#if samples.length > 0}
      <Chart
        data={samples}
        x="second"
        y={["raw", "net"]}
        yNice
        padding={{ left: 48, bottom: 40, top: 8, right: 10 }}
        let:xScale
        let:yScale
      >
        <Svg>
          <Grid y class="grid-line" />
          <Axis placement="left" rule={false} label="wpm" labelProps={{ x: -36 }} />
          <Axis placement="bottom" rule={false} label="วินาที" />
          <Spline y="raw" class="line-raw" {draw} />
          <Spline y="net" class="line-net" {draw} />
          {#each errorPoints as p (p.second)}
            <circle
              cx={xScale(p.second)}
              cy={yScale(p.raw)}
              r="3.5"
              class="err-dot"
            />
          {/each}
        </Svg>
      </Chart>
    {/if}
  </div>
</figure>

<style>
  /* LayerChart's default Tailwind classes assume svelte-ux; style its SVG
     output directly against our tokens instead. */
  .chart :global(.line-raw) {
    stroke: var(--primary);
    stroke-width: 1.75;
    opacity: 0.5;
    fill: none;
  }
  .chart :global(.line-net) {
    stroke: var(--accent);
    stroke-width: 2.5;
    fill: none;
  }
  .chart :global(.err-dot) {
    fill: var(--danger);
    stroke: var(--bg);
    stroke-width: 1.5;
  }
  /* LayerChart tags tick text `.tickLabel` and grid/axis lines `.rule`; its
     default `fill-surface-content` / `stroke-*` utilities don't exist here, so
     we set them against our tokens (otherwise labels render black = invisible
     in dark mode). */
  .chart :global(.tickLabel) {
    fill: var(--muted);
    stroke: none;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 400;
  }
  /* Axis titles ("WPM" / "วินาที"). LayerChart's default `.label` class pulls
     svelte-ux utilities (`stroke-surface-100`, …) that don't exist here, so
     pin them to our tokens — otherwise they render with a stray halo / wrong
     colour. */
  .chart :global(.label) {
    fill: var(--faint);
    stroke: none;
    font-family: var(--font-thai);
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  /* LayerChart's Text wraps every tick/axis label in a nested <svg> and leans
     on a `.overflow-visible` utility (svelte-ux) to stop the SVG default
     `overflow: hidden` from clipping glyphs that sit at negative coords — the
     left axis is anchored `end` at x=0 and the rotated "wpm" title sits at
     negative x. That utility isn't generated here, so without this the whole
     y-axis (ticks + title) gets clipped away. Pin overflow to our intent. */
  .chart :global(svg) {
    overflow: visible;
  }
  .chart :global(.grid-line line),
  .chart :global(.rule line),
  .chart :global(line.rule),
  .chart :global(.rule) {
    stroke: var(--border);
    opacity: 0.7;
  }
</style>
