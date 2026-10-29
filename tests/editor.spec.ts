import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const nodes = (page: Page) => page.locator(".react-flow__node");

async function addShape(page: Page, shape = "Rectangle") {
  await page
    .getByRole("button", { name: `Add ${shape.toLowerCase()}`, exact: true })
    .click();
  return nodes(page).last();
}

async function connectPair(page: Page) {
  await addShape(page);
  await page.getByLabel("Label", { exact: true }).fill("Browser");
  await page.getByLabel("Label", { exact: true }).blur();
  await addShape(page, "Ellipse");
  await page.getByLabel("Label", { exact: true }).fill("API");
  await page.getByLabel("Label", { exact: true }).blur();
  await page.getByLabel("Connect to").selectOption({ label: "Browser" });
  await page
    .getByRole("button", { name: "Create connector", exact: true })
    .click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("./");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "New diagram", exact: true }).click();
});

test("A1: add and independently select the three shapes", async ({ page }) => {
  for (const shape of ["Rectangle", "Ellipse", "Diamond"])
    await addShape(page, shape);
  await expect(nodes(page)).toHaveCount(3);
  for (const shape of ["Rectangle", "Ellipse", "Diamond"]) {
    await nodes(page).filter({ hasText: shape }).click();
    await expect(page.getByLabel("Label", { exact: true })).toHaveValue(shape);
    await expect(page.locator(".react-flow__node.selected")).toHaveCount(1);
  }
});

test("A2: move and resize one shape without changing another", async ({
  page,
}) => {
  await addShape(page);
  const first = nodes(page).filter({ hasText: "Rectangle" });
  const before = await first.boundingBox();
  await addShape(page, "Ellipse");
  const other = nodes(page).filter({ hasText: "Ellipse" });
  const otherBefore = await other.boundingBox();
  await first.click();
  const box = await first.boundingBox();
  await page.mouse.move(box!.x + 50, box!.y + 35);
  await page.mouse.down();
  await page.mouse.move(box!.x + 130, box!.y + 95, { steps: 12 });
  await page.mouse.up();
  await page.getByLabel("Width", { exact: true }).fill("240");
  await page.getByLabel("Width", { exact: true }).blur();
  await page.getByLabel("Height", { exact: true }).fill("140");
  await page.getByLabel("Height", { exact: true }).blur();
  await expect(first).toHaveCSS("width", "240px");
  await expect(first).toHaveCSS("height", "140px");
  expect((await first.boundingBox())!.x).toBeGreaterThan(before!.x + 40);
  expect(await other.boundingBox()).toEqual(otherBefore);
});

test("A3: edit shape and connector labels", async ({ page }) => {
  await connectPair(page);
  await page.locator(".react-flow__edge").press("Enter");
  await page.getByLabel("Label", { exact: true }).fill("HTTPS");
  await page.getByLabel("Label", { exact: true }).blur();
  await expect(page.locator(".react-flow__edge-text")).toHaveText("HTTPS");
  await expect(nodes(page).filter({ hasText: "Browser" })).toHaveCount(1);
});

test("A4: connectors remain attached when a shape moves", async ({ page }) => {
  await connectPair(page);
  const edge = page.locator(".react-flow__edge-path");
  const pathBefore = await edge.getAttribute("d");
  await nodes(page).filter({ hasText: "API" }).click();
  await page.getByLabel("X position").fill("650");
  await page.getByLabel("X position").blur();
  await expect(edge).not.toHaveAttribute("d", pathBefore!);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
});

