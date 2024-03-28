const jwt = require("jsonwebtoken");
const Group = require("../Models/Group");

const userSocketMap = {};
let group = {};
let io_s;
exports.groupHomeUpdates = (io) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("groupHome", (token, mode, groupID) => {
            try {
                let user;
                if (mode !== "leave") {
                    user = jwt.verify(token, process.env.TOKEN_KEY);
                    if (!user) return socket.disconnect();
                }
                const roomChat = `${groupID}_grouproom`
                switch (mode) {
                    case "update":
                        group[user.userId] = groupID;
                        console.log(`${user.userId} joined their group ${roomChat} group room.`);
                        socket.join(roomChat);
                        userSocketMap[user.userId] = socket.id;
                        if (io.sockets.adapter.rooms.has(roomChat)) {
                            const clients = Array.from(io.sockets.adapter.rooms.get(roomChat));
                            console.log(`Clients in ${roomChat}:`, clients);
                        }
                        break;
                    case "leave":
                        console.log(`${token} left their group ${roomChat} group room.`);
                        socket.leave(roomChat);
                        console.log('Current rooms and clients:');
                        if (io.sockets.adapter.rooms.has(roomChat)) {
                            const clients = Array.from(io.sockets.adapter.rooms.get(roomChat));
                            console.log(`Clients in ${roomChat}:`, clients);
                        }
                        delete group[token];
                        delete userSocketMap[token];
                        break;
                }
            } catch (error) {
                Object.keys(userSocketMap).forEach(userId => {
                    if (userSocketMap[userId] === socket.id) {
                        delete userSocketMap[userId];
                        delete group[userId];
                        console.log(`${userId} disconnected and was removed from their group room.`);
                    }
                });
                socket.disconnect();
            }
        });

        socket.on('sendMessage', (message, groupID) => {
            try {
                let messageToAdd
                if (message.replyMessage) {
                    messageToAdd = {
                        _id: message._id,
                        text: message.text,
                        createdAt: new Date(message.createdAt),
                        user: {
                            _id: message.user._id,
                            name: message.user.name,
                            avatar: message.user.avatar,
                        },
                        replyMessage: {
                            _id: message.replyMessage._id,
                            text: message.replyMessage.text,
                            name: message.replyMessage.name,
                        }
                    };
                } else {
                    messageToAdd = {
                        _id: message._id,
                        text: message.text,
                        createdAt: new Date(message.createdAt),
                        user: {
                            _id: message.user._id,
                            name: message.user.name,
                            avatar: message.user.avatar,
                        },
                    };
                }
                Group.findByIdAndUpdate(
                    groupID,
                    {$push: {messages: messageToAdd}},
                    {new: true, upsert: true}
                )
                    .then(updatedGroup => {
                        const roomChat = `${groupID}_grouproom`
                        socket.broadcast.to(roomChat).emit('message', messageToAdd);
                    })
                    .catch(error => {
                        console.error('Error adding message to group:', error);
                    });
            } catch (error) {
                socket.disconnect();
                console.error('Server: Something went wrong updating information to client.', error);
            }
        });

    })
};

exports.kickUpdateStatus = (userID, otherUserID, groupID) => {
    console.log("Sending update status");
    const socketId = userSocketMap[userID];
    const groupUser = group[userID];
    if (groupID !== groupUser) {
        return
    }
    if (socketId) {
        io_s.to(socketId).emit('groupHome', {kicked: true, userID: userID, otherUserID: otherUserID, groupID: groupID });
    }
}