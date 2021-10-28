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

<span class="button {keyClasses}">
  <div class="key-shift">{keys[1]}</div>
  <div class="key">{keys[0]}</div>
</span>

<style>
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

  .key-shift {
    @apply text-gray-400;
  }
</style>
