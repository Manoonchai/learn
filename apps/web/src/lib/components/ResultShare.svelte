<script lang="ts">
  import type { DrillResult } from "$lib/engine";
  import {
    shareData,
    shareFilename,
    renderResultBlob,
    downloadBlob,
    copyBlob,
  } from "$lib/share/result-card";

  let { result }: { result: DrillResult } = $props();

  let copied = $state(false);
  let busy = $state(false);

  async function onSave() {
    busy = true;
    try {
      const d = shareData(result, new Date());
      const blob = await renderResultBlob(d, result.samples, result.words);
      downloadBlob(blob, shareFilename(d));
    } finally {
      busy = false;
    }
  }

  async function onCopy() {
    busy = true;
    try {
      const blob = await renderResultBlob(shareData(result, new Date()), result.samples, result.words);
      await copyBlob(blob);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      // Clipboard image unsupported (e.g. Firefox) — fall back to download.
      const d = shareData(result, new Date());
      downloadBlob(await renderResultBlob(d, result.samples, result.words), shareFilename(d));
    } finally {
      busy = false;
    }
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
  <button
    type="button"
    data-testid="share-save"
    onclick={onSave}
    disabled={busy}
    class="rounded-xl border border-border px-5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel disabled:opacity-50"
  >
    บันทึกรูป
  </button>
  <button
    type="button"
    data-testid="share-copy"
    onclick={onCopy}
    disabled={busy}
    class="rounded-xl border border-border px-5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel disabled:opacity-50"
  >
    {copied ? "คัดลอกแล้ว ✓" : "คัดลอกรูป"}
  </button>
</div>
