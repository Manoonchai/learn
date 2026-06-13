<script lang="ts">
  import "../app.css";
  import "@fontsource/sarabun/400.css";
  import "@fontsource/sarabun/500.css";
  import "@fontsource/sarabun/600.css";
  import "@fontsource/sarabun/700.css";
  import { settings } from "$lib/state/settings.svelte";

  let { children } = $props();

  // Hydrate settings, wire persistence + theme application (browser-guarded).
  settings.init();
</script>

{@render children()}
