import { defineConfig, devices } from "@playwright/test";

const externalURL = process.env.PLAYWRIGHT_BASE_URL;
const localURL = `http://127.0.0.1:4173${process.env.DEPLOY_BASE_PATH ?? "/"}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: externalURL ?? localURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalURL
    ? undefined
    : {
        command: `npm run ${process.env.PLAYWRIGHT_PRODUCTION === "true" ? "preview" : "dev"} -- --port 4173 --strictPort`,
        url: localURL,
        reuseExistingServer: !process.env.CI,
      },
});
