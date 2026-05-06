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