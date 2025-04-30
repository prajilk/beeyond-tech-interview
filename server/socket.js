module.exports = {
    initSocket: (io) => {
        io.on("connection", (socket) => {
            socket.on("joinRoom", (roomId) => {
                console.log("Device joined room: " + roomId);
                socket.join(roomId);
            });
        });
    }
};
