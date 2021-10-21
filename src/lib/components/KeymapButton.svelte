<script lang="ts">
  import { onMount } from 'svelte'

  export let nextChar: string

  let textEl: HTMLSpanElement
  let text

  onMount(() => {
    text = textEl.textContent
    console.log({ text, nextChar })
  })
</script>

<span
  class="button {text === nextChar ? 'bg-indigo-400 border-indigo-800' : ''}"
  bind:this={textEl}
>
  <slot />
</span>

<style>
  .button {
    @apply inline-block border;
    @apply flex flex-col justify-center items-center;
    @apply text-base w-8 h-8 border rounded;
    @apply md:text-xl md:w-10 md:h-10 md:border-2 md:rounded;
    @apply lg:text-2xl lg:w-14 lg:h-14 lg:border-2 lg:rounded;
    @apply xl:text-4xl xl:w-20 xl:h-20 xl:border-4 xl:rounded-xl;
  }
</style>
