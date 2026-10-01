import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { test } from "../fixtures/bdd-fixtures";

const { When, Then } = createBdd(test);

When("I proceed to checkout", async ({ page }) => {
  await page.locator(".shopping_cart_link").click();
  await page.locator("#checkout").click();
});

When(
  "I fill in checkout information with {string} {string} {string}",
  async ({ page }, firstName: string, lastName: string, postalCode: string) => {
    await page.locator("#first-name").fill(firstName);
    await page.locator("#last-name").fill(lastName);
    await page.locator("#postal-code").fill(postalCode);
    await page.locator("#continue").click();
  },
);

When("I finish the checkout", async ({ page }) => {
  await page.locator("#finish").click();
});

Then("I see the order confirmation page", async ({ page }) => {
  await expect(page.locator(".complete-header")).toHaveText(
    "Thank you for your order!",
  );
});
