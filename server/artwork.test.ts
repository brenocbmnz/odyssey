import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleArtwork } from "./artwork.js";
async function request(url: string, method = "GET") {
  const headers = new Map<string, string>();
  let body: unknown;
  const response = {
    statusCode: 200,
    setHeader: (name: string, value: string) => headers.set(name, value),
    end: (value: unknown) => {
      body = value;
    },
  };
  await handleArtwork(
    { url, method } as IncomingMessage,
    response as unknown as ServerResponse,
  );
  return { status: response.statusCode, headers, body };
}
afterEach(() => vi.unstubAllGlobals());
describe("Proxy de capas", () => {
  it.each([
    "http://media.rawg.io/media/test.jpg",
    "https://example.com/media/test.jpg",
    "https://media.rawg.io:444/media/test.jpg",
    "https://user:pass@media.rawg.io/media/test.jpg",
    "https://media.rawg.io/other/test.jpg",
    "http://127.0.0.1/private",
  ])("rejeita origem não permitida %s", async (url) => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);
    expect(
      (await request(`/api/artwork?url=${encodeURIComponent(url)}`)).status,
    ).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it("serve imagem com cache e bloqueia redirecionamentos", async () => {
    const upstream = vi
      .fn()
      .mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "content-type": "image/jpeg" },
        }),
      );
    vi.stubGlobal("fetch", upstream);
    const result = await request(
      "/api/artwork?url=https%3A%2F%2Fmedia.rawg.io%2Fmedia%2Ftest.jpg",
    );
    expect(result.status).toBe(200);
    expect(result.headers.get("Content-Type")).toBe("image/jpeg");
    expect(result.body).toEqual(Buffer.from([1, 2, 3]));
    expect(upstream.mock.calls[0][1].redirect).toBe("error");
  });
  it("rejeita HTML, imagens grandes e falhas de rede", async () => {
    const path =
      "/api/artwork?url=https%3A%2F%2Fmedia.rawg.io%2Fmedia%2Ftest.jpg";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("html", { headers: { "content-type": "text/html" } }),
        ),
    );
    expect((await request(path)).status).toBe(502);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("large", {
            headers: {
              "content-type": "image/jpeg",
              "content-length": "5000000",
            },
          }),
        ),
    );
    expect((await request(path)).status).toBe(413);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect((await request(path)).status).toBe(502);
    expect((await request(path, "POST")).status).toBe(405);
  });
});
