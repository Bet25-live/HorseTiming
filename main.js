const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const store = require("./settings");

const {
  startLocalWebSocketServer,
  sendToLocalClients,
  stopLocalWebSocketServer
} = require("./local-ws-server");

let mainWindow = null;

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
}

app.whenReady().then(() => {
  ipcMain.handle("settings:get", () => {
    return store.store || {};
  });

  ipcMain.handle("settings:set", (event, newSettings) => {
    store.set(newSettings);
    return store.store || {};
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