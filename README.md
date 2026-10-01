# Playwright Cucumber BDD Framework

A small, runnable browser-automation framework for SauceDemo using Playwright as the browser library and Cucumber as the BDD test runner. Scenarios are written in Gherkin, step definitions delegate to a page object, and each scenario gets an isolated browser context.

## A. Project architecture

```text
playwright-bdd-framework/
├── features/                  # Business-readable Gherkin scenarios and tags
├── step-definitions/          # Cucumber Given/When/Then implementations
├── pages/                     # Page Object Model selectors and interactions
├── hooks/                     # Browser lifecycle and failed-scenario screenshots
├── config/                    # Typed settings and qa/uat dotenv files
├── test-runner/               # Cucumber CLI orchestration
├── utils/                     # Cucumber JSON to standalone HTML report
├── reports/                   # Generated Cucumber and Allure HTML reports
├── allure-results/            # Generated Allure result data
├── screenshots/               # PNGs saved for failed scenarios
├── playwright.config.ts       # Shared browser settings; not a Playwright Test config
├── tsconfig.json               # TypeScript compiler options
├── package.json                # Dependencies and npm scripts
└── README.md                   # Setup and usage guide
```

`LoginPage` owns UI selectors and interactions. Cucumber hooks create and dispose of the Browser, BrowserContext, and Page. Step definitions connect Gherkin to the page object without embedding browser code in the feature.

## B. Installation

Run these commands from the `playwright-bdd-framework` directory:

```bash
npm install
```

## C. Install Playwright browsers

Install Chromium (the default browser):

```bash
npx playwright install chromium
```

To use Firefox or WebKit instead, install the corresponding browser and set `BROWSER=firefox` or `BROWSER=webkit`.

## D. Environment configuration

The selected dotenv file is `config/.env.${TEST_ENV}`. `TEST_ENV` defaults to `qa`; set it to `uat` to load `config/.env.uat`. Edit the selected file with the base URL and credentials for that environment. The QA file contains the public SauceDemo sample account requested for this framework. Replace the UAT values before targeting a real UAT service. Process environment variables override values loaded from dotenv.

Configurable values include `BASE_URL`, `USERNAME`, `PASSWORD`, `INVALID_USERNAME`, `INVALID_PASSWORD`, `BROWSER`, `HEADLESS`, and `TIMEOUT` (milliseconds). On Windows, the operating system already defines `USERNAME`; the framework reads the selected dotenv account value instead. To override credentials through the process environment on any platform, set `TEST_USERNAME` and `TEST_PASSWORD`. Do not put private credentials into source control.

Examples:

```bash
# PowerShell
$env:TEST_ENV="qa"; npm run test:bdd
$env:TEST_ENV="uat"; npm run test:bdd
$env:BROWSER="firefox"; npm run test:bdd
```

## E. Execute all BDD tests

```bash
npm run test:bdd
```

Cucumber runs every `.feature` file under `features/`. Failed scenarios do not stop later scenarios by default; the runner still generates the report and then returns a failing exit code.

## F. Execute a specific feature

```bash
npm run test:bdd -- features/login.feature
```

## G. Execute a specific scenario or tag

Run the scenario tagged `@smoke`:

```bash
npm run test:bdd -- --tags @smoke
```

Run the invalid-login regression scenario:

```bash
npm run test:bdd -- --tags @regression
```

Tags can also be used directly with Cucumber: `npx cucumber-js --tags "@smoke"`. The root `cucumber.js` configuration loads `tsx` and the step definitions/hooks. For the HTML report, use the framework npm runner.

## H. Run in headed mode

```bash
npm run test:bdd:headed
```

This sets `HEADLESS=false`. You can also set `HEADLESS=false` in the process environment for other commands.

## I. Generate the HTML report

Both `test:bdd` and `test:bdd:html` generate `reports/cucumber-report.html` and the underlying `reports/cucumber-report.json`:

```bash
npm run test:bdd:html
```

The standalone HTML report includes feature and scenario names, tags, each step's status, duration summary, failure messages, and attached failure screenshots.

## Allure report

Every framework run writes Allure result data to `allure-results/` in addition to the existing Cucumber JSON and HTML reports. The runner clears the previous Allure results before each run so the next report contains only that run.

Generate and open the interactive Allure report with:

```bash
npm run allure:generate
npm run allure:open
```

The report is generated under `reports/allure-report/`. Allure 3 is installed as a project dependency, so no global Allure installation or Java runtime is needed.

## J. Failure screenshots

The Cucumber `After` hook checks the scenario result. If it failed and a Page exists, it saves a full-page PNG under `screenshots/` and attaches the image to Cucumber's JSON output. The HTML report embeds that image. Page, BrowserContext, and Browser are closed in the hook's `finally` path, including after screenshot errors.

## K. End-to-end flow

The `.feature` file describes behavior using Gherkin. Cucumber discovers the feature and matches each sentence to a step definition. The step definition calls `LoginPage`, which performs UI operations through Playwright's `Page`. The `Page` belongs to an isolated `BrowserContext`, which is managed by a Playwright `Browser`. The browser interacts with SauceDemo, then Cucumber records the result and the runner turns its JSON output into the HTML report.

```text
Feature File
     ↓
Cucumber
     ↓
Step Definition
     ↓
Page Object
     ↓
Playwright
     ↓
Browser
     ↓
Application
     ↓
Cucumber Report
```

The Playwright Test runner is not used to execute these scenarios.
