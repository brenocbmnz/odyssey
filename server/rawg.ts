import type { IncomingMessage, ServerResponse } from "node:http";
interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  rating_top: number;
  added: number;
  description_raw?: string;
  genres: { slug: string; name: string }[];
}
interface RawgList {
  count: number;
  next: string | null;
  results: RawgGame[];
}
const genres: Record<string, string> = {
  Ação: "action",
  Puzzle: "puzzle",
  Estratégia: "strategy",
  Aventura: "adventure",
  Casual: "casual",
};
const labels: Record<string, string> = {
  action: "Ação",
  puzzle: "Puzzle",
  strategy: "Estratégia",
  adventure: "Aventura",
  casual: "Casual",
  "role-playing-games-rpg": "RPG",
  shooter: "Tiro",
  indie: "Indie",
  simulation: "Simulação",
  sports: "Esportes",
  racing: "Corrida",
  platformer: "Plataforma",
};
function normalize(game: RawgGame) {
  if (!game || !Number.isInteger(game.id) || typeof game.name !== "string")
    throw new Error("Invalid upstream data");
  return {
    id: String(game.id),
    name: game.name,
    category:
      labels[game.genres?.[0]?.slug] ?? game.genres?.[0]?.name ?? "Outros",
    description: game.description_raw || "Descrição não disponível na RAWG.",
    releaseDate: game.released,
    popularity: game.added ?? 0,
    rating: game.rating ?? 0,
    image: game.background_image?.startsWith("https://")
      ? game.background_image
      : "/art/game-0.svg",
    source: "rawg",
  };
}
export async function handleRawg(
  req: IncomingMessage,
  res: ServerResponse,
  key = process.env.RAWG_API_KEY,
) {
  const respond = (status: number, data: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));
  };
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    respond(405, { message: "Método não permitido." });
    return;
  }
  if (!key?.trim()) {
    respond(503, { message: "Configure RAWG_API_KEY no servidor." });
    return;
  }
  const input = new URL(req.url ?? "/", "http://localhost");
  const id =
    input.searchParams.get("id") ??
    input.pathname.match(/^\/api\/games\/(\d+)$/)?.[1];
  if (input.pathname !== "/api/games" && !id) {
    respond(404, { message: "Jogo não encontrado." });
    return;
  }
  if (id && !/^\d{1,10}$/.test(id)) {
    respond(400, { message: "ID inválido." });
    return;
  }
  const url = new URL(`https://api.rawg.io/api/games${id ? `/${id}` : ""}`);
  url.searchParams.set("key", key.trim());
  if (!id) {
    const page = Number(input.searchParams.get("page") ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      respond(400, { message: "Página inválida." });
      return;
    }
    const category = input.searchParams.get("category");
    if (category && !genres[category]) {
      respond(400, { message: "Categoria inválida." });
      return;
    }
    const order: Record<string, string> = {
      name: "name",
      popularity: "-added",
      release: "-released",
    };
    url.searchParams.set(
      "ordering",
      order[input.searchParams.get("sort") ?? "popularity"] ?? "-added",
    );
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", "24");
    if (category) url.searchParams.set("genres", genres[category]);
    const search = input.searchParams.get("search")?.trim().slice(0, 150);
    if (search) url.searchParams.set("search", search);
    // Apenas jogos já lançados; evita que novidades sejam dominadas por datas futuras.
    url.searchParams.set(
      "dates",
      `1970-01-01,${new Date().toISOString().slice(0, 10)}`,
    );
  }
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      const status = [404, 429].includes(response.status)
        ? response.status
        : 502;
      respond(status, {
        message:
          response.status === 429
            ? "Limite de consultas atingido. Tente novamente mais tarde."
            : "Não foi possível consultar a RAWG. Verifique a chave e tente novamente.",
      });
      return;
    }
    const data: unknown = await response.json();
    const result = id
      ? normalize(data as RawgGame)
      : (() => {
          const list = data as RawgList;
          if (!Array.isArray(list.results) || typeof list.count !== "number")
            throw new Error("Invalid upstream data");
          return {
            games: list.results.map(normalize),
            total: list.count,
            hasMore: Boolean(list.next),
          };
        })();
    // Nunca repassa next/previous: as URLs da RAWG podem incluir a chave.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );
    respond(200, result);
  } catch {
    respond(502, { message: "A RAWG não respondeu. Tente novamente." });
  }
}
