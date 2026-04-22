const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',

    setupNodeEvents(on, config) {
      return config
    },

    specPattern: 'cypress/e2e/**/*.js',
    supportFile: false
  },
})