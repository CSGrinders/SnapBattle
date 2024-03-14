const jwt = require("jsonwebtoken");

let io_s;
exports.groupUpdates = (io) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("groupUpdate", (token, mode, groupID) => {
            try {
                let user;
                if (mode !== "leave") {
                    user =jwt.verify(token, process.env.TOKEN_KEY);
                    if (!user) return socket.disconnect();
                }
                switch (mode) {
                    case "groupsMain":
                        socket.join(user.userId);
                        console.log(`User ${user.userId} joined  their update group main room.`);
                        break;
                    case "groupHome": //Not tested idk if works
                        const groupRoom = `group_${groupID}_user_${user.userId}`;
                        socket.join(groupRoom);
                        console.log(`User ${user.userId} joined ${groupID} group update room.`);
                        break;
                    case "leave":
                        console.log(`${token} left their group main room.`);
                        socket.leave(token);
                        break;
                }
            } catch (error) {
                socket.disconnect();
                console.log(error);
                console.log("Server: Something went wrong updating information to client.");
            }
        });
    })
};

exports.sendGroupInvites = (userID, updateDetails) => {
    console.log("Sending group invites", updateDetails);
    io_s.to(userID).emit('groupUpdate', { type: "groupInvite", updateDetails });
}

exports.sendGroups = (userID, updateDetails) => {
    console.log("Sending Groups details", updateDetails);
    io_s.to(userID).emit('groupUpdate', { type: "groups", updateDetails });
}


exports.updateMembers = (userID, GroupID, updateDetails) => {
    console.log("Sending group invites", updateDetails);
    io_s.emit('groupMember', { userID, updateDetails });
}



