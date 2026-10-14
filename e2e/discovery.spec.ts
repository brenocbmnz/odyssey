import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const real = process.env.E2E_SOURCE === "rawg";
const games = [
  "Portal 2",
  "Celeste",
  "Hades",
  "Hollow Knight",
  "Stardew Valley",
].map((name, index) => ({
  id: String(4200 + index),
  name,
  category: "Puzzle",
  source: "rawg",
  image: `/art/game-${index}.svg`,
  description: "Game description",
  releaseDate: "2020-01-01",
  rating: 4.5,
  popularity: 100,
}));
test.beforeEach(async ({ page }) => {
  if (real)
    await page.route("**/api/games**", (route) => {
      const url = new URL(route.request().url());
      const id = url.pathname.split("/")[3];
      const search = url.searchParams.get("search")?.toLowerCase() ?? "";
      const results = games.filter((game) =>
        game.name.toLowerCase().includes(search),
      );
      return route.fulfill({
        json: id
          ? games.find((game) => game.id === id)
          : { games: results, total: results.length, hasMore: false },
      });
    });
});
test("carrossel, sugestões por teclado, pesquisa completa e estados vazios", async ({
  page,
}, info) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Jogos em destaque" });
  await expect(hero.locator("h2")).toHaveText(
    real ? "Portal 2" : "Neon Odyssey",
  );
  await expect(hero.locator(".carousel-dots button")).toHaveCount(5);
  const first = await hero.locator("h2").innerText();
  await expect(hero).toHaveAttribute("data-panel-ready", "true");
  const firstPanel = await hero.evaluate((node) =>
    (node as HTMLElement).style.getPropertyValue("--carousel-panel"),
  );
  const firstHeight = (await hero.boundingBox())?.height;
  await page.getByRole("button", { name: "Próximo destaque" }).click();
  await expect(hero.locator("h2")).not.toHaveText(first);
  await expect
    .poll(() =>
      hero.evaluate((node) =>
        (node as HTMLElement).style.getPropertyValue("--carousel-panel"),
      ),
    )
    .not.toBe(firstPanel);
  expect((await hero.boundingBox())?.height).toBe(firstHeight);
  await page.getByRole("button", { name: "Destaque anterior" }).click();
  await expect(hero.locator("h2")).toHaveText(first);
  await hero.locator(".carousel-dots button").nth(2).click();
  await expect(hero.locator(".carousel-dots button").nth(2)).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.getByRole("button", { name: "Destaque anterior" }).focus();
  await page.keyboard.press("Enter");
  await expect(hero.locator(".carousel-dots button").nth(1)).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Próximo destaque" }).click();
  await expect(hero.locator(".carousel-dots button").nth(2)).toHaveAttribute(
    "aria-current",
    "true",
  );
  expect(
    await hero
      .locator(".artwork-active")
      .evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe("0s");
  expect(
    await hero
      .locator(".carousel-copy")
      .evaluate((node) => node.getAnimations().length),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const input = page.getByRole("combobox", {
    name: "Pesquisar jogos",
    exact: true,
  });
  await input.fill(real ? "Portal" : "Crystal");
  const option = page.getByRole("option", {
    name: real ? /Portal 2/ : /Crystal Quest/,
  });
  await expect(option).toBeVisible({ timeout: 10000 });
  await expect
    .poll(() =>
      page
        .locator(".carousel-copy")
        .evaluate((node) =>
          node
            .getAnimations()
            .every((animation) => animation.playState === "finished"),
        ),
    )
    .toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  await page.screenshot({
    path: `test-results/discovery-${real ? "rawg" : "demo"}-${info.project.name}.png`,
    fullPage: true,
  });
  await input.press("ArrowDown");
  await expect(input).toHaveAttribute(
    "aria-activedescendant",
    (await option.getAttribute("id")) ?? "",
  );
  await expect(option).toHaveAttribute("aria-selected", "true");
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeFocused();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: real ? "Portal 2" : "Crystal Quest",
      exact: true,
    }),
  ).toBeVisible();
  await input.fill("no-such-game-xyz");
  await expect(
    page.getByText(
      "Nenhum jogo encontrado. Experimente outra busca ou categoria.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver todos os resultados" }).click();
  await expect(page).toHaveURL(/\/catalog\?q=no-such-game-xyz/);
  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  await page.getByRole("button", { name: "Limpar pesquisa" }).click();
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await input.fill(real ? "Portal" : "Crystal");
  await expect(option).toBeVisible({ timeout: 10000 });
  if (info.project.name === "mobile") await option.tap();
  else await option.click();
  await expect(
    page.getByRole("heading", {
      name: real ? "Portal 2" : "Crystal Quest",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Idioma", exact: true })
    .selectOption("en");
  await page
    .getByRole("combobox", { name: "Search games", exact: true })
    .fill(real ? "Portal" : "Crystal");
  await expect(
    page.getByRole("listbox", { name: "Game suggestions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View all results" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("clicar na capa ou usar Enter abre o jogo em destaque", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Jogos em destaque" });
  await expect(hero.locator(".carousel-game-link")).toBeVisible();
  const firstUrl = await hero
    .locator(".carousel-game-link")
    .getAttribute("href");
  await hero
    .locator(".carousel-game-link")
    .click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(new RegExp(`${firstUrl}$`));
  await page.goto("/");
  await hero.getByRole("button", { name: "Próximo destaque" }).click();
  await expect(hero.locator(".carousel-game-link")).not.toHaveAttribute(
    "href",
    firstUrl!,
  );
  const nextUrl = await hero
    .locator(".carousel-game-link")
    .getAttribute("href");
  await hero.locator(".carousel-game-link").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${nextUrl}$`));
});
