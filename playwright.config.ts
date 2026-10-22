import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: { timeout: 10000 },
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:5182",
    viewport: { width: 1440, height: 960 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chrome", use: { browserName: "chromium", channel: "chrome" } },
    { name: "edge", use: { browserName: "chromium", channel: "msedge" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 5182 --strictPort",
    url: "http://127.0.0.1:5182",
    reuseExistingServer: false,
  },
});
