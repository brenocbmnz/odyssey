import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, CalendarDays, Flame } from "lucide-react";
import { gameRoute } from "../routes/router";
import { useGame, useGames } from "../hooks/useGames";
import { useFavorites } from "../contexts/FavoritesContext";
import { GameGrid } from "../components/games/GameGrid";
import { Button } from "../components/ui/button";
import { categories } from "../types/game";
export function GameDetails() {
  const { gameId } = gameRoute.useParams();
  const query = useGame(gameId);
  const related = useGames({
    category: categories.find((category) => category === query.data?.category),
  });
  const { favorites, toggle } = useFavorites();
  const game = query.data;
  const saved = favorites.includes(gameId);
  return (
    <>
      <Link
        to="/catalog"
        search={{ q: "", category: "", sort: "popularity" }}
        className="back-link"
      >
        <ArrowLeft size={16} />
        Voltar ao catálogo
      </Link>
      {query.isPending ? (
        <div
          className="skeleton detail-skeleton"
          aria-label="Carregando detalhes"
        />
      ) : query.isError || !game ? (
        <div className="empty" role="alert">
          <h1>Jogo indisponível</h1>
          <p>O jogo não existe ou houve uma falha ao carregar.</p>
          <Button onClick={() => void query.refetch()}>Tentar novamente</Button>
        </div>
      ) : (
        <>
          <div className="details">
            <div className="detail-art">
              <img src={game.image} alt={`Ilustração de ${game.name}`} />
              <span>{game.name}</span>
            </div>
            <div className="detail-content">
              <div className="eyebrow">
                {game.category} ·{" "}
                {game.source === "rawg" ? "RAWG" : "JOGO FICTÍCIO"}
              </div>
              <h1>{game.name}</h1>
              <p>{game.description}</p>
              <dl>
                <div>
                  <dt>
                    <CalendarDays size={17} />
                    Lançamento
                  </dt>
                  <dd>
                    {game.releaseDate
                      ? new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "long",
                          timeZone: "UTC",
                        }).format(new Date(game.releaseDate))
                      : "Não informada"}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Flame size={17} />
                    {game.source === "rawg"
                      ? "Avaliação RAWG"
                      : "Popularidade fictícia"}
                  </dt>
                  <dd>
                    {game.source === "rawg"
                      ? `${game.rating ?? 0} / 5`
                      : `${game.popularity}%`}
                  </dd>
                </div>
              </dl>
              <Button onClick={() => toggle(gameId)} aria-pressed={saved}>
                <Heart size={17} fill={saved ? "currentColor" : "none"} />
                {saved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </Button>
              <p className="detail-note">
                {game.source === "rawg"
                  ? "Dados da RAWG. Descrições podem estar em inglês. Os jogos não são executados neste site."
                  : "Catálogo demonstrativo. Os jogos não são executáveis."}
              </p>
            </div>
          </div>
          <section>
            <div className="section-heading">
              <h2>Continue explorando</h2>
              <span>
                {categories.some((category) => category === game.category)
                  ? `Mais jogos de ${game.category}`
                  : "Outras descobertas para você"}
              </span>
            </div>
            <GameGrid
              games={related.data?.games
                .filter((item) => item.id !== gameId)
                .slice(0, 4)}
              loading={related.isPending}
              error={related.isError}
              retry={() => void related.refetch()}
            />
          </section>
        </>
      )}
    </>
  );
}
