import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleRawg } from "./server/rawg.js";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "rawg-local-api",
        configureServer(server) {
          if (env.VITE_GAME_SOURCE !== "rawg") return;
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith("/api/games"))
              void handleRawg(req, res, env.RAWG_API_KEY);
            else next();
          });
        },
      },
    ],
    test: {
      environment: "jsdom",
      testTimeout: 15000,
      exclude: ["e2e/**", "node_modules/**"],
      setupFiles: ["./src/test/setup.ts"],
      css: true,
    },
  };
});
