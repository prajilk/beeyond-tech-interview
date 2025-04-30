const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { initSocket } = require("./socket");

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/socket", (req, res) => {
    res.send("Server created successfully!");
});

app.post("/socket/send-order-status", (req, res) => {
    const roomId = req.query.roomId;
    if (!roomId) {
        res.send("Room ID not found");
        return;
    }
    const body = req.body;

    if (!body) {
        res.send("Body not found");
        return;
    }

    io.to(roomId).emit("update-order-status", body.orderStatus);
    io.to(roomId).emit("update-order-table", body.orderId, body.status);
    res.send("Event sent");
});

const server = app.listen(PORT, () =>
    console.log(`Server running on Port: ${PORT}`)
);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://43.204.215.55"],
        credentials: true,
    },
});

initSocket(io);