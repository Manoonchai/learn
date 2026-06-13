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

  it("keeps Thai combining marks attached by colouring the active word per cluster", () => {
    const { container } = render(TypingFlow, {
      props: { words: ["น่า"], currentIdx: 0, input: "" },
    });
    // "น่า" = [น + tone ่] + [า] -> two cells, the tone stays with its base.
    expect(currentCells(container).map((c) => c.textContent)).toEqual(["น่", "า"]);
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
