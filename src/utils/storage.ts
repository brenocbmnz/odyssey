import { isRawg } from "../config/source";
const key = isRawg ? "odyssey:favorites:rawg:v1" : "gamehub:favorites:v1";
export function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}
export function saveFavorites(ids: string[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
export const favoritesKey = key;
