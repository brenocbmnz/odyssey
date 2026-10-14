export const categories = [
  "Arcade",
  "Puzzle",
  "Estratégia",
  "Aventura",
  "Casual",
] as const;
export type Category = (typeof categories)[number];
export type Sort = "popularity" | "name" | "release";
export interface Game {
  id: string;
  name: string;
  category: Category;
  description: string;
  releaseDate: string;
  popularity: number;
  image: string;
}
export interface GameFilters {
  search?: string;
  category?: Category;
  sort?: Sort;
}
