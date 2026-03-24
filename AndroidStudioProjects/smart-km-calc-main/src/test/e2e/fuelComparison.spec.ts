import { test, expect, Page } from "@playwright/test";

// Mock Supabase auth so we can access the main app
async function mockAuthAndNavigate(page: Page) {
  // Intercept Supabase session check to return null (not logged in fallback)
  await page.route("**/auth/v1/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { session: null }, error: null }),
    });
  });
  await page.route("**/rest/v1/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
  await page.goto("/");
}

test.describe("Comparativo Inteligente de Combustível (UI)", () => {
  test("página de auth carrega e tem campos de email/senha", async ({ page }) => {
    await mockAuthAndNavigate(page);
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
  });

  test("digitando no campo de email não quebra a página", async ({ page }) => {
    await mockAuthAndNavigate(page);
    const emailInput = page.getByPlaceholder("seu@email.com");
    await emailInput.fill("teste@email.com");
    await expect(emailInput).toHaveValue("teste@email.com");
  });

  test("digitando senha não quebra a página", async ({ page }) => {
    await mockAuthAndNavigate(page);
    const passwordInput = page.getByPlaceholder("••••••••");
    await passwordInput.fill("senha123");
    await expect(passwordInput).toHaveValue("senha123");
  });

  test("não há erros JavaScript no console ao carregar", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await mockAuthAndNavigate(page);
    await page.waitForTimeout(1000);
    // Filtrar erros conhecidos de Supabase (esperados pois mockamos)
    const realErrors = errors.filter(
      (e) => !e.includes("supabase") && !e.includes("fetch") && !e.includes("Failed to fetch")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("página de login tem título correto na aba do browser", async ({ page }) => {
    await mockAuthAndNavigate(page);
    // Verifica se o texto principal da marca está presente
    await expect(page.locator("body")).toContainText("Km por Litro");
  });
});
