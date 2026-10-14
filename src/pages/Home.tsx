import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useGames } from "../hooks/useGames";
import { GameGrid } from "../components/games/GameGrid";
import { FeaturedCarousel } from "../components/games/FeaturedCarousel";
import { categories } from "../types/game";
import { isRawg } from "../config/source";
export function Home() {
  const { t } = useLanguage();
  const popular = useGames({ sort: "popularity" });
  const recent = useGames({ sort: "release" });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t("CATÁLOGO DE JOGOS")}</div>
          <h1>{t("O que jogar agora?")}</h1>
          <p>
            {t(
              "Veja os jogos, compare as avaliações e salve os que você quer jogar.",
            )}
          </p>
        </div>
      </div>
      <FeaturedCarousel
        games={popular.data?.games}
        loading={popular.isPending}
      />
      <section className="categories-section">
        <div className="section-heading">
          <h2>{t("Navegue por gênero")}</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to="/catalog"
              search={{ category, q: "", sort: "popularity" }}
              className="category"
              key={category}
            >
              {t(category)} <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>{t("Em alta agora")}</h2>
            <p>
              {t(
                isRawg
                  ? "Ordenados pelas adições dos usuários na RAWG."
                  : "Ordenados pela popularidade no catálogo demo.",
              )}
            </p>
          </div>
          <Link
            to="/catalog"
            search={{ sort: "popularity", q: "", category: "" }}
          >
            {t("Ver todos")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <GameGrid
          label={t("Em alta agora")}
          games={popular.data?.games.slice(0, 4)}
          loading={popular.isPending}
          error={popular.isError}
          retry={() => void popular.refetch()}
        />
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>{t("Acabaram de chegar")}</h2>
            <p>
              {t("Por data de lançamento, dos mais novos aos mais antigos.")}
            </p>
          </div>
          <Link to="/catalog" search={{ sort: "release", q: "", category: "" }}>
            {t("Ver novidades")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <GameGrid
          layout="list"
          label={t("Acabaram de chegar")}
          games={recent.data?.games.slice(0, 4)}
          loading={recent.isPending}
          error={recent.isError}
          retry={() => void recent.refetch()}
        />
      </section>
    </>
  );
}
