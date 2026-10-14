import { http, HttpResponse, delay } from "msw";
import { games } from "./data";
export const handlers = [
  http.get("/api/games", async ({ request }) => {
    await delay(250);
    const params = new URL(request.url).searchParams;
    const search = (params.get("search") ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
    const result = games.filter(
      (game) =>
        game.name
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .includes(search) &&
        (!params.get("category") || game.category === params.get("category")),
    );
    result.sort((a, b) =>
      params.get("sort") === "name"
        ? a.name.localeCompare(b.name)
        : params.get("sort") === "release"
          ? (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")
          : b.popularity - a.popularity,
    );
    return HttpResponse.json({
      games: result,
      total: result.length,
      hasMore: false,
    });
  }),
  http.get("/api/games/:id", async ({ params }) => {
    await delay(200);
    const game = games.find((item) => item.id === params.id);
    return game
      ? HttpResponse.json(game)
      : HttpResponse.json({ message: "Jogo não encontrado" }, { status: 404 });
  }),
];
