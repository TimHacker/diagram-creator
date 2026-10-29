import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const nodes = (page: Page) => page.locator(".react-flow__node");
const generic = (page: Page) =>
  page.getByRole("group", { name: "Generic architecture icons" });
const cloud = (page: Page) =>
  page.getByRole("group", { name: "Cloud & platforms icons" });
const addIcon = (page: Page, name: string) =>
  page.getByRole("button", { name: `Add ${name} icon`, exact: true }).click();

async function exportPixels(page: Page, rgb: [number, number, number]) {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  const buffer = await readFile((await (await download).path())!);
  return page.evaluate(
    async ({ base64, rgb }) => {
      const blob = await (
        await fetch(`data:image/png;base64,${base64}`)
      ).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      let matching = 0;
      for (let offset = 0; offset < pixels.length; offset += 4)
        if (
          Math.abs(pixels[offset] - rgb[0]) < 24 &&
          Math.abs(pixels[offset + 1] - rgb[1]) < 24 &&
          Math.abs(pixels[offset + 2] - rgb[2]) < 24
        )
          matching++;
      return matching;
    },
    { base64: buffer.toString("base64"), rgb },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "New diagram", exact: true }).click();
});

test("I1: generic and cloud icon packs are listed with their licences", async ({
  page,
}) => {
  await expect(generic(page)).toBeVisible();
  await expect(generic(page)).toContainText("Lucide");
  await expect(generic(page)).toContainText("ISC");
  await expect(cloud(page)).toBeVisible();
  await expect(cloud(page)).toContainText("Simple Icons");
  await expect(cloud(page)).toContainText("CC0-1.0");
  await expect(
    generic(page).getByRole("button", { name: "Add Database icon" }),
  ).toBeVisible();
  await expect(
    cloud(page).getByRole("button", { name: "Add Kubernetes icon" }),
  ).toBeVisible();
});

test("I2: adding an icon from either pack creates a selected, labelled shape", async ({
  page,
}) => {
  await addIcon(page, "Database");
  await expect(nodes(page)).toHaveCount(1);
  await expect(nodes(page).first()).toContainText("Database");
  await expect(
    nodes(page).first().locator('[data-icon="generic/database"]'),
  ).toBeVisible();
  await addIcon(page, "Kubernetes");
  await expect(nodes(page)).toHaveCount(2);
  const selected = page.locator(".react-flow__node.selected");
  await expect(selected).toHaveCount(1);
  await expect(selected).toContainText("Kubernetes");
  await expect(
    selected.locator('[data-icon="cloud/kubernetes"] svg'),
  ).toBeVisible();
  await expect(page.getByLabel("Label", { exact: true })).toHaveValue(
    "Kubernetes",
  );
});

