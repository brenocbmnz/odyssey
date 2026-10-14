import { SearchBar } from "./SearchBar";
import { useLanguage } from "../../i18n/LanguageContext";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Gamepad2,
  LayoutDashboard,
  Compass,
  Heart,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "../../contexts/FavoritesContext";
import { isRawg } from "../../config/source";
export function Layout() {
  const { t, locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const { favorites, message } = useFavorites();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const main = useRef<HTMLElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !sidebar.current?.contains(event.target) &&
        !menuButton.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);
  useEffect(() => {
    setOpen(false);
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [path]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        {t("Pular para o conteúdo")}
      </a>
      <aside
        id="site-navigation"
        ref={sidebar}
        aria-label={t("Navegação principal")}
        onBlur={(event) => {
          if (
            open &&
            !event.currentTarget.contains(event.relatedTarget) &&
            event.relatedTarget !== menuButton.current
          )
            setOpen(false);
        }}
        className={`sidebar ${open ? "is-open" : ""}`}
      >
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Gamepad2 size={23} />
          </span>
          Odyssey
          <i />
        </Link>
        <button
          ref={closeButton}
          className="mobile-close icon-button"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
          aria-label={t("Fechar navegação")}
        >
          <X />
        </button>
        <p className="nav-label">{t("EXPLORE SEU UNIVERSO")}</p>
        <nav aria-label={t("Navegação principal")}>
          <Link
            to="/"
            activeProps={{ className: "nav-active", "aria-current": "page" }}
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard size={19} />
            {t("Visão geral")}
          </Link>
          <Link
            to="/catalog"
            search={{ q: "", category: "", sort: "popularity" }}
            activeProps={{ className: "nav-active", "aria-current": "page" }}
          >
            <Compass size={19} />
            {t("Catálogo de jogos")}
          </Link>
          <Link
            to="/favorites"
            activeProps={{ className: "nav-active", "aria-current": "page" }}
          >
            <Heart size={19} />
            {t("Meus favoritos")}
            <span className="count">{favorites.length}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="discovery">
            <Sparkles size={23} />
            <h2>
              {t("Sua próxima aventura")}
              <br />
              {t("começa aqui.")}
            </h2>
            <p>{t("Explore. Descubra. Favorite.")}</p>
            <Link
              to="/catalog"
              search={{ q: "", category: "", sort: "popularity" }}
            >
              {t("Explorar catálogo")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="demo-note">
            <span className="online-dot" />
            {isRawg ? t("Catálogo conectado") : t("Ambiente de demonstração")}
            <small>
              {isRawg
                ? t("Dados fornecidos pela RAWG")
                : t("Jogos e dados fictícios")}
            </small>
          </div>
        </div>
      </aside>
      <div className="content-shell">
        <header className="header">
          <button
            ref={menuButton}
            className="mobile-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-navigation"
            aria-label={t(open ? "Fechar navegação" : "Abrir navegação")}
          >
            <Menu />
          </button>
          <SearchBar />
          <div className="header-right">
            <label className="language-control">
              <span className="sr-only">{t("Idioma")}</span>
              <select
                value={locale}
                onChange={(event) =>
                  setLocale(event.target.value === "en" ? "en" : "pt-BR")
                }
              >
                <option value="pt-BR" lang="pt-BR">
                  Português
                </option>
                <option value="en" lang="en">
                  English
                </option>
              </select>
            </label>
            <span className="demo-badge">{isRawg ? "RAWG" : "DEMO"}</span>
            <span className="avatar" aria-hidden="true">
              OD
            </span>
          </div>
        </header>
        <main
          aria-label={t("Conteúdo principal")}
          id="main"
          ref={main}
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <footer>
          <span>
            © 2026 Odyssey
            {isRawg && (
              <>
                {" "}
                · {t("Dados e imagens:")}{" "}
                <a
                  href="https://rawg.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="purple"
                >
                  RAWG
                </a>
              </>
            )}
          </span>
          <span>
            {t("Feito para quem ama descobrir jogos.")}
            <span className="footer-dot">✦</span>
          </span>
        </footer>
      </div>
      <div className="sr-only" role="status" aria-atomic="true">
        {message && (
          <>
            {t(message)}{" "}
            {t("{count} favoritos salvos", { count: favorites.length })}
          </>
        )}
      </div>
    </div>
  );
}
