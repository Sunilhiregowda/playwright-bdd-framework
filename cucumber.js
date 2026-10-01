// Default Cucumber CLI configuration enables direct tagged runs and the framework runner.
module.exports = {
  default: [
    "--require-module tsx/cjs",
    "--require step-definitions/**/*.ts",
    "--require hooks/**/*.ts",
    "--format allure-cucumberjs/reporter",
  ].join(" "),
};
