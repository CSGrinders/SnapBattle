const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");

let io_s;
exports.groupUpdates = (io, server) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("groupUpdate", (token, mode, groupID) => {
            try {
                const user = jwt.verify(token, process.env.TOKEN_KEY);
                switch (mode) {
                    case "groupsMain":
                        socket.join(user.userId);
                        console.log(`User ${user.userId} joined  their update group main room.`);
                        break;
                    case "groupHome": //Not tested idk if works
                        const groupRoom = `group_${groupID}_user_${user.userId}`;
                        socket.join(groupRoom);
                        console.log(`User ${user.userId} joined ${groupID} group update room.`);
                }
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
