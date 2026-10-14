import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LanguageProvider,
  useLanguage,
  readLanguage,
  translate,
} from "../i18n/LanguageContext";
function Demo() {
  const { t, setLocale } = useLanguage();
  return (
    <>
      <h1>{t("Catálogo de jogos")}</h1>
      <button onClick={() => setLocale("en")}>English</button>
      <button onClick={() => setLocale("pt-BR")}>Português</button>
    </>
  );
}
describe("Idiomas", () => {
  it("troca conteúdo, idioma do documento e persiste após remontagem", async () => {
    const view = render(
      <LanguageProvider>
        <Demo />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Catálogo de jogos");
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("heading")).toHaveTextContent("Game catalog");
    expect(document.documentElement.lang).toBe("en");
    view.unmount();
    render(
      <LanguageProvider>
        <Demo />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Game catalog");
    await userEvent.click(screen.getByRole("button", { name: "Português" }));
    expect(document.documentElement.lang).toBe("pt-BR");
  });
  it("interpola valores e preserva nomes sem tradução", () => {
    expect(
      translate("en", "Ver detalhes de {name}", { name: "Portal 2" }),
    ).toBe("View details of Portal 2");
    expect(translate("en", "Estratégia")).toBe("Strategy");
    expect(translate("en", "Portal 2")).toBe("Portal 2");
  });
  it("tolera preferência inválida e armazenamento indisponível", () => {
    localStorage.setItem("odyssey:language:v1", "invalid");
    expect(readLanguage()).toBe("pt-BR");
    const read = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("Blocked");
      });
    expect(readLanguage()).toBe("pt-BR");
    read.mockRestore();
  });
});
