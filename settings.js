const Store = require("electron-store");

const store = new Store({
  defaults: {
    timingServerUrl: "http://194.255.124.138:500/api/timing",
    timingServerUrlHistory: [
      "http://194.255.124.138:500/api/timing"
    ],
    localWsPort: 8080,
    autoClearSeconds: 30,
    companionUrls: [
      "http://194.255.124.138:25002/api/custom-variable",
      "http://127.0.0.1:8000/api/custom-variable"
    ]
  }
});

module.exports = store;