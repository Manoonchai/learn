<script lang="ts">
  let { size = 28 }: { size?: number } = $props();
</script>

<span class="flex items-center gap-2.5 select-none">
  <!-- A keycap mark stamped with ม (the "M" of Manoonchai). -->
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    class="shrink-0"
  >
    <rect x="2.5" y="2.5" width="27" height="27" rx="7" class="fill-panel stroke-border-strong" stroke-width="1.5" />
    <rect x="5.5" y="5" width="21" height="18" rx="4.5" class="fill-bg" />
    <text
      x="16"
      y="17.5"
      text-anchor="middle"
      dominant-baseline="middle"
      class="fill-primary font-thai"
      font-size="15"
      font-weight="700">ม</text
    >
  </svg>
  <span class="text-[15px] leading-none font-semibold tracking-tight">
    Learn <span class="text-primary">Manoonchai</span>
  </span>
</span>
