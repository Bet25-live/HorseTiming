const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("appSettings", {
  get: () => ipcRenderer.invoke("settings:get"),
  set: (settings) => ipcRenderer.invoke("settings:set", settings)
});

contextBridge.exposeInMainWorld("electronWs", {
  onCommand: (callback) => {
    ipcRenderer.on("ws-command", (event, message) => {
      callback(message);
    });
  }
});

contextBridge.exposeInMainWorld("appUpdater", {
  onStatus: (callback) => {
    ipcRenderer.on("update-status", (event, data) => {
      callback(data);
    });
  },
  install: () => ipcRenderer.invoke("updater:install"),
  check: () => ipcRenderer.invoke("updater:check")
});

contextBridge.exposeInMainWorld("presenter", {
  onCommand: (callback) => {
    ipcRenderer.on("presenter-command", (event, data) => {
      callback(data);
    });
  },
  apply: () => ipcRenderer.invoke("presenter:apply"),
  status: () => ipcRenderer.invoke("presenter:status")
});

contextBridge.exposeInMainWorld("appInfo", {
  getVersion: () => ipcRenderer.invoke("app:getVersion")
});
