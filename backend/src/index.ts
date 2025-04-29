import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { initSocket } from "./socket";
import userRouter from "./routes/UserRoutes";
const PORT = process.env.PORT || 5000;
dotenv.config();

//Connect to database
import "./config/db";

const app = express();
app.use("/api/user", userRouter);

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server created successfully!");
});

app.post("/send-order-status", (req, res) => {
    const roomId = req.query.roomId as string;
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
        origin: ["http://localhost:3000"],
        credentials: true,
    },
});

initSocket(io);
