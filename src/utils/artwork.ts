export const neutralPanel = "#293330";
export function artworkSource(source: string): string {
  try {
    const url = new URL(source);
    if (
      url.protocol === "https:" &&
      url.hostname === "media.rawg.io" &&
      url.pathname.startsWith("/media/")
    )
      return `/api/artwork?url=${encodeURIComponent(source)}`;
  } catch {
    /* Assets locais não precisam de proxy. */
  }
  return source;
}
export function panelFromPixels(pixels: ArrayLike<number>): string {
  const buckets = new Map<
    string,
    { r: number; g: number; b: number; count: number; score: number }
  >();
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const r = pixels[index],
      g = pixels[index + 1],
      b = pixels[index + 2];
    if (pixels[index + 3] < 200) continue;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    if (max < 75 || min > 235) continue;
    const saturation = max ? (max - min) / max : 0;
    const key = `${r >> 5},${g >> 5},${b >> 5}`;
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0, score: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count++;
    bucket.score += (0.2 + saturation) * (max / 255) ** 0.6;
    buckets.set(key, bucket);
  }
  const dominant = [...buckets.values()].sort((a, b) => b.score - a.score)[0];
  if (!dominant) return neutralPanel;
  // Mistura com grafite: conserva o matiz da capa sem clarear o painel.
  const graphite = [24, 29, 31];
  const rgb = [dominant.r, dominant.g, dominant.b].map((sum, index) =>
    Math.round((sum / dominant.count) * 0.26 + graphite[index] * 0.74),
  );
  return `rgb(${rgb.join(", ")})`;
}
export function panelFromImage(image: HTMLImageElement): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return neutralPanel;
    context.drawImage(image, 0, 0, 32, 32);
    return panelFromPixels(context.getImageData(0, 0, 32, 32).data);
  } catch {
    return neutralPanel;
  }
}
