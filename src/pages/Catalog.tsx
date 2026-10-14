import { useLanguage } from "../i18n/LanguageContext";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { isRawg } from "../config/source";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { catalogRoute } from "../routes/router";
import { useGames } from "../hooks/useGames";
import { categories, type Category, type Sort } from "../types/game";
import { GameGrid } from "../components/games/GameGrid";
export function Catalog() {
  const { t, locale } = useLanguage();
  const { q, category, sort } = catalogRoute.useSearch();
  const navigate = useNavigate();
  const update = (
    patch: Partial<{ q: string; category: Category | ""; sort: Sort }>,
  ) => {
    void navigate({
      to: "/catalog",
      search: { q, category, sort, ...patch },
      replace: true,
    });
  };
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(q);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q), 350);
    return () => clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    setPage(1);
  }, [q, category, sort]);
  const query = useGames({
    search,
    category: category || undefined,
    sort,
    page,
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t("DESCUBRA ALGO NOVO")}</div>
          <h1>
            {t("Catálogo de jogos")}
            <span className="purple-dot">.</span>
          </h1>
          <p>
            {isRawg
              ? t(
                  "Descubra jogos reais, explore gêneros e encontre sua próxima aventura.",
                )
              : t("25 universos originais. Qual vai ser sua próxima aventura?")}
          </p>
        </div>
      </div>
      <div className="filters">
        <label className="catalog-search">
          <Search size={18} />
          <input
            aria-label={t("Buscar por nome")}
            placeholder={t("Buscar por nome...")}
            value={q}
            onChange={(event) => update({ q: event.target.value })}
          />
        </label>
        <label className="sort-control">
          <SlidersHorizontal size={16} />
          <span className="sr-only">{t("Ordenar jogos")}</span>
          <select
            value={sort}
            onChange={(event) => update({ sort: event.target.value as Sort })}
          >
            <option value="popularity">{t("Mais populares")}</option>
            <option value="name">{t("Nome: A–Z")}</option>
            <option value="release">{t("Mais recentes")}</option>
          </select>
        </label>
      </div>
      <div
        className="filter-tabs"
        role="group"
        aria-label={t("Filtrar por categoria")}
      >
        {["", ...categories].map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            aria-controls="catalog-results"
            className={category === item ? "selected" : ""}
            onClick={() => update({ category: item as Category | "" })}
          >
            {t(item || "Todos os jogos")}
          </button>
        ))}
      </div>
      <div className="results-bar">
        <span role="status" aria-atomic="true">
          {query.isPending
            ? t("Buscando jogos...")
            : t("{count} jogos encontrados", {
                count: new Intl.NumberFormat(locale).format(
                  query.data?.total ?? 0,
                ),
              })}
        </span>
        {(q || category) && (
          <button onClick={() => update({ q: "", category: "" })}>
            <X size={14} />
            {t("Limpar filtros")}
          </button>
        )}
      </div>
      <GameGrid
        label={t("Catálogo de jogos")}
        id="catalog-results"
        games={query.data?.games}
        loading={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      />
      {!query.isPending && !query.isError && isRawg && (
        <nav className="pagination" aria-label={t("Paginação do catálogo")}>
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            {t("Anterior")}
          </Button>
          <span aria-current="page">{t("Página {page}", { page })}</span>
          <Button
            variant="outline"
            disabled={!query.data?.hasMore}
            onClick={() => setPage((value) => value + 1)}
          >
            {t("Próxima")}
          </Button>
        </nav>
      )}
    </>
  );
}
