const WebSocket = require("ws");

let wss = null;
let broadcast = null;

function startLocalWebSocketServer(onMessage, port = 8080) {
  if (wss) {
    console.log("WebSocket server already running");
    return wss;
  }

  wss = new WebSocket.Server({
    host: "0.0.0.0",
    port: port
  });

  wss.on("connection", (socket) => {
    console.log("Local WS client connected");

    socket.on("message", (message) => {
      const text = message.toString().trim();
      console.log("Local WS message:", text);

      // Broadcast til alle (inkl. UI)
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(text);
        }
      });

      // Callback til Electron (valgfrit)
      if (typeof onMessage === "function") {
        onMessage(text);
      }
    });

    socket.on("close", () => {
      console.log("Local WS client disconnected");
    });

    socket.on("error", (err) => {
      console.error("WS error:", err.message);
    });
  });

  broadcast = (msg) => {
    if (!wss) return;

    const payload =
      typeof msg === "string" ? msg : JSON.stringify(msg);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  console.log(`Local WebSocket server started on ws://0.0.0.0:${port}`);

  return wss;
}

function sendToLocalClients(msg) {
  if (broadcast) {
    broadcast(msg);
  }
}

function stopLocalWebSocketServer() {
  if (wss) {
    console.log("Stopping WebSocket server");
    wss.close();
    wss = null;
    broadcast = null;
  }
}

module.exports = {
  startLocalWebSocketServer,
  sendToLocalClients,
  stopLocalWebSocketServer
};