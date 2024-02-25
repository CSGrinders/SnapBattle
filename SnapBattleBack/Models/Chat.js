/*
 * Chat.js
 *
 * Defines the schema for Chat and Messages information
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const mongoose = require("mongoose");

const Chat = new mongoose.Schema({
    groupID: {
        type: mongoose.Types.ObjectId,
        required: [true, "A groupID is required"],
        ref: 'Group'
    },
    messages: [{
        type: mongoose.Types.ObjectId,
        ref: 'Messages'
    }]
})

const Messages = new mongoose.Schema({
    time: {
        type: Date,
        default: new Date(),
    },
    content: {
        type: String
    },
    userID: {
        type: mongoose.Types.ObjectId,
        required: [true, "A userID is required"],
        ref: 'User'
    },
    mention: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }]
})


const ChatModel = mongoose.model("Chat", Chat)
const MessageModel = mongoose.model("Messages", Messages)

module.exports = {
    Chat: ChatModel,
    Messages: MessageModel
};