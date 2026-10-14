import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    testTimeout: 15000,
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
