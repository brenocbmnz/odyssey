import axios from "axios";
import type { Game, GameFilters } from "../types/game";
const api = axios.create({ baseURL: "/api", timeout: 10000 });
export const fetchGames = async (filters: GameFilters, signal?: AbortSignal) =>
  (await api.get<Game[]>("/games", { params: filters, signal })).data;
export const fetchGame = async (id: string, signal?: AbortSignal) =>
  (await api.get<Game>(`/games/${encodeURIComponent(id)}`, { signal })).data;
