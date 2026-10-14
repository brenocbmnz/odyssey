import { ThemeProvider, initializeTheme } from "./contexts/ThemeContext";
import { StartupError } from "./pages/RouteErrors";
import { LanguageProvider } from "./i18n/LanguageContext";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes/router";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import "./index.css";
import { isRawg } from "./config/source";
const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
initializeTheme();
async function start() {
  if (!isRawg) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledFrame: "bypass",
      quiet: true,
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  } else if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((item) =>
          item.active?.scriptURL.endsWith("/mockServiceWorker.js"),
        )
        .map((item) => item.unregister()),
    );
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <LanguageProvider>
            <FavoritesProvider>
              <RouterProvider router={router} />
            </FavoritesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
void start().catch(() => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <ThemeProvider>
        <LanguageProvider>
          <StartupError />
        </LanguageProvider>
      </ThemeProvider>,
    );
  }
});
