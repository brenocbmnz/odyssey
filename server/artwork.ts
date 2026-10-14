import type { IncomingMessage, ServerResponse } from "node:http";
const MAX_BYTES = 4 * 1024 * 1024;
export async function handleArtwork(req: IncomingMessage, res: ServerResponse) {
  const fail = (status: number) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Imagem indisponível." }));
  };
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(405);
    return;
  }
  let url: URL;
  try {
    url = new URL(
      new URL(req.url ?? "/", "http://localhost").searchParams.get("url") ?? "",
    );
  } catch {
    fail(400);
    return;
  }
  // Origem e caminho fixos: esta rota não é um proxy de URLs arbitrárias.
  if (
    url.protocol !== "https:" ||
    url.hostname !== "media.rawg.io" ||
    url.port ||
    url.username ||
    url.password ||
    !url.pathname.startsWith("/media/")
  ) {
    fail(400);
    return;
  }
  try {
    const upstream = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    const type = upstream.headers.get("content-type")?.split(";")[0] ?? "";
    if (
      !upstream.ok ||
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
      ].includes(type) ||
      !upstream.body
    ) {
      fail(502);
      return;
    }
    if (Number(upstream.headers.get("content-length")) > MAX_BYTES) {
      await upstream.body.cancel();
      fail(413);
      return;
    }
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        fail(413);
        return;
      }
      chunks.push(value);
    }
    res.setHeader("Content-Type", type);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
    );
    res.end(Buffer.concat(chunks));
  } catch {
    fail(502);
  }
}
