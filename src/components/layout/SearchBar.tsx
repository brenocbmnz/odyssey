import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X, ArrowRight, LoaderCircle } from "lucide-react";
import { useGames } from "../../hooks/useGames";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Game } from "../../types/game";
export function SearchBar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routeQuery = useRouterState({
    select: (state) =>
      typeof state.location.search.q === "string"
        ? state.location.search.q
        : "",
  });
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [value, setValue] = useState(routeQuery);
  const [debounced, setDebounced] = useState(value.trim());
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const hintId = useId();
  useEffect(() => {
    setValue(routeQuery);
    setOpen(false);
    setActive(-1);
  }, [routeQuery, path]);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 350);
    return () => clearTimeout(timer);
  }, [value]);
  const expanded = open && value.trim().length >= 2;
  const query = useGames(
    { search: debounced, sort: "popularity" },
    expanded && debounced.length >= 2 && value.trim() === debounced,
  );
  const loading = query.isPending || value.trim() !== debounced;
  const suggestions = loading ? [] : (query.data?.games.slice(0, 6) ?? []);
  const selected = active >= 0 ? suggestions[active] : undefined;
  const choose = (game: Game) => {
    setOpen(false);
    setActive(-1);
    void navigate({ to: "/games/$gameId", params: { gameId: game.id } });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setOpen(false);
    setActive(-1);
    void navigate({
      to: "/catalog",
      search: { q: value.trim(), category: "", sort: "popularity" },
    });
  };
  return (
    <form
      className="header-search"
      role="search"
      aria-label={t("Pesquisar jogos")}
      onSubmit={submit}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <Search size={18} />
      <input
        ref={input}
        type="search"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={
          expanded && selected ? `${listId}-${selected.id}` : undefined
        }
        aria-describedby={hintId}
        aria-label={t("Pesquisar jogos")}
        placeholder={t("Pesquisar jogos...")}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setValue(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            setActive(-1);
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (suggestions.length)
              setActive((index) =>
                event.key === "ArrowDown"
                  ? (index + 1) % suggestions.length
                  : index <= 0
                    ? suggestions.length - 1
                    : index - 1,
              );
          }
          if (event.key === "Enter" && expanded && selected) {
            event.preventDefault();
            choose(selected);
          }
        }}
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          aria-label={t("Limpar pesquisa")}
          onClick={() => {
            setValue("");
            setActive(-1);
            setOpen(false);
            input.current?.focus();
          }}
        >
          <X size={16} />
        </button>
      )}
      <button
        className="search-submit"
        type="submit"
        aria-label={t("Buscar jogos")}
      >
        <ArrowRight size={18} />
      </button>
      <span id={hintId} className="sr-only">
        {t(
          "Digite pelo menos dois caracteres. Use as setas para escolher uma sugestão, Enter para abrir e Escape para fechar.",
        )}
      </span>
      {expanded && (
        <div className="search-popover">
          <div className="suggestion-heading">{t("Sugestões de jogos")}</div>
          <ul
            id={listId}
            role="listbox"
            aria-label={t("Sugestões de jogos")}
            aria-busy={loading}
          >
            {suggestions.map((game, index) => (
              <li
                id={`${listId}-${game.id}`}
                key={game.id}
                role="option"
                aria-selected={active === index}
                className={active === index ? "suggestion-active" : ""}
                onPointerDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => choose(game)}
              >
                <img
                  src={game.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/art/game-0.svg";
                  }}
                />
                <div>
                  <strong>{game.name}</strong>
                  <small>{t(game.category)}</small>
                </div>
                <ArrowRight size={16} />
              </li>
            ))}
          </ul>
          {loading ? (
            <p className="suggestion-message">
              <LoaderCircle size={17} className="search-spinner" />
              {t("Buscando jogos...")}
            </p>
          ) : query.isError ? (
            <p className="suggestion-message">
              {t(
                "Não foi possível carregar as sugestões. Tente buscar no catálogo.",
              )}
            </p>
          ) : !suggestions.length ? (
            <p className="suggestion-message">
              {t(
                "Nenhum jogo encontrado. Experimente outra busca ou categoria.",
              )}
            </p>
          ) : null}
          <button className="search-all" type="submit">
            {t("Ver todos os resultados")}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      <span className="sr-only" role="status" aria-atomic="true">
        {expanded
          ? loading
            ? t("Buscando jogos...")
            : query.isError
              ? t(
                  "Não foi possível carregar as sugestões. Tente buscar no catálogo.",
                )
              : t("{count} sugestões disponíveis", {
                  count: suggestions.length,
                })
          : ""}
      </span>
    </form>
  );
}
