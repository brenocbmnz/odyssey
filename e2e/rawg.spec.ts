import { test, expect } from "@playwright/test";
const game = {
  id: "4200",
  name: "Portal 2",
  category: "Puzzle",
  description: "Descrição de teste do jogo real.",
  releaseDate: null,
  popularity: 1000,
  rating: 4.6,
  image: "/art/game-1.svg",
  source: "rawg",
};
test("modo RAWG: destaque, paginação, busca e favoritos fora da primeira página", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/games**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/4200")) {
      await route.fulfill({ json: game });
      return;
    }
    const result =
      url.searchParams.get("page") === "2"
        ? { games: [game], total: 25, hasMore: false }
        : {
            games: [{ ...game, id: "999", name: "Outro jogo" }],
            total: 25,
            hasMore: true,
          };
    await route.fulfill({ json: result });
  });
  await page.goto("/");
  await expect(page.locator(".hero h2")).toHaveText("Outro jogo");
  await expect(
    page.getByRole("link", { name: "RAWG", exact: true }),
  ).toBeVisible();
  await page.goto("/catalog");
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Portal 2", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Próxima", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Adicionar Portal 2 aos favoritos" })
    .click();
  await page.goto("/favorites");
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Portal 2", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Portal 2", exact: true }).click();
  await expect(page.getByText("Não informada", { exact: true })).toBeVisible();
  await expect(page.getByText("4.6 / 5", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remover dos favoritos" }).click();
  await page.goto("/favorites");
  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  await page.goto("/catalog");
  let search = "";
  await page.route("**/api/games?**", async (route) => {
    search = new URL(route.request().url()).searchParams.get("search") ?? "";
    await route.fulfill({ json: { games: [], total: 0, hasMore: false } });
  });
  await page.getByRole("textbox", { name: "Buscar por nome" }).fill("portal");
  await expect.poll(() => search).toBe("portal");
  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => navigator.serviceWorker.controller?.scriptURL ?? "",
    ),
  ).not.toContain("mockServiceWorker");
});
