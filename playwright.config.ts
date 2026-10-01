// This repository runs its BDD suite through the Cucumber CLI runner in test-runner/runner.ts.
// Keeping this file as a no-op avoids the broken Playwright Test + playwright-bdd wiring that was
// previously pointing at nonexistent `src` files and a non-existent `utils/config` import.
export default {};
