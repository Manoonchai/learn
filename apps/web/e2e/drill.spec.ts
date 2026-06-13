import { expect, test, type Page } from "@playwright/test";

// Lesson 1 uses only these four base characters, so we can map each word back to
// physical key codes and drive the trainer the way a real keyboard would.
const CODE: Record<string, string> = { น: "KeyF", ม: "KeyG", อ: "KeyH", า: "KeyJ" };

// Pin a short lesson-1 drill before the app boots.
async function bootDrill(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "learn-manoonchai:v2",
      JSON.stringify({ theme: "dark", drillLength: 10, currentLessonName: "1. น ม อ า" }),
    );
  });
  await page.goto("/");
  // Wait for the first drill to be built (total reaches 10) before driving it.
  await expect(page.getByTestId("progress")).toHaveText(/\/\s*10/);
  await page.getByTestId("typing-input").focus();
}

async function typeCurrentWord(page: Page) {
  const target = (await page.getByTestId("current-word").textContent())?.trim() ?? "";
  for (const ch of target) {
    await page.keyboard.press(CODE[ch] ?? "KeyF");
  }
  await page.keyboard.press("Space");
}

test("completes a drill and shows an honest summary", async ({ page }) => {
  await bootDrill(page);

  for (let i = 0; i < 10 && !(await page.getByTestId("summary").isVisible()); i++) {
    await typeCurrentWord(page);
  }

  await expect(page.getByTestId("summary")).toBeVisible();
  // Net WPM is rendered and is a finite number.
  const net = (await page.getByTestId("net-wpm").textContent())?.trim() ?? "";
  expect(Number(net)).toBeGreaterThanOrEqual(0);
  expect(Number.isNaN(Number(net))).toBe(false);
  // The result shows the input history of the words just typed.
  await expect(page.getByTestId("input-history")).toBeVisible();

  // Space must NOT dismiss the result (a stray keystroke while still typing).
  await page.keyboard.press("Space");
  await expect(page.getByTestId("summary")).toBeVisible();
  // Tab restarts into a fresh drill.
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("summary")).toBeHidden();
  await expect(page.getByTestId("progress")).toHaveText(/0\s*\/\s*10/);
});

test("flags a wrong keystroke without colour alone", async ({ page }) => {
  await bootDrill(page);

  // ส (KeyT) is never the first character in lesson 1, so this always diverges.
  await page.keyboard.press("KeyT");

  const wrong = page.locator('[data-testid="current-word"] span.text-danger');
  await expect(wrong.first()).toBeVisible();
  // The error also carries a non-colour cue (underline).
  await expect(wrong.first()).toHaveClass(/underline/);
});

test("Tab restarts the drill", async ({ page }) => {
  await bootDrill(page);

  await typeCurrentWord(page); // commit one word -> progress 1/10
  await expect(page.getByTestId("progress")).toHaveText(/1\s*\/\s*10/);

  await page.keyboard.press("Tab");
  await expect(page.getByTestId("progress")).toHaveText(/0\s*\/\s*10/);
});
