const jwt = require("jsonwebtoken");

let io_s;
exports.otherUpdates = (io) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("otherProfile", (token, mode) => {
            let user;
            if (mode !== "leaveOther") {
                user =jwt.verify(token, process.env.TOKEN_KEY);
                if (!user) return socket.disconnect();
            }
            switch (mode) {
                case "otherprofile": {
                    const room =  `${user.userId}_otherprofile`
                    socket.join(room);
                    console.log(`User ${user.userId} joined their update other friend profile room. ${room}`);
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

exports.sendExitProfile = (userID) => {
    console.log("Sending exit profile");
    io_s.to(userID).emit('otherProfile', { type: "exitProfile"});
}

exports.sendUpdateProfileStatus = (userID, updateDetails, mode) => {
    console.log("Sending update other profile status" + updateDetails);
    switch (mode) {
        case "accept":
            io_s.to(userID).emit('otherProfile', { type: "otherAccept", updateDetails })
            break;
        case "deny":
            io_s.to(userID).emit('otherProfile', { type: "otherDeny", updateDetails })
            break;
    }
}