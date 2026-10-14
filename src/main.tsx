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
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
void start().catch(() => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML =
      '<main class="empty" role="alert"><h1>Não foi possível iniciar o Odyssey</h1><p>A API demonstrativa precisa de um navegador com Service Worker e de HTTPS ou localhost.</p><button onclick="location.reload()">Tentar novamente</button></main>';
  }
});