test("A5: deleting a shape deletes attached connectors and undo restores both", async ({
  page,
}) => {
  await connectPair(page);
  await nodes(page).filter({ hasText: "API" }).click();
  await page
    .getByRole("button", { name: "Delete selection", exact: true })
    .click();
  await expect(nodes(page)).toHaveCount(1);
  await expect(page.locator(".react-flow__edge")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(nodes(page)).toHaveCount(2);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
});

test("A6: undo and redo restore edits", async ({ page }) => {
  await addShape(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(nodes(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(nodes(page)).toHaveCount(1);
});

test("A7: a different edit clears redo history", async ({ page }) => {
  await addShape(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await addShape(page, "Diamond");
  await expect(
    page.getByRole("button", { name: "Redo", exact: true }),
  ).toBeDisabled();
  await expect(nodes(page).filter({ hasText: "Diamond" })).toHaveCount(1);
});

test("A8: save and reload preserves labels, geometry and connectors", async ({
  page,
}) => {
  await connectPair(page);
  await nodes(page).filter({ hasText: "API" }).click();
  await page.getByLabel("Width", { exact: true }).fill("230");
  await page.getByLabel("Width", { exact: true }).blur();
  await page.getByLabel("X position").fill("540");
  await page.getByLabel("X position").blur();
  await page.getByLabel("Diagram name").fill("Team architecture");
  await page.getByRole("button", { name: "Save diagram", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.reload();
  await expect(page.getByLabel("Diagram name")).toHaveValue(
    "Team architecture",
  );
  await expect(nodes(page)).toHaveCount(2);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  const api = nodes(page).filter({ hasText: "API" });
  await expect(api).toHaveCSS("width", "230px");
  await api.click();
  await expect(page.getByLabel("X position")).toHaveValue("540");
});

test("A9: PNG includes the whole diagram, not just the viewport", async ({
  page,
}) => {
  await addShape(page);
  await page.getByLabel("Label", { exact: true }).fill("Visible service");
  await page.getByLabel("Label", { exact: true }).blur();
  await addShape(page, "Diamond");
  await page.getByLabel("X position").fill("1800");
  await page.getByLabel("X position").blur();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  const buffer = await readFile((await download.path())!);
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const image = await page.evaluate(async (base64) => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let ink = 0;
    let leftInk = 0;
    let rightInk = 0;
    let marginInk = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      if (
        pixels[offset] < 210 &&
        pixels[offset + 1] < 210 &&
        pixels[offset + 2] < 210
      ) {
        ink++;
        const x = (offset / 4) % canvas.width;
        const y = Math.floor(offset / 4 / canvas.width);
        if (x < canvas.width / 3) leftInk++;
        if (x > (canvas.width * 2) / 3) rightInk++;
        if (x < 30 || y < 30 || x > canvas.width - 30 || y > canvas.height - 30)
          marginInk++;
      }
    }
    return {
      width: bitmap.width,
      height: bitmap.height,
      ink,
      leftInk,
      rightInk,
      marginInk,
    };
  }, buffer.toString("base64"));
  expect(image.width).toBeGreaterThan(1800);
  expect(image.height).toBeGreaterThan(100);
  expect(image.ink).toBeGreaterThan(200);
  expect(image.leftInk).toBeGreaterThan(100);
  expect(image.rightInk).toBeGreaterThan(100);
  expect(image.marginInk).toBe(0);
});

test("A10: editing, saving and PNG export work offline after loading", async ({
  page,
  context,
}) => {
  await page.evaluate(() => document.fonts.ready);
  await context.setOffline(true);
  await addShape(page);
  await page.getByLabel("Label", { exact: true }).fill("Offline service");
  await page.getByLabel("Label", { exact: true }).blur();
  await page.getByRole("button", { name: "Save diagram", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
});

test("Mobile: document controls stay available and properties do not cover the canvas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "New diagram", exact: true }),
  ).toBeVisible();
  await addShape(page);
  const canvas = await page
    .getByRole("main", { name: "Diagram canvas" })
    .boundingBox();
  const properties = await page
    .getByRole("complementary", { name: "Properties" })
    .boundingBox();
  expect(properties!.y).toBeGreaterThanOrEqual(canvas!.y + canvas!.height);
  await page.getByLabel("Label", { exact: true }).fill("Mobile service");
  await page.getByLabel("Label", { exact: true }).blur();
  await expect(nodes(page)).toContainText("Mobile service");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Pointer resizing survives saving and reloading", async ({ page }) => {
  const shape = await addShape(page);
  const handle = shape.locator(
    ".react-flow__resize-control.handle.bottom.right",
  );
  const box = await handle.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + 63, box!.y + 43, { steps: 10 });
  await page.mouse.up();
  const resized = await shape.boundingBox();
  expect(resized!.width).toBeGreaterThan(220);
  await page.getByRole("button", { name: "Save diagram", exact: true }).click();
  await page.reload();
  await expect(nodes(page)).toHaveCSS("width", `${resized!.width}px`);
  await expect(nodes(page)).toHaveCSS("height", `${resized!.height}px`);
});
