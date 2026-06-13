import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import LiveReadout from "./LiveReadout.svelte";

describe("LiveReadout", () => {
  it("rounds WPM and accuracy to whole numbers", () => {
    const { container } = render(LiveReadout, { props: { wpm: 42.6, accuracy: 88.2 } });
    const text = container.textContent ?? "";
    expect(text).toContain("43");
    expect(text).toContain("88");
  });

  it("shows a countdown when remaining is provided", () => {
    const { container } = render(LiveReadout, { props: { wpm: 40, accuracy: 98, remaining: 42 } });
    expect(container.querySelector('[data-testid="countdown"]')?.textContent).toBe("42");
  });

  it("hides the countdown when remaining is null", () => {
    const { container } = render(LiveReadout, {
      props: { wpm: 40, accuracy: 98, remaining: null },
    });
    expect(container.querySelector('[data-testid="countdown"]')).toBeNull();
  });
});
