import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
} from "@tanstack/react-router";
import { Layout } from "../components/layout/Layout";
import { Home } from "../pages/Home";
import { Catalog } from "../pages/Catalog";
import { Favorites } from "../pages/Favorites";
import { GameDetails } from "../pages/GameDetails";
import { categories, type Category, type Sort } from "../types/game";
const root = createRootRoute({
  component: Layout,
  notFoundComponent: () => (
    <div className="empty">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="empty" role="alert">
      <h1>Algo deu errado</h1>
      <a href="/">Recarregar aplicação</a>
    </div>
  ),
});
const home = createRoute({
  getParentRoute: () => root,
  path: "/",
  component: Home,
});
export const catalogRoute = createRoute({
  getParentRoute: () => root,
  path: "/catalog",
  component: Catalog,
  validateSearch: (
    search: Record<string, unknown>,
  ): { q: string; category: Category | ""; sort: Sort } => ({
    q: typeof search.q === "string" ? search.q : "",
    category: categories.includes(search.category as Category)
      ? (search.category as Category)
      : "",
    sort:
      search.sort === "name" || search.sort === "release"
        ? search.sort
        : "popularity",
  }),
});
const favorites = createRoute({
  getParentRoute: () => root,
  path: "/favorites",
  component: Favorites,
});
export const gameRoute = createRoute({
  getParentRoute: () => root,
  path: "/games/$gameId",
  component: GameDetails,
});
const routeTree = root.addChildren([home, catalogRoute, favorites, gameRoute]);
export function createAppRouter() {
  return createRouter({ routeTree });
}
export const router = createAppRouter();
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
