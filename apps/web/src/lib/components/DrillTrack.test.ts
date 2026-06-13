import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DrillTrack from "./DrillTrack.svelte";

describe("DrillTrack", () => {
  it("shows the progress count", () => {
    const { container } = render(DrillTrack, {
      props: { statuses: [true, false, null], currentIdx: 1, total: 3 },
    });
    expect(container.textContent?.replace(/\s/g, "")).toContain("1/3");
  });

  it("renders one segment per word", () => {
    const { container } = render(DrillTrack, {
      props: { statuses: [], currentIdx: 0, total: 5 },
    });
    const track = container.querySelector("[role=presentation]")!;
    expect(track.querySelectorAll("span").length).toBe(5);
  });
});
