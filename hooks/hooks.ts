// Cucumber hooks create an isolated browser session per scenario and always release it afterward.
import {
  After,
  Before,
  Status,
  World,
  setDefaultTimeout,
  setWorldConstructor,
  type ITestCaseHookParameter,
  type IWorldOptions,
} from "@cucumber/cucumber";
import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserContext,
  type BrowserType,
  type Page,
} from "playwright";
import fs from "node:fs";
import path from "node:path";
import { settings, type BrowserName } from "../utils/config/config";
import { LoginPage } from "../pages/LoginPage";

// Playwright Page is a tab; BrowserContext isolates cookies and storage; Browser owns the process.
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  loginPage?: LoginPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  getLoginPage(): LoginPage {
    if (!this.loginPage) {
      throw new Error(
        "The login page is not initialized. Check the Cucumber Before hook.",
      );
    }
    return this.loginPage;
  }
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(settings.timeout);

const browserTypes: Record<BrowserName, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

Before(async function (this: CustomWorld): Promise<void> {
  this.browser = await browserTypes[settings.browserName].launch({
    headless: settings.headless,
  });
  this.context = await this.browser.newContext({ baseURL: settings.baseUrl });
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
});

After(async function (
  this: CustomWorld,
  scenario: ITestCaseHookParameter,
): Promise<void> {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshotDirectory = path.resolve(process.cwd(), "screenshots");
      fs.mkdirSync(screenshotDirectory, { recursive: true });
      const safeScenarioName = scenario.pickle.name
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/^-|-$/g, "");
      const screenshotPath = path.join(
        screenshotDirectory,
        `${safeScenarioName || "failed-scenario"}-${Date.now()}.png`,
      );
      const screenshot = await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      await this.attach(screenshot, "image/png");
      console.error(`Failure screenshot saved to ${screenshotPath}`);
    }
  } catch (error) {
    console.error("Could not capture or attach the failure screenshot:", error);
  } finally {
    await closeResource(this.page, "page");
    await closeResource(this.context, "browser context");
    await closeResource(this.browser, "browser");
    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
    this.loginPage = undefined;
  }
});

async function closeResource(
  resource: { close(): Promise<void> } | undefined,
  resourceName: string,
): Promise<void> {
  if (!resource) return;
  try {
    await resource.close();
  } catch (error) {
    console.error(`Could not close ${resourceName}:`, error);
  }
}
