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
import { Button } from "../components/ui/button";
import { categories } from "../types/game";
const icons = [Zap, Puzzle, Castle, Map, Coffee];
export function Home() {
  const popular = useGames({ sort: "popularity" });
  const recent = useGames({ sort: "release" });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">UM NOVO UNIVERSO A CADA CLIQUE</div>
          <h1>
            Seu próximo jogo favorito
            <br className="mobile-break" /> está aqui
            <span className="purple-dot">.</span>
          </h1>
          <p>
            Descubra novas aventuras. Explore possibilidades. Jogue do seu
            jeito.
          </p>
        </div>
        <span className="collection-badge">
          <span className="online-dot" />
          25 jogos para descobrir
        </span>
      </div>
      <section className="hero" aria-label="Jogo em destaque">
        <img
          src="/art/hero.svg"
          alt="Paisagem espacial com montanhas neon e um planeta roxo"
        />
        <div className="hero-content">
          <span className="featured-tag">
            <Sparkles size={13} />
            DESTAQUE DA SEMANA
          </span>
          <h2>
            Neon
            <br />
            Odyssey
          </h2>
          <p>
            Além do horizonte, uma nova aventura.
            <br />
            Explore um universo onde tudo é possível.
          </p>
          <div className="hero-meta">
            <span>Arcade</span>
            <span>★ 98% de popularidade</span>
          </div>
          <Button asChild>
            <Link to="/games/$gameId" params={{ gameId: "1" }}>
              Conhecer o jogo
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
        <div className="hero-index">
          <span>01</span> / 01 — EM DESTAQUE
        </div>
      </section>
      <section className="categories-section">
        <div className="section-heading">
          <h2>Encontre seu estilo</h2>
          <span>Um mundo de possibilidades</span>
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
                  <strong>{category}</strong>
                  <small>5 jogos</small>
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
              Em alta agora
            </h2>
            <p>Os favoritos da comunidade, esperando por você.</p>
          </div>
          <Link
            to="/catalog"
            search={{ sort: "popularity", q: "", category: "" }}
          >
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>
        <GameGrid
          games={popular.data?.slice(0, 4)}
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
              Acabaram de chegar
            </h2>
            <p>Novos mundos para adicionar à sua coleção.</p>
          </div>
          <Link to="/catalog" search={{ sort: "release", q: "", category: "" }}>
            Ver novidades
            <ArrowRight size={16} />
          </Link>
        </div>
        <GameGrid
          games={recent.data?.slice(0, 4)}
          loading={recent.isPending}
          error={recent.isError}
          retry={() => void recent.refetch()}
        />
      </section>
      <div className="bottom-banner">
        <GamepadMark />
        <div>
          <h3>Grandes descobertas começam com curiosidade.</h3>
          <p>Seu novo favorito pode estar a um clique de distância.</p>
        </div>
        <Link
          to="/catalog"
          search={{ q: "", category: "", sort: "popularity" }}
        >
          Explorar todos os jogos
          <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
function GamepadMark() {
  return <span className="bottom-mark">✦</span>;
}
