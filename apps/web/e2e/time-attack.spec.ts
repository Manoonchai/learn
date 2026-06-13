import { expect, test, type Page } from "@playwright/test";

async function bootTimeAttack(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "learn-manoonchai:v2",
      JSON.stringify({ theme: "dark", mode: "timeAttack" }),
    );
  });
  await page.goto("/");
  // App is ready once the Time Attack countdown has rendered its initial 60.
  await expect(page.getByTestId("countdown")).toHaveText("60");
  await page.getByTestId("typing-input").focus();
}

// Press a key until the clock actually starts (the very first keydown can land
// before hydration wires the handler; a retry covers that).
async function startRun(page: Page) {
  const countdown = page.getByTestId("countdown");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("KeyF");
    try {
      await expect
        .poll(async () => Number(await countdown.textContent()), { timeout: 2000 })
        .toBeLessThan(60);
      return;
    } catch {
      // first keystroke dropped pre-hydration — try again
    }
  }
  throw new Error("Time Attack did not start");
}

test("Time Attack shows a countdown and no progress track", async ({ page }) => {
  await bootTimeAttack(page);

  await expect(page.getByTestId("mode-timeAttack")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("countdown")).toBeVisible();
  await expect(page.getByTestId("progress")).toHaveCount(0);

  // Typing starts the clock: the countdown drops below 60.
  await startRun(page);
});

test("Time Attack finishes on the clock and offers a share image", async ({ page }) => {
  test.setTimeout(80_000); // the run itself takes 60s of wall-clock

  await bootTimeAttack(page);
  await startRun(page);

  // Wait out the 60s run.
  await expect(page.getByTestId("summary")).toBeVisible({ timeout: 65_000 });
  await expect(page.getByTestId("share-save")).toBeVisible();
  await expect(page.getByTestId("share-copy")).toBeVisible();

  // Saving produces a .png download named by wpm + date.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("share-save").click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^manoonchai-timeattack-\d+wpm-\d{4}-\d{2}-\d{2}\.png$/);
});
