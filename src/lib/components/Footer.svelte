<script lang="ts">
  import 'bootstrap-icons/font/bootstrap-icons.css'

  export let showChangelog: boolean = false
  export let showMenu: boolean = false
</script>

<footer
  class="justify-center items-center text-center container text-xl inline bottom-0 p-3 object-bottom fixed mb-4 space-x-4"
>
  <div class="relative">
    <div class="flex gap-4 justify-center">
      <a href="https://github.com/manoonchai/learn" target="_blank" class="hover:text-green-400">
        <i class="bi bi-github" />
        Github
      </a>
      <a
        href="https://www.facebook.com/Manoonchai.layout"
        target="_blank"
        class="hover:text-green-400"
      >
        <i class="bi bi-facebook" />
        Facebook
      </a>
      <a href="https://discord.com/invite/HxHDxEHxXc" target="_blank" class="hover:text-green-400">
        <i class="bi bi-discord" />
        Discord
      </a>
    </div>

    <div class="absolute right-0 top-0 flex gap-4">
      <button on:click={() => (showChangelog = !showChangelog)} class="hover:text-green-400">
        v1.0.0
      </button>
      <button on:click={() => (showMenu = !showMenu)} class="hover:text-green-400"> Menu </button>
    </div>
  </div>
</footer>
