<script lang="ts">
  import "../app.css";
  import { settings } from "$lib/state/settings.svelte";

  let { children } = $props();

  // Hydrate settings, wire persistence + theme application (browser-guarded).
  settings.init();
</script>

{@render children()}
