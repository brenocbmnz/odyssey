import { Link } from "@tanstack/react-router";
import { useFavorites } from "../contexts/FavoritesContext";
import { useFavoriteGames } from "../hooks/useFavoriteGames";
import { GameGrid } from "../components/games/GameGrid";
import { Button } from "../components/ui/button";
export function Favorites() {
  const { favorites } = useFavorites();
  const query = useFavoriteGames(favorites);
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
        games={query.games}
        loading={query.loading}
        error={query.error}
        retry={query.retry}
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
