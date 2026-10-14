import { useId } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { Link } from "@tanstack/react-router";
import { Heart, ArrowUpRight, Star } from "lucide-react";
import type { Game } from "../../types/game";
import { useFavorites } from "../../contexts/FavoritesContext";
export function GameCard({ game }: { game: Game }) {
  const { t, locale } = useLanguage();
  const titleId = useId();
  const { favorites, toggle } = useFavorites();
  const saved = favorites.includes(game.id);
  return (
    <article className="game-card" aria-labelledby={titleId}>
      <div className="card-art">
        <Link
          to="/games/$gameId"
          params={{ gameId: game.id }}
          aria-label={t("Ver detalhes de {name}", { name: game.name })}
        >
          <img
            src={game.image}
            alt={t("Ilustração de {name}", { name: game.name })}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/art/game-0.svg";
            }}
          />
        </Link>
        <button
          className={`favorite-button ${saved ? "saved" : ""}`}
          onClick={() => toggle(game.id)}
          aria-label={t("Favoritar {name}", { name: game.name })}
          aria-pressed={saved}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{t(game.category)}</span>
          <span>
            <span className="sr-only">
              {game.source === "rawg"
                ? t("Avaliação RAWG")
                : t("Popularidade fictícia")}
              :{" "}
            </span>
            <Star size={13} />{" "}
            {game.source === "rawg"
              ? `${new Intl.NumberFormat(locale).format(game.rating ?? 0)}/5`
              : `${game.popularity}%`}
          </span>
        </div>
        <Link
          to="/games/$gameId"
          params={{ gameId: game.id }}
          id={titleId}
          className="card-name"
        >
          {game.name}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
