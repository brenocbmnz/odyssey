import { Link } from "@tanstack/react-router";
import { Heart, ArrowUpRight, Flame } from "lucide-react";
import type { Game } from "../../types/game";
import { useFavorites } from "../../contexts/FavoritesContext";
export function GameCard({ game }: { game: Game }) {
  const { favorites, toggle } = useFavorites();
  const saved = favorites.includes(game.id);
  return (
    <article className="game-card">
      <div className="card-art">
        <Link
          to="/games/$gameId"
          params={{ gameId: game.id }}
          aria-label={`Ver detalhes de ${game.name}`}
        >
          <img
            src={game.image}
            alt={`Ilustração de ${game.name}`}
            loading="lazy"
          />
          <span className="art-title">{game.name}</span>
        </Link>
        <button
          className={`favorite-button ${saved ? "saved" : ""}`}
          onClick={() => toggle(game.id)}
          aria-label={`${saved ? "Remover" : "Adicionar"} ${game.name} ${saved ? "dos" : "aos"} favoritos`}
          aria-pressed={saved}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{game.category}</span>
          <span>
            <Flame size={13} /> {game.popularity}%
          </span>
        </div>
        <Link
          to="/games/$gameId"
          params={{ gameId: game.id }}
          className="card-name"
        >
          {game.name}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
