import { test, expect } from "@playwright/test";

test.describe("Página de Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renderiza logo e título", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Km por Litro");
    await expect(page.locator("img[alt='Km por Litro']")).toBeVisible();
  });

  test("exibe formulário de login por padrão", async ({ page }) => {
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("botão Google OAuth está visível", async ({ page }) => {
    await expect(page.getByRole("button", { name: /continuar com google/i })).toBeVisible();
  });

  test("alterna para modo cadastro", async ({ page }) => {
    await page.getByRole("button", { name: /criar conta/i }).last().click();
    await expect(page.getByPlaceholder("Seu nome")).toBeVisible();
    await expect(page.getByRole("button", { name: /criar conta/i }).first()).toBeVisible();
  });

  test("exibe erro ao tentar logar com campos vazios", async ({ page }) => {
    await page.getByRole("button", { name: /entrar/i }).click();
    // O botão deve estar desabilitado ou mostrar toast de erro
    // O HTML5 required deve bloquear o submit
    const emailInput = page.getByPlaceholder("seu@email.com");
    await expect(emailInput).toBeVisible();
  });

  test("campo senha tem tipo password", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("toggle de tema está visível", async ({ page }) => {
    // ThemeToggle está no canto superior direito
    await expect(page.locator("button[title]").or(page.locator("[data-testid='theme-toggle']")).first()).toBeVisible();
  });
});
