import { isRawg } from "../config/source";
const demoCategories = [
  "Arcade",
  "Puzzle",
  "Estratégia",
  "Aventura",
  "Casual",
] as const;
const realCategories = [
  "Ação",
  "Puzzle",
  "Estratégia",
  "Aventura",
  "Casual",
] as const;
export const categories: readonly Category[] = isRawg
  ? realCategories
  : demoCategories;
export type Category =
  (typeof demoCategories)[number] | (typeof realCategories)[number];
export type Sort = "popularity" | "name" | "release";
export interface Game {
  id: string;
  name: string;
  category: string;
  description: string;
  releaseDate: string | null;
  popularity: number;
  image: string;
  rating?: number;
  source?: "rawg";
}
export interface GameFilters {
  search?: string;
  category?: Category;
  sort?: Sort;
  page?: number;
}

export interface GameList {
  games: Game[];
  total: number;
  hasMore: boolean;
}
