import { describe, expect, it } from "vitest";
import { nextKey } from "./next-key";

describe("nextKey", () => {
  it("points at the first character of an untouched word", () => {
    expect(nextKey("นม", "")).toBe("น");
  });

  it("advances with input", () => {
    expect(nextKey("นม", "น")).toBe("ม");
  });

  it("asks for space once the word is complete", () => {
    expect(nextKey("นม", "นม")).toBe(" ");
    expect(nextKey("นม", "นมx")).toBe(" ");
  });

  it("returns empty when there is no target", () => {
    expect(nextKey("", "x")).toBe("");
    expect(nextKey(undefined, "")).toBe("");
  });
});
