const jwt = require("jsonwebtoken");
const Group = require("../Models/Group");


let io_s;
exports.groupChatUpdates = (io) => {
    io_s = io;
    io.on("connection", (socket) => {
        socket.on("joinGroupChatRoom", (token, mode, groupID) => {
            try {
                let user;
                if (mode !== "leave") {
                    user = jwt.verify(token, process.env.TOKEN_KEY);
                    if (!user) return socket.disconnect();
                }
                const roomChat = `${groupID}_chatroom`
                switch (mode) {
                    case "update":
                        console.log(`${user.userId} joined their group ${roomChat} chat room.`);
                        socket.join(roomChat);
                        break;
                    case "leave":
                        console.log(`${token} left their group ${roomChat} chat room.`);
                        socket.leave(token);
                        break;
                }
            } catch (error) {
                socket.disconnect();
                console.log(error);
                console.log("Server: Something went wrong updating information to client.");
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
                        const roomChat = `${groupID}_chatroom`
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