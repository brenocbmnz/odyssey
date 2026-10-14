import { LanguageProvider } from "../i18n/LanguageContext";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { createAppRouter } from "../routes/router";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { favoritesKey, readFavorites } from "../utils/storage";
import { fetchGames, fetchGame } from "../services/api";
import { server } from "./setup";
async function renderApp(path: string) {
  const router = createAppRouter();
  router.update({ history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}
describe("Odyssey", () => {
  it("renderiza cards com imagem, categoria e link de detalhes", async () => {
    await renderApp("/catalog");
    expect(
      await screen.findByRole("link", { name: "Neon Odyssey" }),
    ).toHaveAttribute("href", "/games/1");
    expect(screen.getByAltText("Ilustração de Neon Odyssey")).toBeVisible();
    expect(screen.getAllByText("Arcade").length).toBeGreaterThan(1);
  });
  it("pesquisa pelo nome e apresenta estado vazio", async () => {
    await renderApp("/catalog");
    await screen.findByRole("link", { name: "Neon Odyssey" });
    const input = screen.getByRole("textbox", { name: "Buscar por nome" });
    await userEvent.type(input, "Crystal");
    expect(
      await screen.findByRole("link", { name: "Crystal Quest" }),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Neon Odyssey" }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.clear(input);
    await userEvent.type(input, "inexistente");
    expect(await screen.findByText("Nada por aqui ainda")).toBeVisible();
  });
  it("adiciona, persiste após remontagem e remove favoritos", async () => {
    const view = await renderApp("/catalog");
    await userEvent.click(
      await screen.findByRole("button", {
        name: "Favoritar Neon Odyssey",
      }),
    );
    expect(readFavorites()).toEqual(["1"]);
    view.unmount();
    await renderApp("/favorites");
    expect(
      await screen.findByRole("link", { name: "Neon Odyssey" }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", {
        name: "Favoritar Neon Odyssey",
      }),
    );
    expect(readFavorites()).toEqual([]);
    expect(await screen.findByText("Nada por aqui ainda")).toBeVisible();
  });
  it("exibe erro da API e recupera com tentar novamente", async () => {
    server.use(
      http.get("/api/games", () => HttpResponse.json({}, { status: 500 })),
    );
    await renderApp("/catalog");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar",
    );
    server.resetHandlers();
    await userEvent.click(
      screen.getByRole("button", { name: "Tentar novamente" }),
    );
    expect(
      await screen.findByRole("link", { name: "Neon Odyssey" }),
    ).toBeVisible();
  });
  it("API combina categoria, busca e ordenação e retorna 404", async () => {
    const { games } = await fetchGames({ category: "Puzzle", sort: "name" });
    expect(games).toHaveLength(5);
    expect(games.every((game) => game.category === "Puzzle")).toBe(true);
    expect(games.map((game) => game.name)).toEqual(
      games.map((game) => game.name).sort((a, b) => a.localeCompare(b)),
    );
    expect(
      (await fetchGames({ search: "neon", category: "Puzzle" })).games,
    ).toEqual([]);
    await expect(fetchGame("nao-existe")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
  it("mostra falha nas sugestões e permite pesquisar no catálogo", async () => {
    server.use(
      http.get("/api/games", () => HttpResponse.json({}, { status: 500 })),
    );
    await renderApp("/");
    const input = screen.getByRole("combobox", {
      name: "Pesquisar jogos",
    });
    await userEvent.type(input, "portal");
    expect(
      await screen.findByText(
        "Não foi possível carregar as sugestões. Tente buscar no catálogo.",
        { selector: ".suggestion-message" },
      ),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    expect(
      await screen.findByRole("heading", { name: "Catálogo de jogos." }),
    ).toBeVisible();
  });
  it("tolera dados de favoritos inválidos", () => {
    localStorage.setItem(favoritesKey, "{");
    expect(readFavorites()).toEqual([]);
    localStorage.setItem(favoritesKey, '["1",1,"1"]');
    expect(readFavorites()).toEqual(["1"]);
  });
});
