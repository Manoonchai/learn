import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import FocusLens from "./FocusLens.svelte";

function charCells(container: HTMLElement): HTMLElement[] {
  const word = container.querySelector("[data-testid=current-word]")!;
  return [...word.querySelectorAll<HTMLElement>("span:not(.caret):not(.invisible)")];
}

describe("FocusLens", () => {
  it("keeps Thai combining marks attached by colouring per grapheme cluster", () => {
    const { container } = render(FocusLens, { props: { target: "น่า", input: "" } });
    // "น่า" = [น + tone ่] + [า] -> two cells, the tone stays with its base.
    expect(charCells(container).map((c) => c.textContent)).toEqual(["น่", "า"]);
  });

  it("marks typed-correct, wrong, and pending cells distinctly", () => {
    const { container } = render(FocusLens, { props: { target: "นม", input: "นก" } });
    const cells = charCells(container);
    expect(cells[0].className).toContain("text-ink"); // น correct
    expect(cells[1].className).toContain("text-danger"); // ก != ม
    expect(cells[1].className).toContain("underline"); // non-colour cue
  });

  it("renders untyped characters as muted, not faint", () => {
    const { container } = render(FocusLens, { props: { target: "นม", input: "" } });
    expect(charCells(container)[0].className).toContain("text-muted");
  });

  it("shows adjacent words only when enabled", () => {
    const shown = render(FocusLens, {
      props: { target: "นม", prevWord: "อา", nextWord: "มา", showAdjacent: true },
    });
    expect(shown.container.textContent).toContain("อา");
    expect(shown.container.textContent).toContain("มา");

    const hidden = render(FocusLens, {
      props: { target: "นม", prevWord: "อา", nextWord: "มา", showAdjacent: false },
    });
    expect(hidden.container.textContent).not.toContain("อา");
  });
});
