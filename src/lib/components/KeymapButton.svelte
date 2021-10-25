<script lang="ts">
  import { onMount } from 'svelte'

  export let nextChar: string
  export let keys: [string, string] = ['', '']

  let keyClasses

  $: if (nextChar === keys[0]) {
    keyClasses = 'bg-indigo-400 border-indigo-800'
  } else if (nextChar === keys[1]) {
    keyClasses = 'bg-yellow-400 border-yellow-800'
  } else {
    keyClasses = ''
  }
</script>

<style>
  .button {
    @apply inline-block border;
    @apply flex flex-col justify-center items-center;
    @apply text-base w-8 h-8 border rounded;
    @apply md:text-lg md:w-10 md:h-10 md:border-2 md:rounded;
    @apply lg:text-2xl lg:w-14 lg:h-14 lg:border-2 lg:rounded;
    @apply xl:text-3xl xl:w-20 xl:h-20 xl:border-4 xl:rounded-xl;
  }

  .key {
    @apply -mt-2;
    @apply xl:mt-0;
  }

  .key-shift {
    @apply text-gray-400;
  }
</style>

<span class="button {keyClasses}">
  <div class="key-shift">{keys[1]}</div>
  <div class="key">{keys[0]}</div>
</span>
