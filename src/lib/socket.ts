// lib/socket.ts
import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export const setIO = (server: IOServer) => {
    io = server;
};

export const getIO = (): IOServer => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
