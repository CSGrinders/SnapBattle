const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");

let io_s;
exports.friendUpdates = (io, server) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("friendsUpdate", (userID) => {
            try {
                socket.join(userID);
                console.log(`User ${userID} joined their update friend main room.`);
            } catch (error) {
                socket.disconnect();
                console.log("Server: Something went wrong updating information to client.");
            }
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected from group updates");
        });
    })
};

exports.sendFriendRequest = (userID, updateDetails) => {
    console.log("Sending friend Request", updateDetails);
    io_s.to(userID).emit('friendsUpdate', { type: "friendRequest", updateDetails });
}