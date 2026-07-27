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
      on('task', {
        // Loga no stdout do Node (útil p/ diagnóstico durante `cypress run`)
        log(mensagem) {
          // eslint-disable-next-line no-console
          console.log(mensagem);
          return null;
        },
        // Limpa a pasta de downloads (usado antes de validar exports .xlsx)
        deleteDownloads() {
          const fs = require('fs');
          const path = require('path');
          const dir = config.downloadsFolder || 'cypress/downloads';
          if (fs.existsSync(dir)) {
            for (const f of fs.readdirSync(dir)) {
              fs.rmSync(path.join(dir, f), { force: true });
            }
          }
          return null;
        },
        // Lista os arquivos atualmente na pasta de downloads
        listDownloads() {
          const fs = require('fs');
          const dir = config.downloadsFolder || 'cypress/downloads';
          return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
        },
      });
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
