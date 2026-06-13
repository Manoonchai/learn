<script lang="ts">
  export let highlight: boolean
  export let glow: boolean
</script>

<span
  class="button {highlight ? `${glow ? 'shift-next' : ''} bg-yellow-400 border-yellow-800` : ''}"
>
  <div class="key">Shift</div>
</span>

<style lang="postcss">
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

  .shift-next {
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e3e700, 0 0 40px #e4e000, 0 0 50px #c8ff00,
      0 0 60px #c8ff00, 0 0 70px #c8ff00;
  }
</style>
