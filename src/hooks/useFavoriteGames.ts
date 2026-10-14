import { useQueries } from "@tanstack/react-query";
import { fetchGame } from "../services/api";
export function useFavoriteGames(ids: string[]) {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["game", id],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchGame(id, signal),
      staleTime: 60000,
    })),
  });
  return {
    games: queries.flatMap((query) => (query.data ? [query.data] : [])),
    loading: queries.some((query) => query.isPending),
    error: queries.some((query) => query.isError),
    retry: () => {
      void Promise.all(queries.map((query) => query.refetch()));
    },
  };
}
