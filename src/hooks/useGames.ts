import { useQuery } from "@tanstack/react-query";
import { fetchGame, fetchGames } from "../services/api";
import type { GameFilters } from "../types/game";
export function useGames(filters: GameFilters = {}) {
  return useQuery({
    queryKey: ["games", filters],
    queryFn: ({ signal }) => fetchGames(filters, signal),
    staleTime: 60000,
  });
}
export function useGame(id: string) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: ({ signal }) => fetchGame(id, signal),
    staleTime: 60000,
  });
}
