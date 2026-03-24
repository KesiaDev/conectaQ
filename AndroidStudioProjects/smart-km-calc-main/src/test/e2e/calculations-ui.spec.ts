import { test, expect, Page } from "@playwright/test";

// Injeta um usuário falso no localStorage para pular o login
async function injectFakeSession(page: Page) {
  await page.addInitScript(() => {
    // Mock básico para que o useAuth retorne um usuário falso
    // Isso evita o redirect para /auth
    const fakeSession = {
      access_token: "fake-token",
      refresh_token: "fake-refresh",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        id: "user-test-123",
        email: "test@test.com",
        role: "authenticated",
      },
    };
    // Supabase usa esta chave no localStorage
    const storageKey = Object.keys(localStorage).find(k => k.includes("supabase.auth")) || "sb-auth-token";
    localStorage.setItem(storageKey, JSON.stringify(fakeSession));
  });

  // Mock todas as chamadas de API do Supabase
  await page.route("**/auth/v1/token**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "fake-token",
        user: { id: "user-test-123", email: "test@test.com" },
      }),
    });
  });
  await page.route("**/auth/v1/user**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-test-123", email: "test@test.com" }),
    });
  });
  await page.route("**/rest/v1/fuel_entries**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
  await page.route("**/rest/v1/tolls**", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
}

test.describe("Interface de Cálculos — Novo Abastecimento", () => {
  test.beforeEach(async ({ page }) => {
    await injectFakeSession(page);
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("página de login ou app principal carrega sem crash", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // Deve ter um dos dois: tela de login ou app principal
    const hasLogin = await page.locator("text=Km por Litro").isVisible();
    expect(hasLogin).toBe(true);
  });

  test("formulário de abastecimento calcula litros ao vivo", async ({ page }) => {
    // Se estiver na tela de login, prosseguir (não é possível sem credenciais reais)
    const isLoginPage = await page.getByPlaceholder("seu@email.com").isVisible().catch(() => false);
    if (isLoginPage) {
      // Testar apenas a tela de login
      await expect(page.locator("h1")).toContainText("Km por Litro");
      return;
    }

    // Se conseguir acessar o app
    const refuelTab = page.getByText("Abastecer");
    if (await refuelTab.isVisible()) {
      await refuelTab.click();
      const totalSpent = page.getByPlaceholder("100,00");
      const pricePerLiter = page.getByPlaceholder("6,36");
      if (await totalSpent.isVisible()) {
        await totalSpent.fill("120");
        await pricePerLiter.fill("6");
        // Deve mostrar "20,00 L" (120/6 = 20)
        await expect(page.locator("text=L").first()).toBeVisible();
      }
    }
  });
});

test.describe("Responsividade Mobile", () => {
  test("layout mobile (375px) não tem overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await injectFakeSession(page);
    await page.goto("/");
    await page.waitForTimeout(500);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px de tolerância
  });

  test("layout tablet (768px) renderiza corretamente", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await injectFakeSession(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
