<script lang="ts">
  import KeymapButton from './KeymapButton.svelte'
  import ShiftButton from './ShiftButton.svelte'

  export let nextChar: string

  const rows = ['ใตหลสปักิบ็ฬฯ'.split(''), 'งเรนมอา่้วื'.split(''), 'ุไทยจคีดะู'.split('')]
  const rowsShift = ['ฒฏซญฟฉึธฐฎฆฑฌ'.split(''), 'ษถแชพผำขโภ"'.split(''), 'ฤฝๆณ๊๋์ศฮ?'.split('')]

  const paddingClasses = ['w-0', 'w-4 md:w-5 lg:w-7 xl:w-10', '-ml-8 md:-ml-10 lg:-ml-14 xl:-ml-20']
</script>

<style>
  .row {
    @apply flex;
    @apply gap-1 mt-1;
    @apply lg:gap-2 lg:mt-2;
    @apply xl:gap-3 xl:mt-3;
    @apply ml-16 md:ml-20 lg:ml-28 xl:ml-40;
  }

  .spacebar {
    @apply inline-block border;
    @apply mx-auto;
    @apply text-base w-40 h-8 border rounded;
    @apply md:text-xl md:w-50 md:h-10 md:border-2 md:rounded;
    @apply lg:text-2xl lg:w-70 lg:h-14 lg:border-2 lg:rounded;
    @apply xl:text-4xl xl:w-100 xl:h-20 xl:border-4 xl:rounded-xl;
  }
</style>

<div class="my-4">
  {#each rows as row, idx}
    <div class="row">
      <span class={paddingClasses[idx]}>
        {#if idx === 2}
          <ShiftButton {nextChar} highlight={rowsShift.join('').includes(nextChar)} />
        {/if}
      </span>
      {#each row as key, keyIdx}
        <KeymapButton {nextChar} keys={[key, rowsShift[idx][keyIdx]]} />
      {/each}
      {#if idx === 2}
        <ShiftButton {nextChar} highlight={rowsShift.join('').includes(nextChar)} />
      {/if}
    </div>
  {/each}
  <div class="flex mt-1">
    <span class="spacebar {nextChar === ' ' ? 'bg-indigo-400 border-indigo-800' : ''}" />
  </div>
</div>
