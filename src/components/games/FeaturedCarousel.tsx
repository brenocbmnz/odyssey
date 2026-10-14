import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { Game } from "../../types/game";
import { Button } from "../ui/button";
import { useLanguage } from "../../i18n/LanguageContext";
export function FeaturedCarousel({
  games = [],
  loading,
}: {
  games?: Game[];
  loading: boolean;
}) {
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState(0);
  const slides = games.slice(0, 5);
  const index = slides.length ? selected % slides.length : 0;
  const game = slides[index];
  const move = (offset: number) =>
    setSelected((index + offset + slides.length) % slides.length);
  return (
    <section
      className="hero rawg-hero hero-carousel"
      aria-label={t("Jogos em destaque")}
      aria-roledescription={t("carrossel")}
    >
      <div
        id="featured-slide"
        className="carousel-slide"
        role="group"
        aria-roledescription={t("slide")}
        aria-label={
          game
            ? t("{position} de {total}: {name}", {
                position: index + 1,
                total: slides.length,
                name: game.name,
              })
            : t("Jogo em destaque")
        }
      >
        <img
          key={game?.id ?? "placeholder"}
          src={
            game?.source === "rawg"
              ? game.image
              : game?.id === "1" || !game
                ? "/art/hero.svg"
                : game.image
          }
          alt=""
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/art/hero.svg";
          }}
        />
        <div className="hero-content">
          <span className="featured-tag">
            <Sparkles size={13} />
            {t("DESTAQUE DO CATÁLOGO")}
          </span>
          <h2>{game?.name ?? t("Descubra novos mundos")}</h2>
          <p>{t("Conheça uma das grandes descobertas do catálogo.")}</p>
          {game && (
            <div className="hero-meta">
              <span>{t(game.category)}</span>
              <span>
                {game.source === "rawg"
                  ? t("★ {rating}/5 na RAWG", {
                      rating: new Intl.NumberFormat(locale).format(
                        game.rating ?? 0,
                      ),
                    })
                  : t("★ {value}% de popularidade", { value: game.popularity })}
              </span>
            </div>
          )}
          {game ? (
            <Button asChild>
              <Link to="/games/$gameId" params={{ gameId: game.id }}>
                {t("Conhecer o jogo")}
                <ArrowUpRight size={17} />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link
                to="/catalog"
                search={{ q: "", category: "", sort: "popularity" }}
              >
                {t("Explorar catálogo")}
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="carousel-controls">
        <div
          className="carousel-dots"
          role="group"
          aria-label={t("Escolher destaque")}
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              aria-label={t("Mostrar {name}", { name: slide.name })}
              aria-current={i === index ? "true" : undefined}
              aria-controls="featured-slide"
              onClick={() => setSelected(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="carousel-arrows">
          <span className="carousel-count" aria-hidden="true">
            {String(slides.length ? index + 1 : 0).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
          <button
            aria-label={t("Destaque anterior")}
            aria-controls="featured-slide"
            disabled={slides.length < 2}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            aria-label={t("Próximo destaque")}
            aria-controls="featured-slide"
            disabled={slides.length < 2}
            onClick={() => move(1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <span className="sr-only" role="status" aria-atomic="true">
        {loading
          ? t("Carregando jogos")
          : game
            ? t("{position} de {total}: {name}", {
                position: index + 1,
                total: slides.length,
                name: game.name,
              })
            : t("Nenhum destaque disponível")}
      </span>
    </section>
  );
}
