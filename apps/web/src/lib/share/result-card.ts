import type { DrillResult } from "$lib/engine";

export interface ShareData {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  seconds: number;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
}

/** Build the rounded, formatted payload drawn onto the share card. */
export function shareData(result: DrillResult, now: Date): ShareData {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return {
    netWpm: Math.round(result.netWpm),
    rawWpm: Math.round(result.rawWpm),
    accuracy: Math.round(result.accuracy),
    consistency: Math.round(result.consistency),
    seconds: Math.round(result.seconds),
    date: `${yyyy}-${mm}-${dd}`,
  };
}

/** Download filename for a share image. */
export function shareFilename(d: ShareData): string {
  return `manoonchai-timeattack-${d.netWpm}wpm-${d.date}.png`;
}

const W = 1200;
const H = 630;

/** Read a CSS custom-property token off :root, with a fallback for SSR/tests. */
function token(name: string, fallback: string): string {
  if (typeof getComputedStyle === "undefined" || typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function drawCard(ctx: CanvasRenderingContext2D, d: ShareData): void {
  const bg = token("--bg", "#0f1210");
  const ink = token("--ink", "#e8eae6");
  const muted = token("--muted", "#9aa39a");
  const accent = token("--accent", "#7bd88f");
  const border = token("--border", "#2a2f2a");
  const font = "Sarabun, ui-sans-serif, system-ui, sans-serif";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = muted;
  ctx.font = `600 30px ${font}`;
  ctx.fillText("Learn Manoonchai · Time Attack", 72, 110);

  ctx.fillStyle = accent;
  ctx.font = `700 210px ${font}`;
  ctx.fillText(String(d.netWpm), 68, 360);

  ctx.fillStyle = muted;
  ctx.font = `500 44px ${font}`;
  ctx.fillText("net wpm", 76, 410);

  const stats: [string, string][] = [
    ["raw", String(d.rawWpm)],
    ["acc", `${d.accuracy}%`],
    ["consistency", `${d.consistency}%`],
    ["time", `${d.seconds}s`],
  ];
  const colW = (W - 144) / stats.length;
  stats.forEach(([label, value], i) => {
    const x = 72 + i * colW;
    ctx.fillStyle = ink;
    ctx.font = `700 56px ${font}`;
    ctx.fillText(value, x, 498);
    ctx.fillStyle = muted;
    ctx.font = `500 28px ${font}`;
    ctx.fillText(label, x, 536);
  });

  ctx.fillStyle = muted;
  ctx.font = `500 28px ${font}`;
  ctx.fillText(d.date, 72, H - 36);
  ctx.textAlign = "right";
  ctx.fillText("learn.manoonchai.com", W - 72, H - 36);
}

/** Render the share card to a PNG blob (browser only). */
export async function renderResultBlob(d: ShareData): Promise<Blob> {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  ctx.scale(dpr, dpr);
  if (document.fonts?.ready) await document.fonts.ready;
  drawCard(ctx, d);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

/** Trigger a browser download of `blob` as `filename`. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Copy an image blob to the clipboard. Throws if the API is unavailable. */
export async function copyBlob(blob: Blob): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("clipboard image write unsupported");
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