test("I3: searching filters icons across both packs", async ({ page }) => {
  const search = page.getByRole("searchbox", { name: "Search icons" });
  await search.fill("data");
  await expect(
    generic(page).getByRole("button", { name: "Add Database icon" }),
  ).toBeVisible();
  await expect(
    cloud(page).getByRole("button", { name: "Add PostgreSQL icon" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add User icon", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add Kubernetes icon", exact: true }),
  ).toHaveCount(0);
  await search.fill("");
  await expect(
    page.getByRole("button", { name: "Add User icon", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add Kubernetes icon", exact: true }),
  ).toBeVisible();
});

test("I4: changing or removing a shape icon in Properties is undoable", async ({
  page,
}) => {
  await addIcon(page, "Server");
  const shape = nodes(page).first();
  const icon = page.getByLabel("Icon", { exact: true });
  await expect(icon).toHaveValue("generic/server");
  await icon.selectOption({ label: "Docker" });
  await expect(shape.locator('[data-icon="cloud/docker"]')).toBeVisible();
  await expect(shape.locator('[data-icon="generic/server"]')).toHaveCount(0);
  await icon.selectOption({ label: "No icon" });
  await expect(shape.locator("[data-icon]")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(shape.locator('[data-icon="cloud/docker"]')).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(shape.locator('[data-icon="generic/server"]')).toBeVisible();
});

test("I5: icons from both packs survive saving and legacy symbols still open", async ({
  page,
}) => {
  await addIcon(page, "Load balancer");
  await addIcon(page, "Redis");
  await page.getByRole("button", { name: "Save diagram", exact: true }).click();
  await page.reload();
  await expect(nodes(page)).toHaveCount(2);
  await expect(
    nodes(page).locator('[data-icon="generic/load-balancer"]'),
  ).toBeVisible();
  await expect(nodes(page).locator('[data-icon="cloud/redis"]')).toBeVisible();

  await page.evaluate(() =>
    localStorage.setItem(
      "diagram-creator:v1",
      JSON.stringify({
        version: 1,
        diagram: {
          name: "Legacy",
          edges: [],
          nodes: [
            {
              id: "legacy",
              type: "shape",
              position: { x: 0, y: 0 },
              data: {
                label: "Old store",
                shape: "ellipse",
                colour: "#ffffff",
                symbol: "database",
              },
              style: { width: 176, height: 100 },
            },
          ],
        },
      }),
    ),
  );
  await page.reload();
  await expect(page.getByLabel("Diagram name")).toHaveValue("Legacy");
  await expect(
    nodes(page).locator('[data-icon="generic/database"]'),
  ).toBeVisible();
});

test("I6: exported PNG contains the icons", async ({ page }) => {
  await addIcon(page, "Kubernetes");
  await page.getByLabel("Label", { exact: true }).fill("K8s");
  await page.getByLabel("Label", { exact: true }).blur();
  // Kubernetes brand blue #326CE5 is not used anywhere else in a shape.
  expect(await exportPixels(page, [0x32, 0x6c, 0xe5])).toBeGreaterThan(200);
  await page.getByLabel("Icon", { exact: true }).selectOption({
    label: "No icon",
  });
  expect(await exportPixels(page, [0x32, 0x6c, 0xe5])).toBe(0);
});

test("I7: icons can be added and exported offline with no network requests", async ({
  page,
  context,
}) => {
  await page.evaluate(() => document.fonts.ready);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (!/^(data|blob):/.test(request.url())) requests.push(request.url());
  });
  await context.setOffline(true);
  await addIcon(page, "Queue");
  await addIcon(page, "Google Cloud");
  await expect(
    nodes(page).locator('[data-icon="cloud/googlecloud"] svg'),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  expect(requests).toEqual([]);
});

test("I8: third-party notices document each pack's source, licence and version", async ({
  page,
}) => {
  const notice = await readFile("THIRD_PARTY_NOTICES.md", "utf8");
  const version = async (name: string) =>
    JSON.parse(await readFile(`node_modules/${name}/package.json`, "utf8"))
      .version as string;
  const versions = {
    lucide: await version("lucide-react"),
    simpleIcons: await version("simple-icons"),
  };
  expect(notice).toContain("Lucide");
  expect(notice).toContain("ISC");
  expect(notice).toContain(versions.lucide);
  expect(notice).toContain("Simple Icons");
  expect(notice).toContain("CC0-1.0");
  expect(notice).toContain(versions.simpleIcons);
  expect(notice).toMatch(/trademark/i);

  const all = Object.values(await import("simple-icons")) as {
    slug: string;
    title: string;
    license?: unknown;
  }[];
  const slugs = await cloud(page)
    .locator("[data-slug]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-slug")!),
    );
  expect(slugs.length).toBeGreaterThan(10);
  for (const slug of slugs) {
    const icon = all.find((entry) => entry.slug === slug);
    expect(icon, slug).toBeTruthy();
    expect(icon!.license, `${slug} has a non-CC0 licence`).toBeUndefined();
    expect(notice).toContain(icon!.title);
  }
});
