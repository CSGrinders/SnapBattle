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

const Messages = new mongoose.Schema({

});


const MessageModel = mongoose.model("Messages", Messages)

module.exports = {
    Messages: MessageModel
};