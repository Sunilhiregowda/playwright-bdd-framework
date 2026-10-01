// Step definitions translate each Gherkin sentence into a reusable page-object operation.
import { Given, When, Then } from "@cucumber/cucumber";
import { settings, requireValidCredentials } from "../utils/config/config";
import { CustomWorld } from "../hooks/hooks";

Given(
  "I navigate to the login page",
  async function (this: CustomWorld): Promise<void> {
    await this.getLoginPage().navigateToLoginPage();
  },
);

When(
  "I enter valid username and password",
  async function (this: CustomWorld): Promise<void> {
    const credentials = requireValidCredentials();
    const loginPage = this.getLoginPage();
    await loginPage.enterUsername(credentials.username);
    await loginPage.enterPassword(credentials.password);
  },
);

When(
  "I enter invalid username and password",
  async function (this: CustomWorld): Promise<void> {
    const loginPage = this.getLoginPage();
    await loginPage.enterUsername(settings.invalidUsername);
    await loginPage.enterPassword(settings.invalidPassword);
  },
);

When(
  "I click the login button",
  async function (this: CustomWorld): Promise<void> {
    await this.getLoginPage().clickLogin();
  },
);

Then(
  "I should be successfully logged in",
  async function (this: CustomWorld): Promise<void> {
    await this.getLoginPage().verifySuccessfulLogin();
  },
);

Then(
  "I should see a login error",
  async function (this: CustomWorld): Promise<void> {
    await this.getLoginPage().verifyLoginError();
  },
);
