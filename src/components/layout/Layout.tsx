import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Gamepad2,
  LayoutDashboard,
  Compass,
  Heart,
  Search,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "../../contexts/FavoritesContext";
export function Layout() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { favorites, message } = useFavorites();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  useEffect(() => {
    setOpen(false);
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [path]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Gamepad2 size={23} />
          </span>
          Odyssey
          <i />
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
          aria-label="Fechar navegação"
        >
          <X />
        </button>
        <p className="nav-label">EXPLORE SEU UNIVERSO</p>
        <nav aria-label="Navegação principal">
          <Link
            to="/"
            activeProps={{ className: "nav-active", "aria-current": "page" }}
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard size={19} />
            Visão geral
          </Link>
          <Link
            to="/catalog"
            search={{ q: "", category: "", sort: "popularity" }}
            activeProps={{ className: "nav-active", "aria-current": "page" }}
          >
            <Compass size={19} />
            Catálogo de jogos
          </Link>
          <Link
            to="/favorites"
            activeProps={{ className: "nav-active", "aria-current": "page" }}
          >
            <Heart size={19} />
            Meus favoritos<span className="count">{favorites.length}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="discovery">
            <Sparkles size={23} />
            <h3>
              Sua próxima aventura
              <br />
              começa aqui.
            </h3>
            <p>Explore. Descubra. Favorite.</p>
            <Link
              to="/catalog"
              search={{ q: "", category: "", sort: "popularity" }}
            >
              Explorar catálogo <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="demo-note">
            <span className="online-dot" />
            Ambiente de demonstração<small>Jogos e dados fictícios</small>
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
            aria-label="Abrir navegação"
          >
            <Menu />
          </button>
          <form
            className="header-search"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({
                to: "/catalog",
                search: { q: search, category: "", sort: "popularity" },
              });
            }}
            role="search"
          >
            <Search size={18} />
            <input
              aria-label="Pesquisar jogos"
              placeholder="Encontre sua próxima aventura..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" aria-label="Buscar jogos">
              <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="header-right">
            <span className="demo-badge">DEMO</span>
            <span className="avatar" aria-label="Perfil de visitante">
              OD
            </span>
          </div>
        </header>
        <main id="main" ref={main} tabIndex={-1}>
          <Outlet />
        </main>
        <footer>
          <span>© 2026 Odyssey</span>
          <span>
            Feito para quem ama descobrir jogos.
            <span className="footer-dot">✦</span>
          </span>
        </footer>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}
