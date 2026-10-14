import { describe, expect, it } from "vitest";
import { artworkSource, neutralPanel, panelFromPixels } from "../utils/artwork";
function pixels(color: number[]) {
  return new Uint8ClampedArray(
    Array.from({ length: 32 }, () => [...color, 255]).flat(),
  );
}
function luminance(rgb: number[]) {
  const values = rgb.map((value) =>
    value / 255 <= 0.04045
      ? value / 255 / 12.92
      : ((value / 255 + 0.055) / 1.055) ** 2.4,
  );
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
describe("Painel adaptativo", () => {
  it("usa proxy apenas para a origem autorizada e preserva assets locais", () => {
    expect(artworkSource("/art/game-0.svg")).toBe("/art/game-0.svg");
    expect(artworkSource("https://example.com/test.jpg")).toBe(
      "https://example.com/test.jpg",
    );
    expect(artworkSource("https://media.rawg.io/media/games/test.jpg")).toBe(
      "/api/artwork?url=https%3A%2F%2Fmedia.rawg.io%2Fmedia%2Fgames%2Ftest.jpg",
    );
  });
  it("diferencia capas e mantém contraste AA do texto secundário", () => {
    const colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [35, 35, 35],
      [255, 255, 0],
      [255, 0, 255],
      [0, 255, 255],
    ];
    const results = colors.map((color) => panelFromPixels(pixels(color)));
    expect(new Set(results).size).toBe(colors.length);
    for (const result of results) {
      const values = result.startsWith("#")
        ? [1, 3, 5].map((index) => parseInt(result.slice(index, index + 2), 16))
        : (result.match(/\d+/g) ?? []).map(Number);
      expect(Math.max(...values)).toBeLessThan(110);
    }
    for (const result of results) {
      const rgb = result.startsWith("#")
        ? [1, 3, 5].map((index) => parseInt(result.slice(index, index + 2), 16))
        : (result.match(/\d+/g) ?? []).map(Number);
      expect(
        (luminance([216, 212, 202]) + 0.05) / (luminance(rgb) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("ignora transparência, branco e preto sem inventar uma cor", () => {
    expect(panelFromPixels(new Uint8ClampedArray([255, 0, 0, 0]))).toBe(
      neutralPanel,
    );
    expect(panelFromPixels(pixels([0, 0, 0]))).toBe(neutralPanel);
    expect(panelFromPixels(pixels([255, 255, 255]))).toBe(neutralPanel);
  });
});
