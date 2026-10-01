import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { test } from "../fixtures/bdd-fixtures";

const { When, Then } = createBdd(test);

When(
  "I add {string} to the cart",
  async ({ inventoryPage }, productName: string) => {
    await inventoryPage.addProductToCart(productName);
  },
);

Then(
  "I see cart badge count as {string}",
  async ({ inventoryPage }, count: string) => {
    await expect(inventoryPage.cartBadge).toHaveText(count);
  },
);

Then(
  "I see {string} in the cart",
  async ({ inventoryPage }, productName: string) => {
    const cartItem = await inventoryPage.getCartItemByName(productName);
    await expect(cartItem).toBeVisible();
  },
);
