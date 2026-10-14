import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { favoritesKey, readFavorites, saveFavorites } from "../utils/storage";
interface FavoritesState {
  favorites: string[];
  toggle: (id: string) => void;
  message: string;
}
const FavoritesContext = createContext<FavoritesState | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState(readFavorites);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === favoritesKey || event.key === null)
        setFavorites(readFavorites());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggle = (id: string) => {
    const exists = favorites.includes(id);
    const next = exists
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    setMessage(
      saveFavorites(next)
        ? exists
          ? "Jogo removido dos favoritos."
          : "Jogo adicionado aos favoritos."
        : "Favorito atualizado nesta sessão. O navegador não permitiu salvar.",
    );
  };
  return (
    <FavoritesContext.Provider value={{ favorites, toggle, message }}>
      {children}
    </FavoritesContext.Provider>
  );
}
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("FavoritesProvider ausente");
  return context;
}
