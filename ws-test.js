const WebSocket = require("ws");

const ws = new WebSocket("ws://127.0.0.1:8080");

ws.on("open", () => {
  console.log("Connected to local Electron WS server");
  ws.send("START_TOGGLE");
});

ws.on("message", (msg) => {
  console.log("Received:", msg.toString());
});

ws.on("error", (err) => {
  console.error("WS error:", err.message);
});