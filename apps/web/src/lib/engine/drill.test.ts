import { describe, expect, it } from "vitest";
import { DRILL_LENGTHS, buildDrill } from "./drill";

describe("buildDrill", () => {
  it("offers the expected length options", () => {
    expect(DRILL_LENGTHS).toEqual([10, 25, 50]);
  });

  it("produces exactly `length` words", () => {
    expect(buildDrill(["a", "b", "c"], 10)).toHaveLength(10);
    expect(buildDrill(["a", "b", "c"], 25)).toHaveLength(25);
  });

  it("samples from the pool using the injected rng", () => {
    // rng always 0 -> always the first pool entry
    expect(buildDrill(["a", "b", "c"], 4, () => 0)).toEqual(["a", "a", "a", "a"]);
    // rng near 1 -> last entry
    expect(buildDrill(["a", "b", "c"], 2, () => 0.99)).toEqual(["c", "c"]);
  });

  it("returns an empty drill for an empty pool", () => {
    expect(buildDrill([], 10)).toEqual([]);
  });
});
