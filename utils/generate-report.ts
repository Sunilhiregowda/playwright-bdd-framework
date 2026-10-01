// Converts Cucumber's JSON formatter output into a standalone HTML report with embedded images.
import fs from "node:fs";

type CucumberAttachment = {
  data?: string;
  mime_type?: string;
  mediaType?: string;
};

type CucumberStep = {
  name?: string;
  keyword?: string;
  result?: { status?: string; duration?: number; error_message?: string };
  embeddings?: CucumberAttachment[];
  attachments?: CucumberAttachment[];
};

type CucumberScenario = {
  name?: string;
  keyword?: string;
  type?: string;
  tags?: Array<{ name: string }>;
  steps?: CucumberStep[];
};

type CucumberFeature = {
  name?: string;
  keyword?: string;
  elements?: CucumberScenario[];
  children?: Array<{ scenario?: CucumberScenario }>;
};

export function generateHtmlReport(jsonPath: string, htmlPath: string): void {
  const features = JSON.parse(
    fs.readFileSync(jsonPath, "utf8"),
  ) as CucumberFeature[];
  const scenarios = features.flatMap(
    (feature) =>
      feature.elements ??
      feature.children?.flatMap((child) => child.scenario ?? []) ??
      [],
  );
  const allSteps = scenarios.flatMap((scenario) =>
    (scenario.steps ?? []).filter(
      (step) => !["Before", "After"].includes(step.keyword?.trim() ?? ""),
    ),
  );
  const passed = allSteps.filter(
    (step) => step.result?.status === "passed",
  ).length;
  const failed = allSteps.filter(
    (step) => step.result?.status === "failed",
  ).length;
  const durationMs =
    allSteps.reduce((total, step) => total + (step.result?.duration ?? 0), 0) /
    1_000_000;

  const featureMarkup = features
    .map((feature) => {
      const featureScenarios =
        feature.elements ??
        feature.children?.flatMap((child) => child.scenario ?? []) ??
        [];
      const scenarioMarkup = featureScenarios
        .map((scenario) => {
          const scenarioSteps = (scenario.steps ?? []).filter(
            (step) => !["Before", "After"].includes(step.keyword?.trim() ?? ""),
          );
          const stepsMarkup = scenarioSteps
            .map((step) => {
              const status = step.result?.status ?? "unknown";
              const attachments = [
                ...(step.embeddings ?? []),
                ...(step.attachments ?? []),
              ]
                .filter(
                  (attachment) =>
                    attachment.data &&
                    (attachment.mime_type ?? attachment.mediaType)?.startsWith(
                      "image/",
                    ),
                )
                .map((attachment) => {
                  const mediaType =
                    attachment.mime_type ?? attachment.mediaType ?? "image/png";
                  return `<a class="screenshot" href="data:${escapeAttribute(mediaType)};base64,${attachment.data}" target="_blank" rel="noreferrer"><img alt="Failure screenshot" src="data:${escapeAttribute(mediaType)};base64,${attachment.data}"></a>`;
                })
                .join("");
              const error = step.result?.error_message
                ? `<pre class="error">${escapeHtml(step.result.error_message)}</pre>`
                : "";
              return `<li class="step ${escapeAttribute(status)}"><span class="status">${escapeHtml(status.toUpperCase())}</span><span>${escapeHtml(step.keyword ?? "")} ${escapeHtml(step.name ?? "")}</span>${error}${attachments}</li>`;
            })
            .join("");
          const statuses = scenarioSteps.map(
            (step) => step.result?.status ?? "unknown",
          );
          const scenarioStatus = statuses.includes("failed")
            ? "failed"
            : statuses.every((status) => status === "passed")
              ? "passed"
              : "other";
          const hookScreenshots = (scenario.steps ?? [])
            .filter((step) =>
              ["Before", "After"].includes(step.keyword?.trim() ?? ""),
            )
            .flatMap((step) => [
              ...(step.embeddings ?? []),
              ...(step.attachments ?? []),
            ])
            .filter(
              (attachment) =>
                attachment.data &&
                (attachment.mime_type ?? attachment.mediaType)?.startsWith(
                  "image/",
                ),
            )
            .map((attachment) => {
              const mediaType =
                attachment.mime_type ?? attachment.mediaType ?? "image/png";
              return `<a class="screenshot" href="data:${escapeAttribute(mediaType)};base64,${attachment.data}" target="_blank" rel="noreferrer"><img alt="Failure screenshot" src="data:${escapeAttribute(mediaType)};base64,${attachment.data}"></a>`;
            })
            .join("");
          const tags = (scenario.tags ?? [])
            .map((tag) => `<span class="tag">${escapeHtml(tag.name)}</span>`)
            .join("");
          return `<article class="scenario"><div class="scenario-heading"><div><h3>${escapeHtml(scenario.name ?? "Unnamed scenario")}</h3><div class="tags">${tags}</div></div><span class="status ${scenarioStatus}">${scenarioStatus.toUpperCase()}</span></div><ol>${stepsMarkup}</ol>${hookScreenshots}</article>`;
        })
        .join("");
      return `<section class="feature"><h2>${escapeHtml(feature.keyword ?? "Feature")}: ${escapeHtml(feature.name ?? "Unnamed feature")}</h2>${scenarioMarkup}</section>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cucumber BDD Report</title><style>
:root{font-family:Segoe UI,Arial,sans-serif;color:#202a35;background:#f3f6f8}body{margin:0}.wrap{max-width:1040px;margin:0 auto;padding:32px 20px}header{border-bottom:1px solid #cbd5dc;padding-bottom:18px}h1{margin:0 0 8px;font-size:28px}h2{font-size:19px}h3{font-size:16px;margin:0 0 8px}.summary{display:flex;gap:22px;flex-wrap:wrap;color:#52616d}.summary strong{color:#172b3a}.feature{margin-top:24px}.scenario{background:#fff;border:1px solid #d9e1e6;border-radius:6px;margin:12px 0;padding:16px}.scenario-heading{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.tags{display:flex;gap:6px}.tag{font-size:12px;color:#345;padding:2px 7px;background:#eaf0f2;border-radius:3px}.status{font-size:11px;font-weight:700;min-width:48px}.passed{color:#147446}.failed{color:#b42318}.other{color:#815b00}ol{list-style:none;padding:0;margin:12px 0 0}.step{display:grid;grid-template-columns:58px 1fr;gap:8px;padding:8px 0;border-top:1px solid #edf0f2;font-size:14px}.error,.screenshot{grid-column:2}.error{white-space:pre-wrap;overflow-wrap:anywhere;color:#8f1d16;background:#fff4f2;padding:10px;margin:2px 0}.screenshot img{display:block;max-width:min(100%,700px);border:1px solid #cbd5dc}.screenshot{width:fit-content}footer{margin-top:24px;color:#61707a;font-size:13px}@media(max-width:540px){.wrap{padding:22px 14px}.scenario-heading{align-items:flex-start}.step{grid-template-columns:1fr}.error,.screenshot{grid-column:1}}
</style></head><body><main class="wrap"><header><h1>Cucumber BDD Report</h1><div class="summary"><span>Features: <strong>${features.length}</strong></span><span>Scenarios: <strong>${scenarios.length}</strong></span><span>Steps: <strong>${allSteps.length}</strong></span><span>Passed: <strong>${passed}</strong></span><span>Failed: <strong>${failed}</strong></span><span>Duration: <strong>${durationMs.toFixed(0)} ms</strong></span></div></header>${featureMarkup}<footer>Failure messages and attached screenshots are shown with their scenario steps.</footer></main></body></html>`;
  fs.writeFileSync(htmlPath, html, "utf8");
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
