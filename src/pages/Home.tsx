import { useLanguage } from "../i18n/LanguageContext";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Flame,
  Sparkles,
  Zap,
  Puzzle,
  Castle,
  Map,
  Coffee,
} from "lucide-react";
import { useGames } from "../hooks/useGames";
import { GameGrid } from "../components/games/GameGrid";
import { FeaturedCarousel } from "../components/games/FeaturedCarousel";
import { categories } from "../types/game";
import { isRawg } from "../config/source";
const icons = [Zap, Puzzle, Castle, Map, Coffee];
export function Home() {
  const { t } = useLanguage();
  const popular = useGames({ sort: "popularity" });
  const recent = useGames({ sort: "release" });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t("UM NOVO UNIVERSO A CADA CLIQUE")}</div>
          <h1>
            {t("Seu próximo jogo favorito está aqui")}
            <span className="purple-dot">.</span>
          </h1>
          <p>
            {t(
              "Descubra novas aventuras. Explore possibilidades. Jogue do seu jeito.",
            )}
          </p>
        </div>
        <span className="collection-badge">
          <span className="online-dot" />
          {isRawg
            ? t("Jogos reais para descobrir")
            : t("25 jogos para descobrir")}
        </span>
      </div>
      <FeaturedCarousel
        games={popular.data?.games}
        loading={popular.isPending}
      />
      <section className="categories-section">
        <div className="section-heading">
          <h2>{t("Encontre seu estilo")}</h2>
          <span>{t("Um mundo de possibilidades")}</span>
        </div>
        <div className="category-grid">
          {categories.map((category, i) => {
            const Icon = icons[i];
            return (
              <Link
                to="/catalog"
                search={{ category, q: "", sort: "popularity" }}
                className={`category category-${i}`}
                key={category}
              >
                <span className="category-icon">
                  <Icon size={22} />
                </span>
                <div>
                  <strong>{t(category)}</strong>
                  <small>{isRawg ? t("Explorar gênero") : t("5 jogos")}</small>
                </div>
                <ArrowUpRight size={15} />
              </Link>
            );
          })}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <h2>
              <Flame size={21} className="purple" />
              {t("Em alta agora")}
            </h2>
            <p>{t("Os favoritos da comunidade, esperando por você.")}</p>
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
            <h2>
              <Sparkles size={20} className="cyan" />
              {t("Acabaram de chegar")}
            </h2>
            <p>{t("Novos mundos para adicionar à sua coleção.")}</p>
          </div>
          <Link to="/catalog" search={{ sort: "release", q: "", category: "" }}>
            {t("Ver novidades")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <GameGrid
          label={t("Acabaram de chegar")}
          games={recent.data?.games.slice(0, 4)}
          loading={recent.isPending}
          error={recent.isError}
          retry={() => void recent.refetch()}
        />
      </section>
      <div className="bottom-banner">
        <GamepadMark />
        <div>
          <h2>{t("Grandes descobertas começam com curiosidade.")}</h2>
          <p>{t("Seu novo favorito pode estar a um clique de distância.")}</p>
        </div>
        <Link
          to="/catalog"
          search={{ q: "", category: "", sort: "popularity" }}
        >
          {t("Explorar todos os jogos")}
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
function GamepadMark() {
  return <span className="bottom-mark">✦</span>;
}
