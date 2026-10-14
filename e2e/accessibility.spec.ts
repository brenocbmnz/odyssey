import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const real = process.env.E2E_SOURCE === "rawg";
const game = {
  id: "4200",
  name: "Portal 2",
  category: "Estratégia",
  description: "A strategy game description.",
  releaseDate: "2011-04-18",
  rating: 4.6,
  popularity: 100,
  source: "rawg",
  image: "/art/game-1.svg",
};
test.beforeEach(async ({ page }) => {
  if (real)
    await page.route("**/api/games**", (route) =>
      route.fulfill({
        json:
          new URL(route.request().url()).pathname === "/api/games"
            ? { games: [game], total: 1, hasMore: false }
            : game,
      }),
    );
});
async function audit(page: Page) {
  if (await page.locator(".carousel-copy").count())
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
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((item) => ({
      id: item.id,
      description: item.description,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}
test("idioma persistido, conteúdo traduzido, foco e auditoria ARIA/WCAG", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.locator(".game-card").first()).toBeVisible();
  await audit(page);
  await page
    .getByRole("combobox", { name: "Idioma", exact: true })
    .selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "What to play next?" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Language" })).toHaveValue(
    "en",
  );
  await expect(page.locator(".game-card").first()).toBeVisible();
  await page.screenshot({
    path: `test-results/english-${real ? "rawg" : "demo"}-${info.project.name}.png`,
    fullPage: true,
  });
  if (info.project.name === "mobile") {
    const toggle = page.getByRole("button", { name: "Open navigation" });
    await expect(toggle).toHaveAttribute("aria-controls", "site-navigation");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Close navigation" }).first(),
    ).toBeFocused();
    await expect(page.locator(".mobile-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await audit(page);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeFocused();
  }
  await page.goto("/catalog");
  await expect(
    page.getByRole("heading", { name: "Game catalog." }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Search by name" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Strategy", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Strategy", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/category=Estrat%C3%A9gia/);
  await expect(page.locator(".game-card").first()).toBeVisible();
  await audit(page);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".game-card").first()).toBeVisible();
  await page.goto(real ? "/games/4200" : "/games/1");
  await expect(
    page.getByRole("heading", {
      name: real ? "Portal 2" : "Neon Odyssey",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Release date", { exact: true })).toBeVisible();
  await audit(page);
  await page
    .getByRole("button", { name: "Add to favorites", exact: true })
    .click();
  await expect(page.getByRole("status").last()).toContainText(
    "Game added to favorites.",
  );
  await page.goto("/favorites");
  await expect(page.locator(".game-card").first()).toBeVisible();
  await audit(page);
  const favorite = page.getByRole("button", {
    name: `Favorite ${real ? "Portal 2" : "Neon Odyssey"}`,
  });
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await favorite.click();
  await expect(page.getByText("Nothing here yet")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "My favorites." }),
  ).toBeFocused();
  await audit(page);
  await page.goto("/missing");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await audit(page);
  await page.getByRole("combobox", { name: "Language" }).selectOption("pt-BR");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
