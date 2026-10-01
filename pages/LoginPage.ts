// Page Object Model: keep selectors and login-page interactions together and reusable.
import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { settings } from "../utils/config/config";

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly pageTitle: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(settings.baseUrl, { waitUntil: "domcontentloaded" });
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL("**/inventory.html", {
      timeout: settings.timeout,
    });
    const title = await this.pageTitle.textContent();
    assert.equal(
      title?.trim(),
      "Products",
      "The inventory page should display its Products title.",
    );
  }

  async verifyLoginError(): Promise<void> {
    await this.errorMessage.waitFor({
      state: "visible",
      timeout: settings.timeout,
    });
    const message = await this.errorMessage.textContent();
    assert.match(
      message ?? "",
      /Username and password do not match/,
      "The login page should explain that the credentials are invalid.",
    );
  }
}
