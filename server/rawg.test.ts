import { afterEach, describe, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRawg } from "./rawg.js";
const fixture = {
  id: 4200,
  name: "Portal 2",
  background_image: "https://media.rawg.io/test.jpg",
  released: "2011-04-18",
  rating: 4.6,
  rating_top: 5,
  added: 200,
  genres: [{ slug: "puzzle", name: "Puzzle" }],
  description_raw: "A real description.",
};
async function request(path: string, key = "server-test-key", method = "GET") {
  const headers = new Map<string, string>();
  let body = "";
  const response = {
    statusCode: 200,
    setHeader: (name: string, value: string) => headers.set(name, value),
    end: (value: string) => {
      body = value;
    },
  };
  await handleRawg(
    { url: path, method } as IncomingMessage,
    response as unknown as ServerResponse,
    key,
  );
  return { status: response.statusCode, body, headers, data: JSON.parse(body) };
}
afterEach(() => vi.unstubAllGlobals());
describe("Proxy RAWG", () => {
  it("normaliza filtros, paginação e resposta sem expor chave ou links upstream", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        count: 100,
        next: "https://api.rawg.io/api/games?key=server-test-key&page=3",
        results: [fixture],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await request(
      "/api/games?search=portal&category=Puzzle&sort=name&page=2",
    );
    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.hostname).toBe("api.rawg.io");
    expect(url.searchParams.get("key")).toBe("server-test-key");
    expect(url.searchParams.get("genres")).toBe("puzzle");
    expect(url.searchParams.get("ordering")).toBe("name");
    expect(url.searchParams.get("page")).toBe("2");
    expect(result.status).toBe(200);
    expect(result.data.games[0]).toMatchObject({
      id: "4200",
      category: "Puzzle",
      source: "rawg",
      rating: 4.6,
    });
    expect(result.data.hasMore).toBe(true);
    expect(result.body).not.toContain("server-test-key");
    expect(result.body).not.toContain("next");
  });
  it("carrega detalhes e trata imagens e datas ausentes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ ...fixture, background_image: null, released: null }),
        ),
    );
    const result = await request("/api/games/4200");
    expect(result.data.description).toBe("A real description.");
    expect(result.data.image).toBe("/art/game-0.svg");
    expect(result.data.releaseDate).toBeNull();
  });
  it("não consulta upstream sem chave, com página inválida ou método inválido", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await request("/api/games", "")).status).toBe(503);
    expect((await request("/api/games?page=-1")).status).toBe(400);
    expect((await request("/api/games?category=invalid")).status).toBe(400);
    expect((await request("/api/games", "test", "POST")).status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([401, 404, 429, 500])(
    "trata HTTP %i sem repassar dados privados",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("server-test-key", { status })),
      );
      const result = await request("/api/games");
      expect(result.status).toBe([404, 429].includes(status) ? status : 502);
      expect(result.body).not.toContain("server-test-key");
      expect(result.headers.has("Cache-Control")).toBe(false);
    },
  );
  it("trata timeout e resposta malformada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private upstream url")),
    );
    expect((await request("/api/games")).status).toBe(502);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ invalid: true })),
    );
    expect((await request("/api/games")).status).toBe(502);
  });
});
