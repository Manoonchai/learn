<script lang="ts">
  export let nextChar: string
  export let highlight: boolean
</script>

<style>
  .button {
    @apply inline-block border;
    @apply flex flex-col justify-center items-center;
    @apply text-base w-16 h-8 border rounded;
    @apply md:text-lg md:w-20 md:h-10 md:border-2 md:rounded;
    @apply lg:text-2xl lg:w-28 lg:h-14 lg:border-2 lg:rounded;
    @apply xl:text-3xl xl:w-40 xl:h-20 xl:border-4 xl:rounded-xl;
  }

  .key {
    @apply -mt-2;
    @apply xl:mt-0;
  }

  .key-shift {
    @apply text-gray-400;
  }
</style>

<span class="button {highlight ? 'bg-yellow-400 border-yellow-800' : ''}">
  <div class="key">Shift</div>
</span>
