import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TypingFlow from "./TypingFlow.svelte";

function currentCells(container: HTMLElement): HTMLElement[] {
  const word = container.querySelector("[data-testid=current-word]")!;
  return [...word.querySelectorAll<HTMLElement>("span:not(.caret-end)")];
}

function words(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(".word")];
}

describe("TypingFlow", () => {
  it("renders the whole drill as a flowing paragraph", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["กา", "มา", "นา"], currentIdx: 0, input: "" },
    });
    expect(words(container)).toHaveLength(3);
  });

  it("splits the active word into one cell per code point (so the caret can sit between a base and its marks)", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["น่า"], currentIdx: 0, input: "" },
    });
    // "น่า" = น + tone ่ + า -> three cells (one inline-block box per code point;
    // marks are zero-width and overflow back onto their base, so they still attach).
    expect(currentCells(container).map((c) => c.textContent)).toEqual(["น", "่", "า"]);
  });

  it("marks the active word's typed-correct, wrong, and pending cells distinctly", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["นม"], currentIdx: 0, input: "นก" },
    });
    const cells = currentCells(container);
    expect(cells[0].className).toContain("text-ink"); // น correct
    expect(cells[1].className).toContain("text-danger"); // ก != ม
    expect(cells[1].className).toContain("underline"); // non-colour cue
  });

  it("lights each code point independently the instant it is typed", () => {
    // Per-letter (manoontype style): a code point lights as soon as it is typed, rather
    // than waiting for its whole grapheme cluster. Each cell is its own inline-block box
    // so a mark shows its own colour instead of inheriting its base's.
    const partial = render(TypingFlow, {
      props: { words: ["น่า"], currentIdx: 0, input: "น" }, // base typed, tone not
    });
    const pc = currentCells(partial.container);
    expect(pc[0].className).toContain("text-ink"); // น lit immediately
    expect(pc[1].className).toContain("text-muted"); // tone ่ still pending
    expect(pc[2].className).toContain("text-muted"); // า still pending

    const done = render(TypingFlow, {
      props: { words: ["น่า"], currentIdx: 0, input: "น่" }, // tone now typed
    });
    const dc = currentCells(done.container);
    expect(dc[0].className).toContain("text-ink"); // น lit
    expect(dc[1].className).toContain("text-ink"); // tone ่ now lit
    expect(dc[2].className).toContain("text-muted"); // า still pending
  });

  it("reds a mistyped mark independently of its correctly-typed base", () => {
    // Only possible because each cell is its own box: an inline mark would inherit the
    // base's colour and a wrong vowel/tone could never show red.
    const { container } = render(TypingFlow, {
      props: { words: ["น่า"], currentIdx: 0, input: "นม" }, // น ok, ม typed where ่ expected
    });
    const cells = currentCells(container);
    expect(cells[0].className).toContain("text-ink"); // น correct
    expect(cells[1].className).toContain("text-danger"); // ่ position mistyped -> red
    expect(cells[2].className).toContain("text-muted"); // า still pending
  });

  it("nudges above marks: tones raise over a vowel/สระอำ; vowels+tones shift left on tall consonants", () => {
    // [word, cell index, expected char, expect tone-raise?, expect tone-shift?]
    const cases: [string, number, string, boolean, boolean][] = [
      ["ทื่อ", 2, "่", true, false], // tone on above-vowel ื -> raise; base ท not tall
      ["ต่ำ", 1, "่", true, false], // tone before สระอำ (นิคหิต) -> raise; base ต not tall
      ["ท่อ", 1, "่", false, false], // bare consonant -> natural height
      ["ปุ่น", 2, "่", false, true], // below-vowel ุ (no raise); base ป tall -> shift
      ["ฟ้า", 1, "้", false, true], // tone; base ฟ tall -> shift
      ["ปี่", 1, "ี", false, true], // above-vowel on tall ป -> shift left (no raise)
      ["ปี่", 2, "่", true, true], // tone: raise (over ี) + shift (ป tall)
      ["กี่", 1, "ี", false, false], // above-vowel on non-tall ก -> no shift
    ];
    for (const [word, idx, ch, raise, shift] of cases) {
      const { container } = render(TypingFlow, { props: { words: [word], currentIdx: 0, input: "" } });
      const cell = currentCells(container)[idx];
      expect(cell.textContent).toBe(ch); // sanity: indexed the intended cell
      expect(cell.classList.contains("tone-raise")).toBe(raise);
      expect(cell.classList.contains("tone-shift")).toBe(shift);
    }
  });

  it("renders the active word's untyped characters as muted", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["นม"], currentIdx: 0, input: "" },
    });
    expect(currentCells(container)[0].className).toContain("text-muted");
  });

  it("colours a committed word by its whole-word verdict", () => {
    const correct = render(TypingFlow, {
      props: { words: ["นม", "มา"], currentIdx: 1, input: "", statuses: [true] },
    });
    expect(words(correct.container)[0].textContent).toBe("นม");
    expect(words(correct.container)[0].querySelector("span")!.className).toContain("text-ink");

    const wrong = render(TypingFlow, {
      props: { words: ["นม", "มา"], currentIdx: 1, input: "", statuses: [false] },
    });
    const firstCell = words(wrong.container)[0].querySelector("span")!;
    expect(firstCell.className).toContain("text-danger");
    expect(firstCell.className).toContain("underline");
  });

  it("renders upcoming words as faint", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["นม", "มา"], currentIdx: 0, input: "" },
    });
    expect(words(container)[1].querySelector("span")!.className).toContain("text-faint");
  });

  it("draws a caret in the requested shape", () => {
    for (const style of ["line", "block", "underline"] as const) {
      const { container } = render(TypingFlow, {
        props: { words: ["นม"], currentIdx: 0, input: "", caretStyle: style },
      });
      expect(container.querySelector(`.caret-${style}`)).not.toBeNull();
    }
  });

  it("omits the caret entirely when the style is off", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["นม"], currentIdx: 0, input: "", caretStyle: "off" },
    });
    expect(container.querySelector(".caret")).toBeNull();
  });

  // Geometry runs only in an effect; this proves the measure path executes (and
  // reveals the caret) without throwing, which jsdom shape assertions cannot.
  it("measures and reveals the caret after mount", async () => {
    const { container } = render(TypingFlow, {
      props: { words: ["นม"], currentIdx: 0, input: "", caretStyle: "line" },
    });
    const caret = container.querySelector<HTMLElement>(".caret-line")!;
    await new Promise((r) => setTimeout(r, 40));
    expect(caret.classList.contains("invisible")).toBe(false);
    expect(caret.getAttribute("style") ?? "").toContain("transform");
  });
});
