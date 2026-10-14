import { test, expect } from "@playwright/test";
test("API de produção, navegação, busca e favoritos persistentes", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Seu próximo jogo favorito/ }),
  ).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.screenshot({
    path: `test-results/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Conhecer o jogo" }).click();
  await expect(
    page.getByRole("heading", { name: "Neon Odyssey" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toBeVisible();
  await page.goto("/favorites");
  await expect(
    page.getByRole("link", { name: "Neon Odyssey", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remover Neon Odyssey dos favoritos" })
    .click();
  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  await page.getByRole("link", { name: "Descobrir jogos" }).click();
  await expect(page.locator(".game-card")).toHaveCount(25);
  await page.getByRole("textbox", { name: "Buscar por nome" }).fill("crystal");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Crystal Quest", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator(".game-card")).toHaveCount(25);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir navegação" }).click();
    await expect(page.getByRole("link", { name: "Visão geral" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Abrir navegação" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "Abrir navegação" }).click();
    await page.getByRole("link", { name: "Visão geral" }).click();
    await expect(
      page.getByRole("heading", { name: /Seu próximo jogo favorito/ }),
    ).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
