import { describe, expect, it } from "vitest";
import { LAYOUT_ROWS, isShifted, resolveKey } from "./layout";

describe("resolveKey", () => {
  it("maps physical codes to base characters", () => {
    expect(resolveKey("KeyF", false)).toBe("น");
    expect(resolveKey("KeyG", false)).toBe("ม");
    expect(resolveKey("KeyJ", false)).toBe("า");
  });

  it("maps shifted codes to the shift layer", () => {
    expect(resolveKey("KeyF", true)).toBe("ช");
    expect(resolveKey("KeyK", false)).toBe("่");
  });

  it("returns empty for keys outside the layout", () => {
    expect(resolveKey("Enter", false)).toBe("");
    expect(resolveKey("ArrowLeft", true)).toBe("");
  });
});

describe("LAYOUT_ROWS", () => {
  it("has three rows of the expected widths", () => {
    expect(LAYOUT_ROWS).toHaveLength(3);
    expect(LAYOUT_ROWS.map((r) => r.length)).toEqual([13, 11, 10]);
  });

  it("marks the two index-finger home keys", () => {
    const home = LAYOUT_ROWS.flat().filter((k) => k.home);
    expect(home.map((k) => k.code).sort()).toEqual(["KeyF", "KeyJ"]);
  });
});

describe("isShifted", () => {
  it("is true only for characters on the shift layer", () => {
    expect(isShifted("ช")).toBe(true); // shift of KeyF
    expect(isShifted("น")).toBe(false); // base of KeyF
  });

  it("is false for the empty string and unknown characters", () => {
    expect(isShifted("")).toBe(false);
    expect(isShifted("฿")).toBe(false);
  });
});
