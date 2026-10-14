import { useEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "@tanstack/react-router";
import { useFavorites } from "../contexts/FavoritesContext";
import { useFavoriteGames } from "../hooks/useFavoriteGames";
import { GameGrid } from "../components/games/GameGrid";
import { Button } from "../components/ui/button";
export function Favorites() {
  const { t } = useLanguage();
  const { favorites } = useFavorites();
  const query = useFavoriteGames(favorites);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousCount = useRef(favorites.length);
  useEffect(() => {
    if (
      favorites.length < previousCount.current &&
      document.activeElement === document.body
    )
      heading.current?.focus();
    previousCount.current = favorites.length;
  }, [favorites.length]);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t("SUA COLEÇÃO PESSOAL")}</div>
          <h1 ref={heading} tabIndex={-1}>
            {t("Meus favoritos")}
            <span className="purple-dot">.</span>
          </h1>
          <p>{t("As aventuras que você quer manter por perto.")}</p>
        </div>
      </div>
      <GameGrid
        label={t("Meus favoritos")}
        games={query.games}
        loading={query.loading}
        error={query.error}
        retry={query.retry}
        empty={t(
          "Use o coração nos cards para começar sua coleção. Seus favoritos ficam salvos neste navegador.",
        )}
      />
      {!favorites.length && (
        <div className="center">
          <Button asChild>
            <Link
              to="/catalog"
              search={{ q: "", category: "", sort: "popularity" }}
            >
              {t("Descobrir jogos")}
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
