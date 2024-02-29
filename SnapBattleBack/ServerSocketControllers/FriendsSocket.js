const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");

let io_s;
exports.friendUpdates = (io) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("friendsUpdate", (token, mode) => {
            let user;
            if (mode !== "leaveProfile" && mode !== "leaveOther") {
                user =jwt.verify(token, process.env.TOKEN_KEY);
                if (!user) return socket.disconnect();
            }
            switch (mode) {
                case "friendsPage":
                    try {
                        socket.join(user.userId);
                        console.log(`User ${user.userId} joined their update friend main room.`);
                    } catch (error) {
                        socket.disconnect();
                        console.log("Server: Something went wrong updating information to client.");
                    }
                    break;
                case "otherprofile": {
                    const room =  `${user.userId}_otherprofile`
                    socket.join(room);
                    console.log(`User ${user.userId} joined their update other friend profile room. ${room}`);
                    break;
                }
                case "leaveProfile": {
                    console.log(`${token} left their friend room.`);
                    socket.leave(token);
                    break;
                }
                case "leaveOther": {
                    const room =  `${token}_otherprofile`
                    console.log(`${token} left their profile other view room. ${room}`);
                    socket.leave(room);
                    break;
                }
            }
        });
    })
};


exports.sendFriendRequest = (userID, updateDetails) => {
    console.log("Sending friend Request to" + updateDetails + " " + userID);
    io_s.to(userID).emit('friendsUpdate', { type: "friendRequest", updateDetails });
}


exports.sendFriendUpdate = (userID, updateDetails) => {
    console.log("Sending friends update", updateDetails);
    io_s.to(userID).emit('friendsUpdate', { type: "friendUpdate", updateDetails });
}