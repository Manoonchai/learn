import { describe, expect, it } from "vitest";
import { isPrefixCorrect } from "./spellcheck";

describe("isPrefixCorrect", () => {
  it("accepts a valid prefix", () => {
    expect(isPrefixCorrect("นม", "")).toBe(true);
    expect(isPrefixCorrect("นม", "น")).toBe(true);
    expect(isPrefixCorrect("นม", "นม")).toBe(true);
  });

  it("rejects a wrong character", () => {
    expect(isPrefixCorrect("นม", "ม")).toBe(false);
  });

  it("rejects input longer than the target", () => {
    expect(isPrefixCorrect("นม", "นมก")).toBe(false);
  });

  it("treats a missing target as correct", () => {
    expect(isPrefixCorrect(undefined, "x")).toBe(true);
  });
});
