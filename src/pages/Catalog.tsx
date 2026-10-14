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
          <div className="eyebrow">DESCUBRA ALGO NOVO</div>
          <h1>
            Catálogo de jogos<span className="purple-dot">.</span>
          </h1>
          <p>
            {isRawg
              ? "Descubra jogos reais, explore gêneros e encontre sua próxima aventura."
              : "25 universos originais. Qual vai ser sua próxima aventura?"}
          </p>
        </div>
      </div>
      <div className="filters">
        <label className="catalog-search">
          <Search size={18} />
          <input
            aria-label="Buscar por nome"
            placeholder="Buscar por nome..."
            value={q}
            onChange={(event) => update({ q: event.target.value })}
          />
        </label>
        <label className="sort-control">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Ordenar jogos</span>
          <select
            value={sort}
            onChange={(event) => update({ sort: event.target.value as Sort })}
          >
            <option value="popularity">Mais populares</option>
            <option value="name">Nome: A–Z</option>
            <option value="release">Mais recentes</option>
          </select>
        </label>
      </div>
      <div className="filter-tabs" aria-label="Filtrar por categoria">
        {["", ...categories].map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            className={category === item ? "selected" : ""}
            onClick={() => update({ category: item as Category | "" })}
          >
            {item || "Todos os jogos"}
          </button>
        ))}
      </div>
      <div className="results-bar">
        <span role="status">
          {query.isPending
            ? "Buscando jogos..."
            : `${query.data?.total ?? 0} jogos encontrados`}
        </span>
        {(q || category) && (
          <button onClick={() => update({ q: "", category: "" })}>
            <X size={14} />
            Limpar filtros
          </button>
        )}
      </div>
      <GameGrid
        games={query.data?.games}
        loading={query.isPending}
        error={query.isError}
        retry={() => void query.refetch()}
      />
      {!query.isPending && !query.isError && isRawg && (
        <div className="pagination">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Anterior
          </Button>
          <span role="status">Página {page}</span>
          <Button
            variant="outline"
            disabled={!query.data?.hasMore}
            onClick={() => setPage((value) => value + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </>
  );
}
