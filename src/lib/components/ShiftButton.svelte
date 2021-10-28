<script lang="ts">
  export let highlight: boolean
</script>

<span class="button {highlight ? 'bg-yellow-400 border-yellow-800' : ''}">
  <div class="key">Shift</div>
</span>

<style>
  .button {
    @apply inline-block border;
    @apply flex flex-col justify-center items-center;
    @apply text-base w-16 h-8 border rounded;
    @apply md:text-lg md:w-20 md:h-10 md:border md:rounded;
    @apply lg:text-2xl lg:w-24 lg:h-12 lg:border-2 lg:rounded-lg;
    @apply xl:text-3xl xl:w-32 xl:h-16 xl:border-2 xl:rounded-xl;
    @apply transition duration-200;
  }

  .key {
    @apply -mt-2;
    @apply xl:mt-0;
  }
</style>
