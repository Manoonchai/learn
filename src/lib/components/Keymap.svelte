<script lang="ts">
  import KeymapButton from './KeymapButton.svelte'
  import ShiftButton from './ShiftButton.svelte'
  import { GlowKey as glow } from '$lib/store'

  export let nextChar: string

  const rows = ['ใตหลสปักิบ็ฬฯ'.split(''), 'งเรนมอา่้วื'.split(''), 'ุไทยจคีดะู'.split('')]
  const rowsShift = ['ฒฏซญฟฉึธฐฎฆฑฌ'.split(''), 'ษถแชพผำขโภ"'.split(''), 'ฤฝๆณ๊๋์ศฮ?'.split('')]

  const paddingClasses = ['w-0', 'w-4 md:w-5 lg:w-6 xl:w-8', '-ml-8 md:-ml-10 lg:-ml-12 xl:-ml-16']
</script>

<div class="my-4 font-sarabun">
  {#each rows as row, idx}
    <div class="row text-black dark:text-white">
      <span class={paddingClasses[idx]}>
        {#if idx === 2}
          <ShiftButton highlight={rowsShift.join('').includes(nextChar)} glow={$glow} />
        {/if}
      </span>
      {#each row as key, keyIdx}
        <KeymapButton {nextChar} keys={[key, rowsShift[idx][keyIdx]]} glow={$glow} />
      {/each}
      {#if idx === 2}
        <ShiftButton highlight={rowsShift.join('').includes(nextChar)} glow={$glow} />
      {/if}
    </div>
  {/each}
  <div class="flex mt-1">
    <span class="spacebar {nextChar === ' ' ? `bg-indigo-400 border-indigo-800 ${$glow ? "spacebar-next" : ""}` : ''}" />
  </div>
</div>

<style>
  .row {
    @apply flex;
    @apply gap-0.5 mt-0.5;
    @apply lg:gap-1 lg:mt-1;
    @apply xl:gap-1.5 xl:mt-1.5;
    @apply ml-16 md:ml-20 lg:ml-24 xl:ml-32;
  }

  .spacebar {
    @apply inline-block border;
    @apply mx-auto;
    @apply text-base w-40 h-8 border rounded;
    @apply md:text-lg md:w-50 md:h-10 md:border md:rounded;
    @apply lg:text-xl lg:w-70 lg:h-12 lg:border-2 lg:rounded-lg;
    @apply xl:text-2xl xl:w-100 xl:h-16 xl:border-2 xl:rounded-xl;
  }
  
  .spacebar-next {
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #6100b6, 0 0 40px #760094, 0 0 50px #a500e6, 0 0 60px #a500e6, 0 0 70px #a500e6;
  }

</style>
