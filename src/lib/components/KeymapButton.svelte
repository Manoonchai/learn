<script lang="ts">
  import { onMount } from 'svelte'

  export let nextChar: string
  export let keys: [string, string] = ['', '']
  export let glow

  let keyClasses

  $: if (nextChar === keys[0]) {
    keyClasses = `${
      glow ? 'key-glow' : ''
    } bg-indigo-400 border-indigo-800 dark:bg-indigo-600 border-indigo-900 text-black dark:text-white`
  } else if (nextChar === keys[1]) {
    keyClasses = `${
      glow ? 'key-shift-glow' : ''
    } key-shiftHighlight bg-yellow-400 border-yellow-800 text-black dark:text-white`
  } else {
    keyClasses = ''
  }
</script>

<span class="button {keyClasses}">
  <div class="key-shift">{keys[1]}</div>
  <div class="key">{keys[0]}</div>
</span>

<style lang="postcss">
  .button {
    @apply inline-block border;
    @apply flex flex-col justify-center items-center;
    @apply text-base w-8 h-8 border rounded;
    @apply md:text-lg md:w-10 md:h-10 md:border md:rounded;
    @apply lg:text-xl lg:w-12 lg:h-12 lg:border-2 lg:rounded-lg;
    @apply xl:text-2xl xl:w-16 xl:h-16 xl:border-2 xl:rounded-xl;
    @apply transition duration-200;
  }

  .key {
    @apply -mt-2;
    @apply xl:mt-0;
  }

  .key-glow {
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #6100b6, 0 0 40px #760094, 0 0 50px #a500e6,
      0 0 60px #a500e6, 0 0 70px #a500e6;
  }

  .key-shift {
    @apply text-gray-500;
  }

  .key-shift-glow {
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e3e700, 0 0 40px #e4e000, 0 0 50px #c8ff00,
      0 0 60px #c8ff00, 0 0 70px #c8ff00;
  }
</style>
