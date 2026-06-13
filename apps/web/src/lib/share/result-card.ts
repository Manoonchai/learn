import type { DrillResult, WordStat, WpmSample } from "$lib/engine";
import { bucketOf, speedThresholds } from "$lib/engine";

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
const MARGIN = 72;
const TOP_H = 560; // title + big wpm + chart + stats block
const FOOTER_H = 64; // footer baseline sits at height − 36
const HIST_TITLE_DY = 34; // input-history title baseline below TOP_H
const HIST_FIRST_DY = 84; // first word line baseline below TOP_H
const HIST_LINE_H = 44;
const HIST_PAD_BOTTOM = 24;
const HIST_FONT_PX = 30;
const MAX_HISTORY_WORDS = 240; // bound the card height for very fast runs
const FONT = "Sarabun, ui-sans-serif, system-ui, sans-serif";

interface Colors {
  bg: string;
  ink: string;
  muted: string;
  faint: string;
  accent: string;
  primary: string;
  danger: string;
  border: string;
  /** Slowest → fastest word colours. */
  bucket: string[];
}

interface WordCell {
  text: string;
  color: string;
  width: number;
}

interface LegendItem {
  label: string;
  color: string;
}

/** Read a CSS custom-property token off :root, with a fallback for SSR/tests. */
function token(name: string, fallback: string): string {
  if (typeof getComputedStyle === "undefined" || typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function readColors(): Colors {
  const ink = token("--ink", "#e8eae6");
  const muted = token("--muted", "#9aa39a");
  const faint = token("--faint", "#6b746b");
  const accent = token("--accent", "#e08a4c");
  const primary = token("--primary", "#4aa6c8");
  const danger = token("--danger", "#d96a5a");
  return {
    bg: token("--bg", "#0f1210"),
    ink,
    muted,
    faint,
    accent,
    primary,
    danger,
    border: token("--border", "#2a2f2a"),
    bucket: [faint, muted, ink, primary, accent],
  };
}

/** Wrap the input-history words into lines that fit `maxWidth`, colouring each
 * by its speed bucket (errors → danger). `measure` returns text width at the
 * history font. */
function layoutWords(
  words: WordStat[],
  thresholds: number[],
  colors: Colors,
  measure: (text: string) => number,
  maxWidth: number,
): WordCell[][] {
  const shown = words.slice(0, MAX_HISTORY_WORDS);
  const cells: WordCell[] = shown.map((w) => ({
    text: w.text,
    color: w.correct ? (colors.bucket[bucketOf(w.wpm, thresholds)] ?? colors.ink) : colors.danger,
    width: measure(w.text),
  }));
  if (words.length > MAX_HISTORY_WORDS) {
    cells.push({ text: `+${words.length - MAX_HISTORY_WORDS}`, color: colors.faint, width: 0 });
  }

  const spaceW = measure(" ");
  const lines: WordCell[][] = [[]];
  let curW = 0;
  for (const cell of cells) {
    if (curW > 0 && curW + cell.width > maxWidth) {
      lines.push([]);
      curW = 0;
    }
    lines[lines.length - 1].push(cell);
    curW += cell.width + spaceW;
  }
  return lines;
}

/** Legend ranges derived from the run's speed thresholds, slow → fast. */
function buildLegend(thresholds: number[], bucket: string[]): LegendItem[] {
  if (thresholds.length === 0) return [];
  const round = (n: number) => Math.round(n);
  return bucket.map((color, i) => {
    let label: string;
    if (i === 0) label = `<${round(thresholds[0])}`;
    else if (i === thresholds.length) label = `${round(thresholds[i - 1])}+`;
    else label = `${round(thresholds[i - 1])}–${round(thresholds[i])}`;
    return { label, color };
  });
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

/** Input-history block: a title, a speed legend, and the colour-coded words. */
function drawHistory(
  ctx: CanvasRenderingContext2D,
  lines: WordCell[][],
  legend: LegendItem[],
  colors: Colors,
): void {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = colors.muted;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("ประวัติการพิมพ์", MARGIN, TOP_H + HIST_TITLE_DY);

  // Legend, right-aligned on the title row, fastest bucket nearest the edge.
  ctx.textAlign = "right";
  ctx.font = `500 22px ${FONT}`;
  let lx = W - MARGIN;
  for (let i = legend.length - 1; i >= 0; i--) {
    ctx.fillStyle = legend[i].color;
    ctx.fillText(legend[i].label, lx, TOP_H + HIST_TITLE_DY);
    lx -= ctx.measureText(legend[i].label).width + 18;
  }

  ctx.textAlign = "left";
  ctx.font = `500 ${HIST_FONT_PX}px ${FONT}`;
  const spaceW = ctx.measureText(" ").width;
  lines.forEach((line, row) => {
    let x = MARGIN;
    const y = TOP_H + HIST_FIRST_DY + row * HIST_LINE_H;
    for (const cell of line) {
      ctx.fillStyle = cell.color;
      ctx.fillText(cell.text, x, y);
      x += cell.width + spaceW;
    }
  });
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  d: ShareData,
  samples: WpmSample[],
  lines: WordCell[][],
  legend: LegendItem[],
  colors: Colors,
  height: number,
): void {
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, W, height);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, height - 48);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = colors.muted;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("Learn Manoonchai · Time Attack", MARGIN, 110);

  ctx.fillStyle = colors.accent;
  ctx.font = `700 210px ${FONT}`;
  ctx.fillText(String(d.netWpm), 68, 360);

  ctx.fillStyle = colors.muted;
  ctx.font = `500 44px ${FONT}`;
  ctx.fillText("net wpm", 76, 410);

  drawChart(ctx, samples, colors);

  const stats: [string, string][] = [
    ["raw", String(d.rawWpm)],
    ["acc", `${d.accuracy}%`],
    ["consistency", `${d.consistency}%`],
    ["time", `${d.seconds}s`],
  ];
  const colW = (W - 144) / stats.length;
  stats.forEach(([label, value], i) => {
    const x = MARGIN + i * colW;
    ctx.fillStyle = colors.ink;
    ctx.font = `700 56px ${FONT}`;
    ctx.fillText(value, x, 498);
    ctx.fillStyle = colors.muted;
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(label, x, 536);
  });

  if (lines.length > 0) drawHistory(ctx, lines, legend, colors);

  ctx.fillStyle = colors.muted;
  ctx.font = `500 28px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(d.date, MARGIN, height - 36);
  ctx.textAlign = "right";
  ctx.fillText("learn.manoonchai.com", W - MARGIN, height - 36);
}

/** Render the share card to a PNG blob (browser only). */
export async function renderResultBlob(
  d: ShareData,
  samples: WpmSample[] = [],
  words: WordStat[] = [],
): Promise<Blob> {
  const dpr = 2;
  const colors = readColors();
  const thresholds = speedThresholds(words);
  const legend = buildLegend(thresholds, colors.bucket);

  // Measure-and-wrap the history first so we can size the canvas to fit it.
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  if (!mctx) throw new Error("2d canvas unavailable");
  mctx.font = `500 ${HIST_FONT_PX}px ${FONT}`;
  const lines =
    words.length > 0
      ? layoutWords(words, thresholds, colors, (t) => mctx.measureText(t).width, W - 2 * MARGIN)
      : [];

  const histBlockH =
    lines.length > 0 ? HIST_FIRST_DY + (lines.length - 1) * HIST_LINE_H + HIST_PAD_BOTTOM : 0;
  const height = TOP_H + histBlockH + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  ctx.scale(dpr, dpr);
  if (document.fonts?.ready) await document.fonts.ready;
  drawCard(ctx, d, samples, lines, legend, colors, height);
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
