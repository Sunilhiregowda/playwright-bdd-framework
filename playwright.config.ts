// Shared Playwright settings for reference and tooling. Cucumber, not Playwright Test, runs scenarios.
import { settings } from "./config/config";

const playwrightConfiguration = {
  baseURL: settings.baseUrl,
  browserName: settings.browserName,
  headless: settings.headless,
  timeout: settings.timeout,
};

export default playwrightConfiguration;
