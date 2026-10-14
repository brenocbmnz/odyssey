import {
  artworkSource,
  neutralPanel,
  panelFromImage,
} from "../../utils/artwork";
import { useState, useEffect, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [pending, setPending] = useState<number | null>(null);
  const [panels, setPanels] = useState<Record<string, string>>({});
  const slides = games.slice(0, 5);
  const index = slides.length ? selected % slides.length : 0;
  const game = slides[index];
  const targetId = pending === null ? undefined : slides[pending]?.id;
  useEffect(() => {
    if (pending === null) return;
    if (!targetId) {
      setPending(null);
      return;
    }
    if (panels[targetId]) {
      setSelected(pending);
      setPending(null);
    }
  }, [panels, pending, targetId]);
  const select = (position: number) => {
    if (panels[slides[position]?.id]) {
      setSelected(position);
      setPending(null);
    } else setPending(position);
  };
  const move = (offset: number) =>
    select(((pending ?? index) + offset + slides.length) % slides.length);
  return (
    <section
      className="hero rawg-hero hero-carousel"
      style={
        {
          "--carousel-panel": (game && panels[game.id]) || neutralPanel,
        } as CSSProperties
      }
      aria-busy={pending !== null}
      data-panel-ready={Boolean(game && panels[game.id])}
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
        <div className="carousel-artwork" aria-hidden="true">
          {(slides.length ? slides : [undefined]).map((slide, i) => {
            const original =
              slide?.source === "rawg"
                ? slide.image
                : slide?.id === "1" || !slide
                  ? "/art/hero.svg"
                  : slide.image;
            const src = artworkSource(original);
            return (
              <img
                key={slide?.id ?? "placeholder"}
                src={src}
                className={i === index ? "artwork-active" : ""}
                alt=""
                decoding="async"
                onLoad={(event) => {
                  if (slide) {
                    const panel = panelFromImage(event.currentTarget);
                    setPanels((previous) =>
                      previous[slide.id] === panel
                        ? previous
                        : { ...previous, [slide.id]: panel },
                    );
                  }
                }}
                onError={(event) => {
                  const image = event.currentTarget;
                  if (src !== original && !image.dataset.retried) {
                    image.dataset.retried = "true";
                    image.src = original;
                  } else if (!image.dataset.fallback) {
                    image.dataset.fallback = "true";
                    image.src = "/art/hero.svg";
                  }
                }}
              />
            );
          })}
        </div>
        <div className="hero-content">
          <div key={game?.id ?? "placeholder"} className="carousel-copy">
            <span className="featured-tag">{t("NO RADAR")}</span>
            <h2>
              {game?.name ??
                t(loading ? "Carregando jogos" : "Nenhum destaque disponível")}
            </h2>
            <p>
              {t(
                "Confira os detalhes, a avaliação e outros jogos do mesmo gênero.",
              )}
            </p>
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
                    : t("★ {value}% de popularidade", {
                        value: game.popularity,
                      })}
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
              onClick={() => select(i)}
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
