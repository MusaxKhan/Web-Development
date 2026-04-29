const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("lead-activity", (data) => {
      io.emit("update-ui", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
