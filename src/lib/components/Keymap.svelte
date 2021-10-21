<script lang="ts">
  import KeymapButton from './KeymapButton.svelte'

  export let nextChar: string

  const rows = ['ใตหลสปักิบ็ฬฯ'.split(''), 'งเรนมอา่้วื'.split(''), 'ุไทยจคีดะู'.split('')]
</script>

<div class="my-4">
  {#each rows as row, idx}
    <div class="row">
      <span class="w-{idx * 10}" />
      {#each row as key}
        <KeymapButton {nextChar}>{key}</KeymapButton>
      {/each}
    </div>
  {/each}
  <div class="row">
    <span class="spacebar {nextChar === ' ' ? 'bg-indigo-400 border-indigo-800' : ''}" />
  </div>
</div>

<style>
  .row {
    @apply flex;
    @apply gap-1 mt-1;
    @apply lg:gap-2 lg:mt-2;
    @apply xl:gap-3 xl:mt-3;
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
