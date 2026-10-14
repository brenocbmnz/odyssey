import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 2,
  timeout: 60000,
  testMatch:
    process.env.E2E_SOURCE === "rawg"
      ? ["rawg.spec.ts", "accessibility.spec.ts"]
      : ["gamehub.spec.ts", "accessibility.spec.ts"],
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
});
