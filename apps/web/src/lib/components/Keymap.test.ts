import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Keymap from "./Keymap.svelte";

describe("Keymap", () => {
  it("activates the key whose base character is next", () => {
    const { container } = render(Keymap, { props: { nextChar: "น", glow: false } });
    expect(container.querySelector("[data-code=KeyF]")?.getAttribute("data-active")).toBe("true");
    expect(container.querySelector("[data-code=KeyG]")?.getAttribute("data-active")).toBeNull();
  });

  it("activates the owning key when the next character needs Shift", () => {
    // ช is the shift layer of KeyF.
    const { container } = render(Keymap, { props: { nextChar: "ช", glow: false } });
    expect(container.querySelector("[data-code=KeyF]")?.getAttribute("data-active")).toBe("true");
    // The cap label is "Shift" (displayed uppercase via CSS).
    expect(container.textContent).toContain("Shift");
  });

  it("activates no letter key when the next key is space", () => {
    const { container } = render(Keymap, { props: { nextChar: " ", glow: false } });
    expect(container.querySelector("[data-active=true]")).toBeNull();
    expect(container.textContent).toContain("SPACE");
  });
});
