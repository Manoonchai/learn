<script lang="ts">
  import Fa from 'svelte-fa'
  import { faGithub, faFacebook, faDiscord } from '@fortawesome/free-brands-svg-icons'

  export let showChangelog: boolean = false
  export let showMenu: boolean = false
</script>

<footer
  class="justify-center items-center text-center container text-xl inline bottom-0 p-3 object-bottom fixed mb-4 space-x-4"
>
  <div class="relative">
    <div class="flex gap-3 justify-center">
      <a
        href="https://github.com/manoonchai/learn"
        target="_blank"
        class="flex items-center gap-1 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Fa icon={faGithub} size="2x" class="max-h-5" />
      </a>
      <a
        href="https://www.facebook.com/Manoonchai.layout"
        target="_blank"
        class="flex items-center gap-1 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-600"
      >
        <Fa icon={faFacebook} size="2x" class="max-h-5" />
      </a>
      <a
        href="https://discord.com/invite/HxHDxEHxXc"
        target="_blank"
        class="flex items-center gap-1 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500"
      >
        <Fa icon={faDiscord} size="2x" class="max-h-5" />
      </a>
    </div>

    <div class="absolute right-0 top-0 flex gap-4">
      <button on:click={() => (showChangelog = !showChangelog)} class="hover:text-green-400">
        📝
      </button>
      <button
        on:click={() => (showMenu = !showMenu)}
        class="hover:text-green-400 transfrom transition duration-200 hover:rotate-180">⚙</button
      >
    </div>
  </div>
</footer>
