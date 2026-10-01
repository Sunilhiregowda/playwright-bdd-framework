// Loads the selected dotenv file and exposes one typed configuration for the framework.
import dotenv from "dotenv";
import path from "node:path";

const testEnvironment = process.env.TEST_ENV ?? "qa";
if (testEnvironment !== "qa" && testEnvironment !== "uat") {
  throw new Error(
    `Unsupported TEST_ENV '${testEnvironment}'. Choose 'qa' or 'uat'.`,
  );
}

const loadedEnvironment = dotenv.config({
  path: path.resolve(__dirname, `.env.${testEnvironment}`),
});

export type BrowserName = "chromium" | "firefox" | "webkit";

const browserName = process.env.BROWSER ?? "chromium";
if (
  browserName !== "chromium" &&
  browserName !== "firefox" &&
  browserName !== "webkit"
) {
  throw new Error(
    `Unsupported BROWSER '${browserName}'. Choose chromium, firefox, or webkit.`,
  );
}

const headlessValue = process.env.HEADLESS?.toLowerCase() ?? "true";
if (headlessValue !== "true" && headlessValue !== "false") {
  throw new Error("HEADLESS must be either 'true' or 'false'.");
}

const timeout = Number(process.env.TIMEOUT ?? "30000");
if (!Number.isFinite(timeout) || timeout <= 0) {
  throw new Error("TIMEOUT must be a positive number of milliseconds.");
}

export const settings = {
  environment: testEnvironment,
  baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com",
  browserName: browserName as BrowserName,
  headless: headlessValue === "true",
  timeout,
  username:
    process.env.TEST_USERNAME ??
    (process.platform === "win32"
      ? loadedEnvironment.parsed?.USERNAME
      : process.env.USERNAME) ??
    process.env.USERNAME ??
    "",
  password:
    process.env.TEST_PASSWORD ??
    process.env.PASSWORD ??
    loadedEnvironment.parsed?.PASSWORD ??
    "",
  invalidUsername: process.env.INVALID_USERNAME ?? "invalid_user",
  invalidPassword: process.env.INVALID_PASSWORD ?? "wrong_password",
} as const;

export function requireValidCredentials(): {
  username: string;
  password: string;
} {
  if (!settings.username || !settings.password) {
    throw new Error(
      `USERNAME and PASSWORD must be set in config/.env.${settings.environment} or the process environment.`,
    );
  }
  return { username: settings.username, password: settings.password };
}
