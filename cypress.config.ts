import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    baseApiUrl: 'https://token.stage.sittax.com.br',
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'results/test-results-[hash].xml',
      toConsole: true,
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
    defaultCommandTimeout: 15000,
    requestTimeout: 30000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    testIsolation: false,
    baseUrl: "https://token.stage.sittax.com.br/",
    numTestsKeptInMemory: 5,
    retries: { runMode: 2, openMode: 0 },
    trashAssetsBeforeRuns: true,
    video: false,
    watchForFileChanges: false,
    chromeWebSecurity: false,
  },
});
