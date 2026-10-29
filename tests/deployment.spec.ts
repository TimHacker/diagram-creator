import { test, expect } from "@playwright/test";

test("Deployment: production assets and home link stay within the project path", async ({
  page,
}) => {
  test.skip(process.env.PLAYWRIGHT_PRODUCTION !== "true");
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "New diagram", exact: true }),
  ).toBeVisible();
  const projectPath = new URL(
    process.env.PLAYWRIGHT_BASE_URL ??
      `http://127.0.0.1:4173${process.env.DEPLOY_BASE_PATH ?? "/"}`,
  ).pathname;
  const assets = await page
    .locator('script[src], link[rel="stylesheet"]')
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          new URL(
            element.getAttribute("src") ?? element.getAttribute("href")!,
            document.baseURI,
          ).pathname,
      ),
    );
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) expect(asset.startsWith(projectPath)).toBe(true);
  const home = await page
    .getByRole("link", { name: "Diagram Creator", exact: true })
    .getAttribute("href");
  expect(new URL(home!, page.url()).pathname).toBe(projectPath);
});
