import type { DrillResult, WpmSample } from "$lib/engine";

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

/** Mini WPM chart: raw (primary) + net (accent) lines with error dots. */
function drawChart(
  ctx: CanvasRenderingContext2D,
  samples: WpmSample[],
  colors: { primary: string; accent: string; danger: string; border: string },
): void {
  if (samples.length === 0) return;
  const left = 560;
  const right = 1128;
  const top = 174;
  const bottom = 430;
  const w = right - left;
  const h = bottom - top;

  const n = samples.length;
  const lastSecond = samples[n - 1].second;
  const maxY = Math.max(1, ...samples.map((s) => Math.max(s.raw, s.net)));
  const x = (second: number) => (n < 2 ? left + w / 2 : left + ((second - 1) / (lastSecond - 1)) * w);
  const y = (v: number) => bottom - (v / maxY) * h;

  // Faint frame: baseline + top gridline.
  ctx.strokeStyle = colors.border;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  for (const gy of [top, bottom]) {
    ctx.beginPath();
    ctx.moveTo(left, gy);
    ctx.lineTo(right, gy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const line = (key: "raw" | "net", stroke: string, width: number, alpha: number) => {
    ctx.strokeStyle = stroke;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.beginPath();
    samples.forEach((s, i) => {
      const px = x(s.second);
      const py = y(s[key]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  line("raw", colors.primary, 3, 0.55);
  line("net", colors.accent, 4, 1);

  ctx.fillStyle = colors.danger;
  for (const s of samples) {
    if (s.errors > 0) {
      ctx.beginPath();
      ctx.arc(x(s.second), y(s.raw), 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCard(ctx: CanvasRenderingContext2D, d: ShareData, samples: WpmSample[]): void {
  const bg = token("--bg", "#0f1210");
  const ink = token("--ink", "#e8eae6");
  const muted = token("--muted", "#9aa39a");
  const accent = token("--accent", "#e08a4c");
  const primary = token("--primary", "#4aa6c8");
  const danger = token("--danger", "#d96a5a");
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

  drawChart(ctx, samples, { primary, accent, danger, border });

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
export async function renderResultBlob(d: ShareData, samples: WpmSample[] = []): Promise<Blob> {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  ctx.scale(dpr, dpr);
  if (document.fonts?.ready) await document.fonts.ready;
  drawCard(ctx, d, samples);
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
