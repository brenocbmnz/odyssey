import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, CalendarDays, Flame } from "lucide-react";
import { gameRoute } from "../routes/router";
import { useGame, useGames } from "../hooks/useGames";
import { useFavorites } from "../contexts/FavoritesContext";
import { GameGrid } from "../components/games/GameGrid";
import { Button } from "../components/ui/button";
import { categories } from "../types/game";
export function GameDetails() {
  const { t, locale } = useLanguage();
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
        {t("Voltar ao catálogo")}
      </Link>
      {query.isPending ? (
        <div
          className="skeleton detail-skeleton"
          role="status"
          aria-label={t("Carregando detalhes")}
        />
      ) : query.isError || !game ? (
        <div className="empty" role="alert">
          <h1>{t("Jogo indisponível")}</h1>
          <p>{t("O jogo não existe ou houve uma falha ao carregar.")}</p>
          <Button onClick={() => void query.refetch()}>
            {t("Tentar novamente")}
          </Button>
        </div>
      ) : (
        <>
          <div className="details">
            <div className="detail-art">
              <img
                src={game.image}
                alt={t("Ilustração de {name}", { name: game.name })}
              />
              <span>{game.name}</span>
            </div>
            <div className="detail-content">
              <div className="eyebrow">
                {t(game.category)} ·{" "}
                {game.source === "rawg" ? "RAWG" : t("JOGO FICTÍCIO")}
              </div>
              <h1>{game.name}</h1>
              <p
                lang={
                  game.source === "rawg" &&
                  game.description !== "Descrição não disponível na RAWG."
                    ? "en"
                    : locale
                }
              >
                {game.source === "rawg"
                  ? game.description === "Descrição não disponível na RAWG."
                    ? t(game.description)
                    : game.description
                  : t(
                      "{name} convida você a descobrir um universo original, superar desafios e explorar novas possibilidades. Uma experiência fictícia de {category}, com cenários vibrantes e desafios que evoluem a cada etapa.",
                      {
                        name: game.name,
                        category: t(game.category).toLowerCase(),
                      },
                    )}
              </p>
              <dl>
                <div>
                  <dt>
                    <CalendarDays size={17} />
                    {t("Lançamento")}
                  </dt>
                  <dd>
                    {game.releaseDate
                      ? new Intl.DateTimeFormat(locale, {
                          dateStyle: "long",
                          timeZone: "UTC",
                        }).format(new Date(game.releaseDate))
                      : t("Não informada")}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Flame size={17} />
                    {game.source === "rawg"
                      ? t("Avaliação RAWG")
                      : t("Popularidade fictícia")}
                  </dt>
                  <dd>
                    {game.source === "rawg"
                      ? `${new Intl.NumberFormat(locale).format(game.rating ?? 0)} / 5`
                      : `${game.popularity}%`}
                  </dd>
                </div>
              </dl>
              <Button onClick={() => toggle(gameId)}>
                <Heart size={17} fill={saved ? "currentColor" : "none"} />
                {saved
                  ? t("Remover dos favoritos")
                  : t("Adicionar aos favoritos")}
              </Button>
              <p className="detail-note">
                {game.source === "rawg"
                  ? t(
                      "Dados da RAWG. Descrições podem estar em inglês. Os jogos não são executados neste site.",
                    )
                  : t("Catálogo demonstrativo. Os jogos não são executáveis.")}
              </p>
            </div>
          </div>
          <section>
            <div className="section-heading">
              <h2>{t("Continue explorando")}</h2>
              <span>
                {categories.some((category) => category === game.category)
                  ? t("Mais jogos de {category}", {
                      category: t(game.category),
                    })
                  : t("Outras descobertas para você")}
              </span>
            </div>
            <GameGrid
              label={t("Continue explorando")}
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
