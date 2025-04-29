import { DefaultEventsMap, Server } from "socket.io";

export const initSocket = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    io.on("connection", (socket) => {
        socket.on("joinRoom", (roomId) => {
            console.log("Device joined room: " + roomId);
            socket.join(roomId);
        });
    });
};
