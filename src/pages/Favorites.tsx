import { Link } from "@tanstack/react-router";
import { useFavorites } from "../contexts/FavoritesContext";
import { useGames } from "../hooks/useGames";
import { GameGrid } from "../components/games/GameGrid";
import { Button } from "../components/ui/button";
export function Favorites() {
  const { favorites } = useFavorites();
  const query = useGames();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SUA COLEÇÃO PESSOAL</div>
          <h1>
            Meus favoritos<span className="purple-dot">.</span>
          </h1>
          <p>As aventuras que você quer manter por perto.</p>
        </div>
      </div>
      <GameGrid
        games={query.data?.filter((game) => favorites.includes(game.id))}
        loading={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
        empty="Use o coração nos cards para começar sua coleção. Seus favoritos ficam salvos neste navegador."
      />
      {!favorites.length && (
        <div className="center">
          <Button asChild>
            <Link
              to="/catalog"
              search={{ q: "", category: "", sort: "popularity" }}
            >
              Descobrir jogos
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
