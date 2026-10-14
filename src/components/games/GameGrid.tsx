import { useEffect, useRef } from "react";
import type { Game } from "../../types/game";
import { GameCard } from "./GameCard";
import { Button } from "../ui/button";
import { SearchX, AlertCircle } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
export function GameGrid({
  games,
  loading,
  error,
  retry,
  empty,
  id,
  label,
}: {
  games?: Game[];
  loading?: boolean;
  error?: boolean;
  retry?: () => void;
  empty?: string;
  id?: string;
  label?: string;
}) {
  const { t } = useLanguage();
  const region = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!loading && restoreFocus.current) {
      region.current?.focus();
      restoreFocus.current = false;
    }
  }, [loading]);
  return (
    <>
      <span className="sr-only" role="status">
        {loading ? t("Carregando jogos") : ""}
      </span>
      <div
        ref={region}
        tabIndex={-1}
        id={id}
        role="region"
        aria-label={label ?? t("Jogos")}
        aria-busy={Boolean(loading)}
      >
        {loading ? (
          <>
            <div className="game-grid" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="skeleton" key={i} />
              ))}
            </div>
          </>
        ) : error ? (
          <div className="empty">
            <div role="alert">
              <AlertCircle />
              <h2>{t("Não foi possível carregar os jogos")}</h2>
              <p>{t("Verifique sua conexão e tente novamente.")}</p>
            </div>
            <Button
              onClick={() => {
                restoreFocus.current = true;
                retry?.();
              }}
            >
              {t("Tentar novamente")}
            </Button>
          </div>
        ) : !games?.length ? (
          <div className="empty" role="status">
            <SearchX />
            <h2>{t("Nada por aqui ainda")}</h2>
            <p>
              {empty ??
                t(
                  "Nenhum jogo encontrado. Experimente outra busca ou categoria.",
                )}
            </p>
          </div>
        ) : (
          <div className="game-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
