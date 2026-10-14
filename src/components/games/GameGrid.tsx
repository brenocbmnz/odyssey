import type { Game } from "../../types/game";
import { GameCard } from "./GameCard";
import { Button } from "../ui/button";
import { SearchX, AlertCircle } from "lucide-react";
export function GameGrid({
  games,
  loading,
  error,
  retry,
  empty = "Nenhum jogo encontrado. Experimente outra busca ou categoria.",
}: {
  games?: Game[];
  loading?: boolean;
  error?: boolean;
  retry?: () => void;
  empty?: string;
}) {
  if (loading)
    return (
      <div className="game-grid" aria-label="Carregando jogos" aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="skeleton" key={i} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="empty" role="alert">
        <AlertCircle />
        <h3>Não foi possível carregar os jogos</h3>
        <p>Verifique sua conexão e tente novamente.</p>
        <Button onClick={retry}>Tentar novamente</Button>
      </div>
    );
  if (!games?.length)
    return (
      <div className="empty" role="status">
        <SearchX />
        <h3>Nada por aqui ainda</h3>
        <p>{empty}</p>
      </div>
    );
  return (
    <div className="game-grid">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
