const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const store = require("./settings");

const {
  startLocalWebSocketServer,
  sendToLocalClients,
  stopLocalWebSocketServer
} = require("./local-ws-server");

let mainWindow = null;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile("index.html");

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update-status", {
      status: "downloading",
      version: info.version
    });
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update-status", {
      status: "up-to-date"
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow.webContents.send("update-status", {
      status: "downloading",
      percent: Math.round(progress.percent)
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send("update-status", {
      status: "ready",
      version: info.version
    });
  });

  autoUpdater.on("error", (err) => {
    console.warn("Auto-update error:", err);
    mainWindow.webContents.send("update-status", {
      status: "error",
      message: err.message
    });
  });

  autoUpdater.checkForUpdates().catch(console.warn);
}

app.whenReady().then(() => {
  ipcMain.handle("settings:get", () => {
    return store.store || {};
  });

  ipcMain.handle("settings:set", (event, newSettings) => {
    store.set(newSettings);
    return store.store || {};
  });

  ipcMain.handle("updater:install", () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle("updater:check", () => {
    autoUpdater.checkForUpdates().catch(console.warn);
  });

  ipcMain.handle("app:getVersion", () => {
    return app.getVersion();
  });

  const settings = store.store || {};
  const wsPort = Number(settings.localWsPort) || 8080;

  startLocalWebSocketServer((message) => {
  console.log("Received in Electron WS server:", message);

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("ws-command", message);
  }
}, wsPort);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopLocalWebSocketServer();
});
