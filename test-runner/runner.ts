// Cucumber is launched as a child process so its CLI owns feature discovery and scenario execution.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { generateHtmlReport } from "../utils/generate-report";

const projectRoot = process.cwd();
const reportsDirectory = path.join(projectRoot, "reports");
const allureResultsDirectory = path.join(projectRoot, "allure-results");
fs.mkdirSync(reportsDirectory, { recursive: true });
fs.mkdirSync(path.join(projectRoot, "screenshots"), { recursive: true });
fs.rmSync(allureResultsDirectory, { recursive: true, force: true });

const forwardedArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--html");
const featurePaths = forwardedArguments.filter((argument) =>
  argument.endsWith(".feature"),
);
const cucumberArguments = forwardedArguments.filter(
  (argument) => !argument.endsWith(".feature"),
);
const selectedFeatures =
  featurePaths.length > 0 ? featurePaths : ["features/**/*.feature"];
const jsonReportPath = path.join(reportsDirectory, "cucumber-report.json");
const htmlReportPath = path.join(reportsDirectory, "cucumber-report.html");
const cucumberCliPath = path.join(
  projectRoot,
  "node_modules",
  "@cucumber",
  "cucumber",
  "bin",
  "cucumber.js",
);

const result = spawnSync(
  process.execPath,
  [
    cucumberCliPath,
    "--format",
    "json:reports/cucumber-report.json",
    ...selectedFeatures,
    ...cucumberArguments,
  ],
  { cwd: projectRoot, env: process.env, stdio: "inherit" },
);

if (result.error) {
  console.error("Could not start the Cucumber CLI:", result.error);
  process.exitCode = 1;
} else {
  if (fs.existsSync(jsonReportPath)) {
    try {
      generateHtmlReport(jsonReportPath, htmlReportPath);
      console.log(`HTML report written to ${htmlReportPath}`);
    } catch (error) {
      console.error("Could not generate the HTML report:", error);
      process.exitCode = 1;
    }
  } else {
    console.error("Cucumber did not produce a JSON report.");
    process.exitCode = 1;
  }

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
}
